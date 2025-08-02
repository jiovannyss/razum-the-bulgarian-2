import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the service key from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
    }

    // Create admin client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey)

    console.log('Fixing user competitions...')

    // Update the Brazilian league to be active
    const { error } = await supabase
      .from('user_competitions')
      .update({ is_active: true })
      .eq('user_id', '5e3b3c12-7ce7-4aa8-8370-721bc9dfc379')
      .eq('competition_id', 2013)

    if (error) {
      console.error('Error updating competition:', error)
      throw error
    }

    console.log('Brazilian league set to active successfully')

    const result = {
      success: true,
      message: 'User competitions fixed successfully!'
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in fix-user-competitions function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})