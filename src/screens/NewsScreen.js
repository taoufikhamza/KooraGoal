import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    ScrollView,
    ImageBackground,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getNews } from '../services/api';
import Header from '../components/Header';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

const CATEGORIES = ['For you', 'Latest', 'Transfers', 'Leagues'];
const FALLBACK_IMAGE = 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function NewsScreen({ navigation }) {
    const { theme, isDarkMode } = useTheme();
    const { t } = useLanguage();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Latest');
    const [filteredNews, setFilteredNews] = useState([]);

    // Category Display Mapping
    const getCategoryLabel = (cat) => {
        const map = {
            'For you': 'cat_for_you',
            'Latest': 'cat_latest',
            'Transfers': 'cat_transfers',
            'Leagues': 'cat_leagues'
        };
        return t(map[cat] || 'cat_latest');
    };

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const data = await getNews();
                setNews(data);
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        let result = news;

        // Filter by Category
        if (activeCategory === 'Leagues') {
            const leagueCategories = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'MLS', 'Saudi Pro League', 'Brasileirao', 'Championship'];
            result = result.filter(item => leagueCategories.includes(item.category));
        } else if (activeCategory !== 'For you') {
            result = result.filter(item => item.category === activeCategory);
        }

        // Filter by Search
        if (searchQuery) {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredNews(result);
    }, [activeCategory, news, searchQuery]);

    const renderHeader = () => (
        <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
            <Header
                showLogo={true}
                rightIcons={[
                    {
                        name: "magnify",
                        onPress: () => setSearchVisible(!searchVisible)
                    }
                ]}
            />

            {searchVisible && (
                <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder={t('search_news')}
                        placeholderTextColor={theme.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus={true}
                    />
                </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                {CATEGORIES.map((cat, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.tabItem,
                            { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' },
                            activeCategory === cat && { backgroundColor: theme.primary, borderColor: theme.primary }
                        ]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: theme.textSecondary },
                            activeCategory === cat && { color: '#000', fontWeight: 'bold' } // Active text black on bright primary
                        ]}>{getCategoryLabel(cat)}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderHeroCard = (item) => {
        if (!item) return null;
        return (
            <TouchableOpacity style={[styles.heroCard, { backgroundColor: theme.card }]} activeOpacity={0.9}>
                <ImageBackground
                    source={{ uri: item.image || FALLBACK_IMAGE }}
                    style={styles.heroImage}
                    imageStyle={{ borderRadius: 16 }}
                    resizeMode="cover"
                    defaultSource={require('../../assets/icon.png')} // Fallback while loading
                    onError={(e) => {
                        console.error(`Erreur chargement image Hero (${item.title}):`, e.nativeEvent.error);
                    }}
                >
                    <View style={styles.heroOverlay}>
                        <Text style={[styles.heroTitle, { color: '#FFF' }]} numberOfLines={3}>{item.title}</Text>
                        <Text style={[styles.heroTime, { color: '#EEE' }]}>{item.time}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    }

    const renderNewsItem = ({ item }) => (
        <TouchableOpacity style={[styles.newsItem, { backgroundColor: theme.card }]} activeOpacity={0.7}>
            {/* Added backgroundColor to see frame if image fails */}
            <Image
                source={{ uri: item.image || FALLBACK_IMAGE }}
                style={[styles.newsThumb, { backgroundColor: theme.card }]}
                resizeMode="cover"
                defaultSource={require('../../assets/icon.png')}
                onError={(e) => {
                    console.error(`Erreur chargement vignette (${item.title}):`, e.nativeEvent.error);
                }}
            />
            <View style={styles.newsContent}>
                <Text style={[styles.newsTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                <View style={styles.newsMeta}>
                    <Text style={[styles.newsTime, { color: theme.textSecondary }]}>{item.time} • {item.source}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    // Split content into Hero (first item) and List (rest)
    const heroItem = filteredNews.length > 0 ? filteredNews[0] : null;
    const listItems = filteredNews.length > 1 ? filteredNews.slice(1) : [];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />
            {renderHeader()}

            <FlatList
                data={listItems}
                keyExtractor={(item) => item.id}
                renderItem={renderNewsItem}
                ListHeaderComponent={() => (
                    <View style={{ marginBottom: 20 }}>
                        {renderHeroCard(heroItem)}
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.center}>
                        <Text style={{ color: theme.textSecondary }}>{t('no_news_found')}</Text>
                    </View>
                )}
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
    topBar: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    headerLogo: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
    },
    tabsContainer: {
        paddingLeft: 20,
    },
    tabItem: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    activeTabItem: {
        // Handled inline for dynamic theme
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
    },
    // HERO CARD
    heroCard: {
        height: 250,
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    heroOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
        lineHeight: 24,
    },
    heroTime: {
        fontSize: 12,
    },
    // NEWS ITEM
    newsItem: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 12,
        padding: 10,
    },
    newsThumb: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    newsContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    newsTitle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    newsMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    newsTime: {
        fontSize: 12,
    },
    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
});
