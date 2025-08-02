import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { offerId, promoCode } = await req.json();

    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the coin offer
    const { data: offer, error: offerError } = await supabaseClient
      .from("coin_offers")
      .select("*")
      .eq("id", offerId)
      .eq("is_active", true)
      .single();

    if (offerError || !offer) {
      throw new Error("Offer not found or inactive");
    }

    // Check if offer is still valid
    if (new Date(offer.end_date) < new Date()) {
      throw new Error("Offer has expired");
    }

    let finalPrice = offer.offer_price;
    let discountAmount = 0;
    let appliedPromo = null;

    // Apply promo code if provided
    if (promoCode) {
      const { data: promo, error: promoError } = await supabaseClient
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (!promoError && promo) {
        // Check if promo is still valid
        if (!promo.expires_at || new Date(promo.expires_at) > new Date()) {
          // Check usage limits
          if (!promo.max_uses || promo.current_uses < promo.max_uses) {
            // Check minimum purchase amount
            if (finalPrice >= promo.min_purchase_amount) {
              appliedPromo = promo;
              
              if (promo.discount_type === 'percentage') {
                discountAmount = (finalPrice * promo.discount_value) / 100;
              } else if (promo.discount_type === 'fixed') {
                discountAmount = Math.min(promo.discount_value, finalPrice);
              }
              
              finalPrice = Math.max(finalPrice - discountAmount, 0);
            }
          }
        }
      }
    }

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: "eur",
          product_data: { 
            name: offer.title,
            description: offer.description || `${offer.coin_amount} coins`
          },
          unit_amount: Math.round(finalPrice * 100), // Convert to cents
        },
        quantity: 1,
      }
    ];

    // Add discount line if promo code was applied
    if (appliedPromo && discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `Promo Code: ${appliedPromo.code}`,
            description: `${appliedPromo.discount_type === 'percentage' ? appliedPromo.discount_value + '%' : '€' + appliedPromo.discount_value} discount`
          },
          unit_amount: -Math.round(discountAmount * 100), // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/my-wallet?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/my-wallet?payment=cancelled`,
      metadata: {
        user_id: user.id,
        offer_id: offerId,
        coin_amount: offer.coin_amount.toString(),
        promo_code: appliedPromo?.code || "",
        original_price: offer.offer_price.toString(),
        final_price: finalPrice.toString(),
      },
    });

    // If promo code was applied, increment its usage
    if (appliedPromo) {
      await supabaseClient
        .from("promo_codes")
        .update({ current_uses: appliedPromo.current_uses + 1 })
        .eq("id", appliedPromo.id);
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      appliedPromo: appliedPromo ? {
        code: appliedPromo.code,
        discount: discountAmount,
        type: appliedPromo.discount_type
      } : null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});