// Test sync function to update form data - updated version
async function testSyncFixed() {
  try {
    console.log('🔄 Стартиране на обновена синхронизация...');
    
    const response = await fetch('https://dzicbnwzqjmvkoamwwuv.supabase.co/functions/v1/sync-football-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6aWNibnd6cWptdmtvYW13d3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NjI4NDcsImV4cCI6MjA2OTUzODg0N30.AzbX7lrvmUgeKKHctcB4D2QOysy597OeMBnHPRhJU_U'
      },
      body: JSON.stringify({
        syncType: 'standings'  // Само класирания за да обновим формата
      })
    });

    const result = await response.json();
    console.log('✅ Резултат от обновена синхронизация:', result);
    
    if (result.success) {
      console.log(`🎉 Синхронизацията завърши успешно! Обработени ${result.recordsProcessed} записа от ${result.competitions} турнира`);
    } else {
      console.error('❌ Грешка при синхронизация:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Грешка:', error);
  }
}

// Стартиране на обновения тест
testSyncFixed();