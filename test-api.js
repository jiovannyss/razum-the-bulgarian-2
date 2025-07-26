// Тест на Football-Data.org API за Бразилски шампионат
const corsProxy = 'https://corsproxy.io/?';
const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '4c0b967130864749a36fb552c0755910';

async function testBrazilianLeague() {
    try {
        console.log('🔍 Testing Football-Data.org API...');
        
        // Първо получаваме всички състезания
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
        console.log('🏆 Available competitions:', competitionsData.competitions.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            plan: c.plan
        })));
        
        // Намираме бразилския шампионат
        const brasileirao = competitionsData.competitions.find(c => 
            c.name.includes('Brasileiro') || c.code === 'BSA'
        );
        
        if (!brasileirao) {
            console.log('❌ Бразилски шампионат не е намерен');
            return;
        }
        
        console.log('🇧🇷 Намерен бразилски шампионат:', brasileirao);
        
        // Получаваме мачовете за 21-ви кръг
        const matchesUrl = `${corsProxy}${encodeURIComponent(baseUrl + `/competitions/${brasileirao.id}/matches?matchday=21`)}`;
        const matchesResponse = await fetch(matchesUrl, {
            headers: {
                'X-Auth-Token': apiKey,
                'Content-Type': 'application/json',
            },
        });
        
        if (!matchesResponse.ok) {
            throw new Error(`Matches API failed: ${matchesResponse.status}`);
        }
        
        const matchesData = await matchesResponse.json();
        console.log('⚽ Мачове от 21-ви кръг:', matchesData.matches.map(m => ({
            id: m.id,
            homeTeam: m.homeTeam.name,
            awayTeam: m.awayTeam.name,
            utcDate: m.utcDate,
            matchday: m.matchday,
            status: m.status
        })));
        
        return matchesData.matches;
        
    } catch (error) {
        console.error('❌ API Грешка:', error);
        throw error;
    }
}

// Изпълняваме теста
testBrazilianLeague();