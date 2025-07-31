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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY')
    
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_KEY is not configured')
    }

    // Create admin client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey)

    console.log('Creating super admin user...')

    // Admin credentials
    const ADMIN_EMAIL = 'admin@razum.bg'
    const ADMIN_PASSWORD = 'SuperAdmin123!'
    const ADMIN_NAME = 'Супер Администратор'
    const ADMIN_USERNAME = 'superadmin'

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_NAME,
        username: ADMIN_USERNAME
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      throw authError
    }

    console.log('Auth user created:', authData.user.email)

    // 2. Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError)
    }

    if (!profile) {
      // Create profile manually
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          username: ADMIN_USERNAME,
          full_name: ADMIN_NAME
        })

      if (insertProfileError) {
        console.error('Error creating profile:', insertProfileError)
        throw insertProfileError
      }
      console.log('Profile created manually')
    } else {
      console.log('Profile already exists')
    }

    // 3. Set super_admin role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id)

    if (roleCheckError) {
      console.error('Error checking role:', roleCheckError)
      throw roleCheckError
    }

    if (existingRole && existingRole.length > 0) {
      // Update to super_admin
      const { error: updateRoleError } = await supabase
        .from('user_roles')
        .update({ role: 'super_admin' })
        .eq('user_id', authData.user.id)

      if (updateRoleError) {
        console.error('Error updating role:', updateRoleError)
        throw updateRoleError
      }
      console.log('Role updated to super_admin')
    } else {
      // Create new role
      const { error: insertRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'super_admin'
        })

      if (insertRoleError) {
        console.error('Error creating role:', insertRoleError)
        throw insertRoleError
      }
      console.log('Super_admin role created')
    }

    // 4. Create test matches
    console.log('Creating test matches...')
    
    const testMatches = [
      {
        home_team: 'Левски',
        away_team: 'ЦСКА',
        competition: 'efbet Лига',
        match_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        admin_rating: 5
      },
      {
        home_team: 'Лудогорец',
        away_team: 'Ботев Пловдив',
        competition: 'efbet Лига',
        match_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        admin_rating: 4
      },
      {
        home_team: 'Барселона',
        away_team: 'Реал Мадрид',
        competition: 'La Liga',
        match_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        admin_rating: 5
      }
    ]

    const { error: matchesError } = await supabase
      .from('matches')
      .insert(testMatches)

    if (matchesError) {
      console.error('Error creating test matches:', matchesError)
      // Don't throw here, matches are not critical
    } else {
      console.log('Test matches created successfully')
    }

    const result = {
      success: true,
      message: 'Super admin created successfully!',
      admin: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'super_admin'
      },
      matchesCreated: !matchesError
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in create-super-admin function:', error)
    
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