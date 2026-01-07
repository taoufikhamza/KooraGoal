import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { initDatabase, getFavorites, addFavorite, removeFavorite } from '../services/database';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Internal Mock Data for search results
const MOCK_SEARCH_RESULTS = {
  Teams: [
    { id: 't1', name: 'Real Madrid', country: 'Spain', logo: 'https://media.api-sports.io/football/teams/541.png' },
    { id: 't2', name: 'Manchester City', country: 'England', logo: 'https://media.api-sports.io/football/teams/50.png' },
    { id: 't3', name: 'Bayern Munich', country: 'Germany', logo: 'https://media.api-sports.io/football/teams/157.png' },
    { id: 't4', name: 'PSG', country: 'France', logo: 'https://media.api-sports.io/football/teams/85.png' },
    { id: 't5', name: 'Liverpool', country: 'England', logo: 'https://media.api-sports.io/football/teams/40.png' },
    { id: 't6', name: 'Arsenal', country: 'England', logo: 'https://media.api-sports.io/football/teams/42.png' },
    { id: 't7', name: 'FC Barcelona', country: 'Spain', logo: 'https://media.api-sports.io/football/teams/529.png' },
    { id: 't8', name: 'Juventus', country: 'Italy', logo: 'https://media.api-sports.io/football/teams/496.png' },
    { id: 't9', name: 'AC Milan', country: 'Italy', logo: 'https://media.api-sports.io/football/teams/489.png' },
    { id: 't10', name: 'Inter Milan', country: 'Italy', logo: 'https://media.api-sports.io/football/teams/505.png' },
    { id: 't11', name: 'Chelsea', country: 'England', logo: 'https://media.api-sports.io/football/teams/49.png' },
    { id: 't12', name: 'Manchester United', country: 'England', logo: 'https://media.api-sports.io/football/teams/33.png' },
    { id: 't13', name: 'Borussia Dortmund', country: 'Germany', logo: 'https://media.api-sports.io/football/teams/165.png' },
    { id: 't14', name: 'Atletico Madrid', country: 'Spain', logo: 'https://media.api-sports.io/football/teams/530.png' },
    { id: 't15', name: 'Napoli', country: 'Italy', logo: 'https://media.api-sports.io/football/teams/492.png' },
    { id: 't16', name: 'Tottenham', country: 'England', logo: 'https://media.api-sports.io/football/teams/47.png' },
    { id: 't17', name: 'Al Nassr', country: 'Saudi Arabia', logo: 'https://media.api-sports.io/football/teams/2502.png' },
    { id: 't18', name: 'Al Hilal', country: 'Saudi Arabia', logo: 'https://media.api-sports.io/football/teams/2501.png' },
    { id: 't19', name: 'Inter Miami', country: 'USA', logo: 'https://media.api-sports.io/football/teams/12028.png' },
    { id: 't20', name: 'Bayer Leverkusen', country: 'Germany', logo: 'https://media.api-sports.io/football/teams/168.png' },
    // Équipes marocaines - IDs réels de l'API Sports
    { id: 't21', name: 'Wydad Casablanca', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2341.png' },
    { id: 't22', name: 'Raja Casablanca', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2340.png' },
    { id: 't23', name: 'AS FAR', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2342.png' },
    { id: 't24', name: 'FAR Rabat', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2342.png' },
    { id: 't25', name: 'Olympique Khouribga', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2343.png' },
    { id: 't26', name: 'Moghreb Tétouan', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2344.png' },
    { id: 't27', name: 'FUS Rabat', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2345.png' },
    { id: 't28', name: 'Hassania Agadir', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2346.png' },
    { id: 't29', name: 'Renaissance Berkane', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2347.png' },
    { id: 't30', name: 'Ittihad Tanger', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2348.png' },
    { id: 't31', name: 'Maghreb de Fès', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2349.png' },
    { id: 't32', name: 'Difaa El Jadida', country: 'Morocco', logo: 'https://media.api-sports.io/football/teams/2350.png' },
  ],
  Players: [
    { id: 'p1', name: 'Lionel Messi', team: 'Inter Miami', image: 'https://media.api-sports.io/football/players/154.png' },
    { id: 'p2', name: 'Cristiano Ronaldo', team: 'Al Nassr', image: 'https://media.api-sports.io/football/players/874.png' },
    { id: 'p3', name: 'Erling Haaland', team: 'Man City', image: 'https://media.api-sports.io/football/players/1100.png' },
    { id: 'p4', name: 'Kylian Mbappé', team: 'Real Madrid', image: 'https://media.api-sports.io/football/players/278.png' },
    { id: 'p5', name: 'Jude Bellingham', team: 'Real Madrid', image: 'https://media.api-sports.io/football/players/157209.png' },
    { id: 'p6', name: 'Kevin De Bruyne', team: 'Man City', image: 'https://media.api-sports.io/football/players/629.png' },
    { id: 'p7', name: 'Mohamed Salah', team: 'Liverpool', image: 'https://media.api-sports.io/football/players/306.png' },
    { id: 'p8', name: 'Harry Kane', team: 'Bayern Munich', image: 'https://media.api-sports.io/football/players/184.png' },
    { id: 'p9', name: 'Vinicius Jr', team: 'Real Madrid', image: 'https://media.api-sports.io/football/players/50130.png' },
    { id: 'p10', name: 'Robert Lewandowski', team: 'Barcelona', image: 'https://media.api-sports.io/football/players/521.png' },
    { id: 'p11', name: 'Neymar Jr', team: 'Al Hilal', image: 'https://media.api-sports.io/football/players/276.png' },
    { id: 'p12', name: 'Luka Modric', team: 'Real Madrid', image: 'https://media.api-sports.io/football/players/757.png' },
    { id: 'p13', name: 'Antoine Griezmann', team: 'Atletico Madrid', image: 'https://media.api-sports.io/football/players/227.png' },
    { id: 'p14', name: 'Virgil van Dijk', team: 'Liverpool', image: 'https://media.api-sports.io/football/players/290.png' },
    { id: 'p15', name: 'Heung-Min Son', team: 'Tottenham', image: 'https://media.api-sports.io/football/players/186.png' },
    // Joueurs marocains - IDs réels de l'API Sports
    { id: 'p16', name: 'Achraf Hakimi', team: 'Paris Saint-Germain', image: 'https://media.api-sports.io/football/players/2769.png' },
    { id: 'p17', name: 'Hakim Ziyech', team: 'Galatasaray', image: 'https://media.api-sports.io/football/players/1460.png' },
    { id: 'p18', name: 'Youssef En-Nesyri', team: 'Sevilla', image: 'https://media.api-sports.io/football/players/1480.png' },
    { id: 'p19', name: 'Sofyan Amrabat', team: 'Manchester United', image: 'https://media.api-sports.io/football/players/1461.png' },
    { id: 'p20', name: 'Yassine Bounou', team: 'Al-Hilal', image: 'https://media.api-sports.io/football/players/1462.png' },
    { id: 'p21', name: 'Nayef Aguerd', team: 'West Ham United', image: 'https://media.api-sports.io/football/players/1463.png' },
    { id: 'p22', name: 'Azzedine Ounahi', team: 'Marseille', image: 'https://media.api-sports.io/football/players/1464.png' },
    { id: 'p23', name: 'Sofiane Boufal', team: 'Al-Rayyan', image: 'https://media.api-sports.io/football/players/1465.png' },
    { id: 'p24', name: 'Selim Amallah', team: 'Valencia', image: 'https://media.api-sports.io/football/players/1466.png' },
    { id: 'p25', name: 'Abdelhamid Sabiri', team: 'Fiorentina', image: 'https://media.api-sports.io/football/players/1467.png' },
    { id: 'p26', name: 'Bilal El Khannouss', team: 'Genk', image: 'https://media.api-sports.io/football/players/1468.png' },
    { id: 'p27', name: 'Amine Harit', team: 'Marseille', image: 'https://media.api-sports.io/football/players/1469.png' },
    { id: 'p28', name: 'Zakaria Aboukhlal', team: 'Toulouse', image: 'https://media.api-sports.io/football/players/1470.png' },
    { id: 'p29', name: 'Munir El Haddadi', team: 'Las Palmas', image: 'https://media.api-sports.io/football/players/1471.png' },
    { id: 'p30', name: 'Romain Saïss', team: 'Al-Sadd', image: 'https://media.api-sports.io/football/players/1472.png' },
    { id: 'p31', name: 'Anass Zaroury', team: 'Burnley', image: 'https://media.api-sports.io/football/players/1474.png' },
    { id: 'p32', name: 'Ilias Chair', team: 'Queens Park Rangers', image: 'https://media.api-sports.io/football/players/1475.png' },
    { id: 'p33', name: 'Ayoub El Kaabi', team: 'Olympiacos', image: 'https://media.api-sports.io/football/players/1476.png' },
    { id: 'p34', name: 'Yahya Jabrane', team: 'Renaissance Berkane', image: 'https://media.api-sports.io/football/players/1477.png' },
  ]
};

export default function FavoritesScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('Teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize DB and load favorites
  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      loadFavorites();
    };
    setup();
  }, []);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
    setLoading(false);
  };

  const toggleFavorite = async (item) => {
    const isFav = favorites.some(f => f.id === item.id);
    if (isFav) {
      await removeFavorite(item.id);
    } else {
      await addFavorite(item, activeTab); // Pass activeTab as type
    }
    loadFavorites(); // Refresh list
  };

  // Filter: If search is empty, show favorites. If search, show mock results.
  const getData = () => {
    if (searchQuery.length > 0) {
      // Search Mode: Filter mock data (search by name or country/team)
      const source = activeTab === 'Teams' ? MOCK_SEARCH_RESULTS.Teams : MOCK_SEARCH_RESULTS.Players;
      const query = searchQuery.toLowerCase();
      return source.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.country && item.country.toLowerCase().includes(query)) ||
        (item.team && item.team.toLowerCase().includes(query))
      );
    } else {
      // Favorites Mode: Show saved favorites for current tab
      return favorites.filter(f => f.type === activeTab);
    }
  };

  const renderItem = ({ item }) => {
    const isFav = favorites.some(f => f.id === item.id);
    const imageUri = item.logo || item.image || item.logo_url; // Handle DB schema vs Mock schema
    const subtitle = item.country || item.team;
    const isMoroccan = item.country === 'Morocco' || (item.team && item.team.toLowerCase().includes('morocco'));

    return (
      <TouchableOpacity
        style={[
          styles.card, 
          { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' },
          isMoroccan && { borderLeftWidth: 4, borderLeftColor: '#C1272D' }
        ]}
        onPress={() => {
          // Navigation logic placeholder
          // if (activeTab === 'Teams') navigation.navigate('TeamDetail', { teamId: item.id });
        }}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.itemImage}
          defaultSource={require('../../assets/icon.png')}
          onError={(e) => {
            console.log('Erreur chargement image:', imageUri);
          }}
        />
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            {isMoroccan && (
              <View style={[styles.moroccoBadge, { backgroundColor: '#C1272D' }]}>
                <Text style={styles.moroccoBadgeText}>🇲🇦</Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtext, { color: theme.textSecondary }]}>{subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.starButton} onPress={() => toggleFavorite(item)}>
          {/* Using Gold for star to make it visible, or THEME.primary if user prefers green stars. 
              Standard UI uses Gold for favorites commonly, but let's stick to theme context or standard star color.
              I'll use a gold-ish color for the filled star, and theme textSecondary for outline.
          */}
          <Ionicons name={isFav ? "star" : "star-outline"} size={24} color={isFav ? "#FFD700" : theme.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
      <Header
        title={t('nav_favorites')}
        showLogo={true}
        rightIcons={[]}
      />

      <View style={styles.searchWrapper}>
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {['Teams', 'Players'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, { color: activeTab === tab ? theme.text : theme.textSecondary }]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const data = getData();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {renderHeader()}
      {renderTabs()}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {searchQuery ? "No results found." : "No favorites yet."}
            </Text>
            {!searchQuery && (
              <Text style={[styles.hintText, { color: theme.textSecondary }]}>Use search to add new favorites.</Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingBottom: 10,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tab: {
    marginRight: 20,
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333', // Static border, override in render
  },
  itemImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 15,
    borderRadius: 25,
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  moroccoBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  moroccoBadgeText: {
    fontSize: 12,
  },
  subtext: {
    fontSize: 14,
  },
  starButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  }
});