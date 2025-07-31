// Script за създаване на първия super admin потребител
// Този script трябва да се изпълни веднъж след създаването на database schema

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dzicbnwzqjmvkoamwwuv.supabase.co";
const SUPABASE_SERVICE_KEY = "ТРЯБВА_ДА_СЕ_ЗАДАДЕ_SERVICE_KEY"; // Service role key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createSuperAdmin() {
  try {
    console.log('Създаване на супер администратор...');
    
    // Променете тези данни с желаните за супер админа
    const ADMIN_EMAIL = 'admin@razum.bg';
    const ADMIN_PASSWORD = 'SuperAdmin123!';
    const ADMIN_NAME = 'Супер Администратор';
    const ADMIN_USERNAME = 'superadmin';

    // 1. Създаване на auth потребител
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: ADMIN_NAME,
        username: ADMIN_USERNAME
      }
    });

    if (authError) {
      console.error('Грешка при създаване на auth потребител:', authError);
      return;
    }

    console.log('Auth потребител създаден:', authData.user.email);

    // 2. Проверяваме дали профилът е създаден автоматично от trigger
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Грешка при проверка на профил:', profileError);
    }

    if (!profile) {
      // Ако няма профил, създаваме го ръчно
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          username: ADMIN_USERNAME,
          full_name: ADMIN_NAME
        });

      if (insertProfileError) {
        console.error('Грешка при създаване на профил:', insertProfileError);
        return;
      }
      console.log('Профил създаден ръчно');
    } else {
      console.log('Профил вече съществува');
    }

    // 3. Проверяваме дали ролята е зададена автоматично от trigger
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', authData.user.id);

    if (roleCheckError) {
      console.error('Грешка при проверка на роля:', roleCheckError);
      return;
    }

    if (existingRole && existingRole.length > 0) {
      // Обновяваме ролята до super_admin
      const { error: updateRoleError } = await supabase
        .from('user_roles')
        .update({ role: 'super_admin' })
        .eq('user_id', authData.user.id);

      if (updateRoleError) {
        console.error('Грешка при обновяване на роля:', updateRoleError);
        return;
      }
      console.log('Роля обновена до super_admin');
    } else {
      // Създаваме нова роля
      const { error: insertRoleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'super_admin'
        });

      if (insertRoleError) {
        console.error('Грешка при създаване на роля:', insertRoleError);
        return;
      }
      console.log('Роля super_admin създадена');
    }

    // 4. Създаваме няколко тестови мача за демонстрация
    console.log('Създаване на тестови мачове...');
    
    const testMatches = [
      {
        home_team: 'Левски',
        away_team: 'ЦСКА',
        competition: 'efbet Лига',
        match_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // След 7 дни
        status: 'scheduled',
        admin_rating: 5
      },
      {
        home_team: 'Лудогорец',
        away_team: 'Ботев Пловдив',
        competition: 'efbet Лига',
        match_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // След 3 дни
        status: 'scheduled',
        admin_rating: 4
      },
      {
        home_team: 'Барселона',
        away_team: 'Реал Мадрид',
        competition: 'La Liga',
        match_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // След 14 дни
        status: 'scheduled',
        admin_rating: 5
      }
    ];

    const { error: matchesError } = await supabase
      .from('matches')
      .insert(testMatches);

    if (matchesError) {
      console.error('Грешка при създаване на тестови мачове:', matchesError);
    } else {
      console.log('Тестови мачове създадени успешно');
    }

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  УСПЕШНО СЪЗДАДЕН СУПЕР АДМИН                ║
╠══════════════════════════════════════════════════════════════╣
║  Email: ${ADMIN_EMAIL.padEnd(48)} ║
║  Password: ${ADMIN_PASSWORD.padEnd(44)} ║
║  Роля: super_admin                                           ║
║                                                              ║
║  Можете да влезете в админ панела на: /admin                 ║
╚══════════════════════════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error('Неочаквана грешка:', error);
  }
}

// Стартиране на script-а
createSuperAdmin();

export { createSuperAdmin };