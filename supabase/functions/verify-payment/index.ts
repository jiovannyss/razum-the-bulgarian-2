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
    const { sessionId } = await req.json();

    // Create Supabase client using service role key for database updates
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const userId = session.metadata?.user_id;
      const coinAmount = parseInt(session.metadata?.coin_amount || "0");
      const promoCode = session.metadata?.promo_code;

      if (!userId || !coinAmount) {
        throw new Error("Invalid session metadata");
      }

      // Get user's wallet
      const { data: wallet, error: walletError } = await supabaseClient
        .from("wallets")
        .select("id, balance")
        .eq("user_id", userId)
        .single();

      if (walletError || !wallet) {
        throw new Error("User wallet not found");
      }

      // Update wallet balance
      const { error: updateError } = await supabaseClient
        .from("wallets")
        .update({ balance: wallet.balance + coinAmount })
        .eq("id", wallet.id);

      if (updateError) {
        throw new Error("Failed to update wallet balance");
      }

      // Create transaction record
      const description = `Coin purchase - ${coinAmount} coins${promoCode ? ` (Promo: ${promoCode})` : ""}`;
      const { error: transactionError } = await supabaseClient
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          amount: coinAmount,
          transaction_type: "purchase",
          description,
          reference_id: sessionId,
        });

      if (transactionError) {
        console.error("Transaction recording failed:", transactionError);
        // Don't fail the payment verification if transaction recording fails
      }

      return new Response(JSON.stringify({ 
        success: true,
        coinAmount,
        newBalance: wallet.balance + coinAmount
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      throw new Error("Payment not completed");
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});