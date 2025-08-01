// Test script to check Botafogo FR form data from API
const baseUrl = 'https://api.football-data.org/v4';
const corsProxy = 'https://corsproxy.io/?';
const apiKey = '4c0b967130864749a36fb552c0755910';

async function testBotafogoForm() {
  try {
    console.log('🔍 Testing Botafogo FR form data...');
    
    // Botafogo FR team ID from database
    const teamId = 1770;
    
    // Get last 10 finished matches for Botafogo FR
    const url = `${corsProxy}${encodeURIComponent(baseUrl + `/teams/${teamId}/matches?limit=10&status=FINISHED`)}`;
    
    console.log('Making API request to:', url);
    
    const response = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', data);
    
    if (data.matches && data.matches.length > 0) {
      console.log('\n📊 Last 10 matches for Botafogo FR:');
      
      const form = [];
      
      data.matches.slice(0, 5).forEach((match, index) => {
        const isHome = match.homeTeam.id === teamId;
        const homeScore = match.score.fullTime.home;
        const awayScore = match.score.fullTime.away;
        
        let result;
        if (isHome) {
          if (match.score.winner === 'HOME_TEAM') result = 'W';
          else if (match.score.winner === 'AWAY_TEAM') result = 'L';
          else result = 'D';
        } else {
          if (match.score.winner === 'AWAY_TEAM') result = 'W';
          else if (match.score.winner === 'HOME_TEAM') result = 'L';
          else result = 'D';
        }
        
        form.push(result);
        
        console.log(`${index + 1}. ${match.utcDate.split('T')[0]} - ${match.homeTeam.name} ${homeScore}-${awayScore} ${match.awayTeam.name} [${isHome ? 'HOME' : 'AWAY'}] -> ${result}`);
      });
      
      console.log('\n🏆 Form (last 5 matches):', form.join(''));
      console.log('🎨 Colors would be:', form.map(r => {
        if (r === 'W') return 'GREEN';
        if (r === 'L') return 'RED';
        if (r === 'D') return 'YELLOW';
        return 'GRAY';
      }).join(', '));
      
    } else {
      console.log('❌ No matches found for Botafogo FR');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testBotafogoForm();