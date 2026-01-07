import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY || process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
const API_HOST = 'v3.football.api-sports.io';
const BASE_URL = 'https://v3.football.api-sports.io';

// Configuration Axios
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'x-apisports-key': API_KEY,
    },
    timeout: 10000, // 10sec
});

// Cache systeme 
const checkCache = async (key, ttlInSeconds) => {
    try {
        const cached = await AsyncStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const age = (now - timestamp) / 1000;

        if (age < ttlInSeconds) {
            console.log(`Recuperation cache ${key}`);
            return data;
        } else {
            await AsyncStorage.removeItem(key);
            return null;
        }
    } catch (e) {
        return null;
    }
};

const setCache = async (key, data) => {
    try {
        const payload = JSON.stringify({ data, timestamp: Date.now() });
        await AsyncStorage.setItem(key, payload);
    } catch (e) {
        console.error("Erreur du cache", e);
    }
};

// Fetch avec usage de cache pour economiser l'api
const fetchFromApi = async (endpoint, params = {}, ttl = 300) => {
    const queryString = new URLSearchParams(params).toString();
    const cacheKey = `${endpoint}?${queryString}`;

    // Verification du cache
    const cachedData = await checkCache(cacheKey, ttl);
    if (cachedData) return cachedData;

    // pas de cache =  fetch API
    try {
        console.log(`Appel API: ${endpoint}`, params);
        console.log(`Utilisation de la clé: ${API_KEY ? (API_KEY.substring(0, 5) + '...') : 'NON DEFINIE'}`);
        const response = await apiClient.get(endpoint, { params });
        console.log(`Statut de la réponse ${endpoint}: ${response.status}`);

        const data = response.data.response;

        if (data) {
            await setCache(cacheKey, data);
            return data;
        }
        return [];
    } catch (error) {
        console.error(`Erreur ${endpoint}:`, error.message);
        if (error.response) {
            console.error("Détails de l'erreur API:", JSON.stringify(error.response.data, null, 2));
        }
        return [];
    }
};



export const getLiveMatches = async () => {
    const data = await fetchFromApi('fixtures', { live: 'all' }, 60);
    return data.map(match => ({
        id: match.fixture.id.toString(),
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        score: `${match.goals.home ?? 0} - ${match.goals.away ?? 0}`,
        time: `${match.fixture.status.elapsed}'`,
        status: 'Live',
        league: match.league.name,
        homeLogo: match.teams.home.logo,
        awayLogo: match.teams.away.logo,
        leagueLogo: match.league.logo
    }));
};

export const getMatchesByDate = async (date) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = date === today;
    const ttl = isToday ? 60 : 3600;

    const data = await fetchFromApi('fixtures', { date: date }, ttl);

    return data.map(match => ({
        id: match.fixture.id.toString(),
        league: {
            id: match.league.id,
            name: match.league.name,
            logo: match.league.logo
        },
        teams: {
            home: { name: match.teams.home.name, logo: match.teams.home.logo },
            away: { name: match.teams.away.name, logo: match.teams.away.logo }
        },
        goals: {
            home: match.goals.home,
            away: match.goals.away
        },
        fixture: {
            status: { short: match.fixture.status.short, elapsed: match.fixture.status.elapsed },
            date: match.fixture.date,
            time: new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    }));
};

export const getUpcomingMatches = async () => {
    const data = await fetchFromApi('fixtures', { next: '20' }, 1800);
    return data.map(match => {
        const date = new Date(match.fixture.date);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
            id: match.fixture.id.toString(),
            homeTeam: match.teams.home.name,
            awayTeam: match.teams.away.name,
            time: timeString,
            status: 'Upcoming',
            league: match.league.name,
            homeLogo: match.teams.home.logo,
            awayLogo: match.teams.away.logo,
            leagueLogo: match.league.logo
        };
    });
};


export const getTeamDetails = async (teamId) => {
    const teamData = await fetchFromApi('teams', { id: teamId }, 86400);
    const squadData = await fetchFromApi('players/squad', { team: teamId }, 86400);

    if (!teamData[0]) return null;

    const team = teamData[0].team;
    const venue = teamData[0].venue;
    const squadRaw = squadData[0]?.players || [];

    const groupedSquad = [
        { title: 'Goalkeepers', data: squadRaw.filter(p => p.position === 'Goalkeeper') },
        { title: 'Defenders', data: squadRaw.filter(p => p.position === 'Defender') },
        { title: 'Midfielders', data: squadRaw.filter(p => p.position === 'Midfielder') },
        { title: 'Forwards', data: squadRaw.filter(p => p.position === 'Attacker') },
    ].map(section => ({
        ...section,
        data: section.data.map(p => ({
            id: p.id.toString(),
            name: p.name,
            number: p.number || '-',
            image: p.photo,
            rating: '-'
        }))
    }));

    return {
        id: team.id.toString(),
        name: team.name,
        country: team.country,
        logo: team.logo,
        stadium: venue.name,
        squad: groupedSquad
    };
};

export const getNews = async () => {
    // Mock data for news since there is no news endpoint in api-sports free plan
    try {
        console.log("Appel getNews : Chargement des actualités...");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading

        return [
            {
                id: '1',
                title: "Exclusif : Les coulisses de l'entraînement des champions",
                image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '1h • KooraGoal',
                source: 'KooraGoal',
                category: 'Latest'
            },
            {
                id: '2',
                title: "Infrastructures : Le temple du football prêt pour le choc",
                image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '2h • UEFA',
                source: 'UEFA',
                category: 'Latest'
            },
            {
                id: '3',
                title: "Ligue des Champions : Une soirée de football sous les projecteurs",
                image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '4h • UEFA',
                source: 'UEFA',
                category: 'Latest'
            },
            {
                id: '4',
                title: "San Siro : L'ambiance électrique des grands soirs à Milan",
                image: 'https://images.pexels.com/photos/3042755/pexels-photo-3042755.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '6h • Milan News',
                source: 'Milan News',
                category: 'Serie A'
            },
            {
                id: '5',
                title: "Supporters : Le douzième homme, l'âme du football",
                image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '12h • UltraWorld',
                source: 'UltraWorld',
                category: 'Latest'
            },
            {
                id: '6',
                title: "Technique : Le secret d'une frappe de balle parfaite",
                image: 'https://images.pexels.com/photos/3042755/pexels-photo-3042755.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '14h • CoachCorner',
                source: 'CoachCorner',
                category: 'Latest'
            },
            {
                id: '7',
                title: "Mercato : Les transferts s'accélèrent à travers l'Europe",
                image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '18h • SportsWorld',
                source: 'SportsWorld',
                category: 'Latest'
            },
            {
                id: '8',
                title: "Stades : Immersion au cœur de la ferveur européenne",
                image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '1d • StadiumNews',
                source: 'StadiumNews',
                category: 'Leagues'
            },
            {
                id: '9',
                title: "Architecture : Les nouveaux temples du football moderne",
                image: 'https://images.pexels.com/photos/3042755/pexels-photo-3042755.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '2d • ArchFoot',
                source: 'ArchFoot',
                category: 'Leagues'
            },
            {
                id: '10',
                title: "Transfert record : Un joueur star rejoint la Premier League",
                image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '3h • TransferMarket',
                source: 'TransferMarket',
                category: 'Transfers'
            },
            {
                id: '11',
                title: "Mercato : Accord trouvé pour un attaquant international",
                image: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '5h • FootTransfer',
                source: 'FootTransfer',
                category: 'Transfers'
            },
            {
                id: '12',
                title: "Rumeurs : Un milieu de terrain convoité par trois clubs",
                image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '7h • MercatoNews',
                source: 'MercatoNews',
                category: 'Transfers'
            },
            {
                id: '13',
                title: "Transfert confirmé : Un gardien rejoint la Serie A",
                image: 'https://images.pexels.com/photos/3042755/pexels-photo-3042755.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '9h • CalcioTransfer',
                source: 'CalcioTransfer',
                category: 'Transfers'
            },
            {
                id: '14',
                title: "Mercato : Un défenseur signe pour 50 millions d'euros",
                image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=600',
                time: '11h • TransferWorld',
                source: 'TransferWorld',
                category: 'Transfers'
            }
        ];
    } catch (e) {
        console.error("Error in getNews:", e);
        return [];
    }
};
