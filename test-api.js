// Тест на Football-Data.org API - проверка на новия план
const corsProxy = 'https://corsproxy.io/?';
const baseUrl = 'https://api.football-data.org/v4';
const apiKey = '4c0b967130864749a36fb552c0755910';

async function testNewApiPlan() {
    try {
        console.log('🔍 Testing NEW Football-Data.org API plan...');
        
        // Получаваме всички състезания с новия план
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
        console.log('🏆 ALL Available competitions with NEW plan:');
        competitionsData.competitions.forEach(c => {
            console.log(`- ${c.name} (${c.code}) - Area: ${c.area.name} - Plan: ${c.plan}`);
        });
        
        // Сравняваме с текущите в базата
        const currentInDB = [
            { id: 2002, name: 'Bundesliga', code: 'BL1', area: 'Germany' },
            { id: 2013, name: 'Campeonato Brasileiro Série A', code: 'BSA', area: 'Brazil' },
            { id: 2016, name: 'Championship', code: 'ELC', area: 'England' },
            { id: 2003, name: 'Eredivisie', code: 'DED', area: 'Netherlands' },
            { id: 2018, name: 'European Championship', code: 'EC', area: 'Europe' },
            { id: 2000, name: 'FIFA World Cup', code: 'WC', area: 'World' },
            { id: 2015, name: 'Ligue 1', code: 'FL1', area: 'France' },
            { id: 2021, name: 'Premier League', code: 'PL', area: 'England' },
            { id: 2017, name: 'Primeira Liga', code: 'PPL', area: 'Portugal' },
            { id: 2014, name: 'Primera Division', code: 'PD', area: 'Spain' },
            { id: 2019, name: 'Serie A', code: 'SA', area: 'Italy' },
            { id: 2001, name: 'UEFA Champions League', code: 'CL', area: 'Europe' }
        ];
        
        console.log('\n📊 COMPARISON - Current in DB vs NEW API:');
        console.log('Current competitions in database:', currentInDB.length);
        console.log('Available competitions from API:', competitionsData.competitions.length);
        
        // Намираме новите competitions
        const newCompetitions = competitionsData.competitions.filter(apiComp => 
            !currentInDB.some(dbComp => dbComp.id === apiComp.id)
        );
        
        console.log('\n🆕 NEW competitions available:');
        if (newCompetitions.length > 0) {
            newCompetitions.forEach(c => {
                console.log(`+ ${c.name} (${c.code}) - Area: ${c.area.name} - Plan: ${c.plan} - ID: ${c.id}`);
            });
        } else {
            console.log('No new competitions found.');
        }
        
        // Намираме премахнатите competitions
        const removedCompetitions = currentInDB.filter(dbComp =>
            !competitionsData.competitions.some(apiComp => apiComp.id === dbComp.id)
        );
        
        console.log('\n❌ REMOVED competitions:');
        if (removedCompetitions.length > 0) {
            removedCompetitions.forEach(c => {
                console.log(`- ${c.name} (${c.code}) - Area: ${c.area}`);
            });
        } else {
            console.log('No competitions removed.');
        }
        
        return {
            total: competitionsData.competitions.length,
            new: newCompetitions,
            removed: removedCompetitions,
            all: competitionsData.competitions
        };
        
    } catch (error) {
        console.error('❌ API Грешка:', error);
        throw error;
    }
}

// Изпълняваме теста
testNewApiPlan();