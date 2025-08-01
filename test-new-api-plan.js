// Тест за проверка на новия план на Football-Data.org API
const corsProxy = 'https://corsproxy.io/?';
const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '4c0b967130864749a36fb552c0755910';

async function testNewApiFeatures() {
    try {
        console.log('🔍 Testing NEW Football-Data.org API features...');
        
        // 1. Получаваме всички състезания
        console.log('\n📋 1. Getting ALL competitions...');
        const competitionsUrl = `${corsProxy}${encodeURIComponent(baseUrl + '/competitions')}`;
        const competitionsResponse = await fetch(competitionsUrl, {
            headers: {
                'X-Auth-Token': apiKey,
                'Content-Type': 'application/json',
            },
        });
        
        if (!competitionsResponse.ok) {
            throw new Error(`Competitions API failed: ${competitionsResponse.status}`);
        }
        
        const competitionsData = await competitionsResponse.json();
        console.log('🏆 Total competitions available:', competitionsData.competitions.length);
        
        // Анализ на структурата на competition
        if (competitionsData.competitions.length > 0) {
            const sampleCompetition = competitionsData.competitions[0];
            console.log('\n📊 Sample competition structure:');
            console.log(JSON.stringify(sampleCompetition, null, 2));
        }
        
        // 2. Проверяваме за нови полета в competitions
        const competitionFields = competitionsData.competitions.length > 0 ? 
            Object.keys(competitionsData.competitions[0]) : [];
        console.log('\n🔍 Competition fields:', competitionFields);
        
        // 3. Тестваме teams API за един турнир
        console.log('\n👥 2. Testing teams API...');
        const premierLeague = competitionsData.competitions.find(c => c.code === 'PL');
        if (premierLeague) {
            const teamsUrl = `${corsProxy}${encodeURIComponent(baseUrl + `/competitions/${premierLeague.id}/teams`)}`;
            const teamsResponse = await fetch(teamsUrl, {
                headers: {
                    'X-Auth-Token': apiKey,
                    'Content-Type': 'application/json',
                },
            });
            
            if (teamsResponse.ok) {
                const teamsData = await teamsResponse.json();
                console.log('✅ Teams count for Premier League:', teamsData.teams?.length || 0);
                
                if (teamsData.teams?.length > 0) {
                    console.log('\n📊 Sample team structure:');
                    console.log(JSON.stringify(teamsData.teams[0], null, 2));
                    
                    const teamFields = Object.keys(teamsData.teams[0]);
                    console.log('\n🔍 Team fields:', teamFields);
                }
            } else {
                console.log('❌ Teams API failed:', teamsResponse.status);
            }
        }
        
        // 4. Тестваме matches API
        console.log('\n⚽ 3. Testing matches API...');
        if (premierLeague) {
            const matchesUrl = `${corsProxy}${encodeURIComponent(baseUrl + `/competitions/${premierLeague.id}/matches?matchday=1`)}`;
            const matchesResponse = await fetch(matchesUrl, {
                headers: {
                    'X-Auth-Token': apiKey,
                    'Content-Type': 'application/json',
                },
            });
            
            if (matchesResponse.ok) {
                const matchesData = await matchesResponse.json();
                console.log('✅ Matches count for PL GW1:', matchesData.matches?.length || 0);
                
                if (matchesData.matches?.length > 0) {
                    console.log('\n📊 Sample match structure:');
                    console.log(JSON.stringify(matchesData.matches[0], null, 2));
                    
                    const matchFields = Object.keys(matchesData.matches[0]);
                    console.log('\n🔍 Match fields:', matchFields);
                }
            } else {
                console.log('❌ Matches API failed:', matchesResponse.status);
            }
        }
        
        // 5. Тестваме standings API
        console.log('\n📊 4. Testing standings API...');
        if (premierLeague) {
            const standingsUrl = `${corsProxy}${encodeURIComponent(baseUrl + `/competitions/${premierLeague.id}/standings`)}`;
            const standingsResponse = await fetch(standingsUrl, {
                headers: {
                    'X-Auth-Token': apiKey,
                    'Content-Type': 'application/json',
                },
            });
            
            if (standingsResponse.ok) {
                const standingsData = await standingsResponse.json();
                console.log('✅ Standings table length:', standingsData.standings?.[0]?.table?.length || 0);
                
                if (standingsData.standings?.[0]?.table?.length > 0) {
                    console.log('\n📊 Sample standing structure:');
                    console.log(JSON.stringify(standingsData.standings[0].table[0], null, 2));
                    
                    const standingFields = Object.keys(standingsData.standings[0].table[0]);
                    console.log('\n🔍 Standing fields:', standingFields);
                }
            } else {
                console.log('❌ Standings API failed:', standingsResponse.status);
            }
        }
        
        console.log('\n✅ API test completed!');
        
    } catch (error) {
        console.error('❌ API Test Error:', error);
        throw error;
    }
}

// Изпълняваме теста
testNewApiFeatures();