import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import MatchCard from '../components/MatchCard';
import RotatingLogo from '../components/RotatingLogo';
import { getMatchesByDate } from '../services/api';


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LeagueGroup = ({ item, theme, isDarkMode, navigation }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed(!collapsed);
  };

  return (
    <View style={[styles.leagueCardContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#2A2A2A' : '#E5E5EA' }]}>
      {/* HEADER CLIQUABLE */}
      <TouchableOpacity onPress={toggleCollapse} style={styles.sectionHeader} activeOpacity={0.7}>
        <View style={styles.sectionHeaderLeft}>
          <Image source={{ uri: item.logo }} style={styles.leagueLogo} resizeMode="contain" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: isDarkMode ? '#333' : '#F2F2F7' }]}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>{item.data.length}</Text>
          </View>
        </View>
        <Ionicons
          name={collapsed ? "chevron-down" : "chevron-up"}
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>

      {/* CONTENU (Liste des matchs) */}
      {!collapsed && (
        <View style={styles.matchesList}>
          {item.data.map((match) => (
            <View key={match.id} style={styles.matchWrapper}>
              <MatchCard
                match={match}
                onPress={() => {
                  console.log("Match Clicked:", match.id);
                }}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function MatchesScreen({ navigation }) {
  const { theme, isDarkMode } = useTheme();
  const { t, language } = useLanguage();

  // États des données
  const [rawMatches, setRawMatches] = useState([]); // Données brutes de l'API
  const [groupedMatches, setGroupedMatches] = useState([]); // Données groupées pour l'affichage
  const [loading, setLoading] = useState(true); // État de chargement

  // États UI
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [calendarDates, setCalendarDates] = useState([]);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [leagueModalVisible, setLeagueModalVisible] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null); // null = toutes les ligues

  const flatListRef = useRef(null);

  // Generation des dates
  useEffect(() => {
    const generateDates = () => {
      const dates = [];
      // On génère 3 jours avant et 7 jours après
      for (let i = -3; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);

        const isoDate = d.toISOString().split('T')[0];

        const dayName = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' }).format(d);
        const dayNum = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' }).format(d);

        const isToday = i === 0;
        const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        const displayDay = isToday ? t('today') : formattedDayName;

        dates.push({
          fullDate: isoDate,
          displayDay: displayDay,
          displayDate: dayNum,
          isToday: isToday
        });
      }
      return dates;
    };

    setCalendarDates(generateDates());
  }, [language, t]);

  // on affiche aujourd'hui au centre
  useEffect(() => {
    if (calendarDates.length > 0 && flatListRef.current) {
      setTimeout(() => {
        try {
          flatListRef.current.scrollToIndex({ index: 3, animated: true, viewPosition: 0.5 });
        } catch (e) {

        }
      }, 500);
    }
  }, [calendarDates]);

  // 3. appel api
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const data = await getMatchesByDate(selectedDate);
        setRawMatches(data);
      } catch (error) {
        console.error("Erreur chargement matchs:", error);
        setRawMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [selectedDate]);

  // Filtrage et groupage 
  useEffect(() => {
    // Filtrer par recherche
    const filtered = rawMatches.filter(match => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        match.teams.home.name.toLowerCase().includes(query) ||
        match.teams.away.name.toLowerCase().includes(query) ||
        match.league.name.toLowerCase().includes(query)
      );
    });

    // Filtrer par ligue sélectionnée
    let leagueFiltered = filtered;
    if (selectedLeague) {
      leagueFiltered = filtered.filter(match => match.league.id === selectedLeague.id);
    }

    // Grouper par Ligue
    const grouped = Object.values(leagueFiltered.reduce((acc, match) => {
      const leagueId = match.league.id;
      if (!acc[leagueId]) {
        acc[leagueId] = {
          id: leagueId,
          title: match.league.name,
          logo: match.league.logo,
          data: []
        };
      }
      acc[leagueId].data.push(match);
      return acc;
    }, {}));

    setGroupedMatches(grouped);
  }, [rawMatches, searchQuery, selectedLeague]);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <View style={styles.logoContainer}>
          <RotatingLogo size={24} withText={true} />
        </View>
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSearchVisible(!searchVisible)}
          >
            <Ionicons name="search" size={22} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => setLeagueModalVisible(true)}
          >
            <Ionicons 
              name={selectedLeague ? "trophy" : "trophy-outline"} 
              size={22} 
              color={selectedLeague ? theme.primary : theme.text} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => {
              setTempSelectedDate(selectedDate);
              setCalendarModalVisible(true);
            }}
          >
            <Ionicons name="calendar-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH BAR */}
      {searchVisible && (
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('search_placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* CALENDAR SLIDER */}
      <View style={styles.calendarContainer}>
        <FlatList
          ref={flatListRef}
          horizontal
          data={calendarDates}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.fullDate}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          getItemLayout={(data, index) => (
            { length: 70, offset: 70 * index, index }
          )}
          renderItem={({ item }) => {
            const isActive = item.fullDate === selectedDate;
            return (
              <TouchableOpacity
                style={[
                  styles.dateItem,
                  { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' },
                  isActive && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => setSelectedDate(item.fullDate)}
              >
                <Text style={[
                  styles.dateDay,
                  { color: theme.textSecondary },
                  isActive && styles.dateTextActive
                ]}>
                  {item.displayDay}
                </Text>
                <Text style={[
                  styles.dateNum,
                  { color: theme.text },
                  isActive && styles.dateTextActive
                ]}>
                  {item.displayDate}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* MODAL COMPÉTITIONS/LIGUES */}
      <Modal
        visible={leagueModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLeagueModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choisir une compétition</Text>
              <TouchableOpacity
                onPress={() => setLeagueModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.calendarModalScroll}>
              {/* Option "Toutes les compétitions" */}
              <TouchableOpacity
                style={[
                  styles.modalDateItem,
                  { backgroundColor: theme.background, borderColor: isDarkMode ? '#333' : '#E5E5EA' },
                  !selectedLeague && { backgroundColor: theme.primary, borderColor: theme.primary }
                ]}
                onPress={() => {
                  setSelectedLeague(null);
                  setLeagueModalVisible(false);
                }}
              >
                <View style={styles.modalDateContent}>
                  <Text style={[
                    styles.modalDateDay,
                    { color: theme.textSecondary },
                    !selectedLeague && styles.modalDateTextActive
                  ]}>
                    Toutes les compétitions
                  </Text>
                  <Text style={[
                    styles.modalDateNum,
                    { color: theme.text },
                    !selectedLeague && styles.modalDateTextActive
                  ]}>
                    Afficher tous les matchs
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Liste des compétitions disponibles */}
              {(() => {
                // Extraire les ligues uniques des matchs
                const leaguesMap = {};
                rawMatches.forEach(match => {
                  const leagueId = match.league.id;
                  if (!leaguesMap[leagueId]) {
                    leaguesMap[leagueId] = {
                      id: match.league.id,
                      name: match.league.name,
                      logo: match.league.logo
                    };
                  }
                });
                const leagues = Object.values(leaguesMap);

                return leagues.map((league) => {
                  const isSelected = selectedLeague && selectedLeague.id === league.id;
                  return (
                    <TouchableOpacity
                      key={league.id}
                      style={[
                        styles.modalDateItem,
                        { backgroundColor: theme.background, borderColor: isDarkMode ? '#333' : '#E5E5EA' },
                        isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                      ]}
                      onPress={() => {
                        setSelectedLeague(league);
                        setLeagueModalVisible(false);
                      }}
                    >
                      <View style={styles.modalDateContent}>
                        <View style={styles.leagueRow}>
                          {league.logo && (
                            <Image 
                              source={{ uri: league.logo }} 
                              style={styles.leagueModalLogo}
                              resizeMode="contain"
                            />
                          )}
                          <View style={styles.leagueTextContainer}>
                            <Text style={[
                              styles.modalDateDay,
                              { color: theme.textSecondary },
                              isSelected && styles.modalDateTextActive
                            ]}>
                              {league.name}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: isDarkMode ? '#333' : '#F2F2F7' }]}
                onPress={() => setLeagueModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL CALENDRIER */}
      <Modal
        visible={calendarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Choisir une date</Text>
              <TouchableOpacity
                onPress={() => setCalendarModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.calendarModalScroll}>
              {(() => {
                const dates = [];
                // Générer 30 jours avant et 60 jours après
                for (let i = -30; i <= 60; i++) {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const isoDate = d.toISOString().split('T')[0];
                  
                  const dayName = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long' }).format(d);
                  const dayNum = d.getDate();
                  const monthName = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' }).format(d);
                  const year = d.getFullYear();
                  
                  const isToday = i === 0;
                  const isSelected = isoDate === tempSelectedDate;
                  
                  dates.push({
                    fullDate: isoDate,
                    displayDay: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                    displayDate: `${dayNum} ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
                    isToday: isToday,
                    isSelected: isSelected
                  });
                }
                return dates.map((dateItem) => (
                  <TouchableOpacity
                    key={dateItem.fullDate}
                    style={[
                      styles.modalDateItem,
                      { backgroundColor: theme.background, borderColor: isDarkMode ? '#333' : '#E5E5EA' },
                      dateItem.isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                      dateItem.isToday && !dateItem.isSelected && { borderColor: theme.primary, borderWidth: 2 }
                    ]}
                    onPress={() => setTempSelectedDate(dateItem.fullDate)}
                  >
                    <View style={styles.modalDateContent}>
                      <Text style={[
                        styles.modalDateDay,
                        { color: theme.textSecondary },
                        dateItem.isSelected && styles.modalDateTextActive
                      ]}>
                        {dateItem.displayDay}
                      </Text>
                      <Text style={[
                        styles.modalDateNum,
                        { color: theme.text },
                        dateItem.isSelected && styles.modalDateTextActive
                      ]}>
                        {dateItem.displayDate}
                      </Text>
                      {dateItem.isToday && (
                        <View style={[styles.todayBadge, { backgroundColor: dateItem.isSelected ? '#000' : theme.primary }]}>
                          <Text style={styles.todayBadgeText}>Aujourd'hui</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ));
              })()}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: isDarkMode ? '#333' : '#E5E5EA' }]}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: isDarkMode ? '#333' : '#F2F2F7' }]}
                onPress={() => setCalendarModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setSelectedDate(tempSelectedDate);
                  setCalendarModalVisible(false);
                  // Mettre à jour le calendrier horizontal pour inclure la date sélectionnée
                  const generateDates = () => {
                    const dates = [];
                    const selectedDateObj = new Date(tempSelectedDate + 'T00:00:00');
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    // Générer autour de la date sélectionnée (3 jours avant, 7 jours après)
                    for (let i = -3; i <= 7; i++) {
                      const d = new Date(selectedDateObj);
                      d.setDate(d.getDate() + i);
                      const isoDate = d.toISOString().split('T')[0];
                      
                      const dayName = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' }).format(d);
                      const dayNum = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' }).format(d);
                      
                      const todayDateStr = today.toISOString().split('T')[0];
                      const isToday = isoDate === todayDateStr;
                      const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
                      const displayDay = isToday ? t('today') : formattedDayName;
                      
                      dates.push({
                        fullDate: isoDate,
                        displayDay: displayDay,
                        displayDate: dayNum,
                        isToday: isToday
                      });
                    }
                    return dates;
                  };
                  const newDates = generateDates();
                  setCalendarDates(newDates);
                  // Scroll vers la date sélectionnée dans le calendrier horizontal
                  setTimeout(() => {
                    if (flatListRef.current) {
                      const selectedIndex = newDates.findIndex(d => d.fullDate === tempSelectedDate);
                      if (selectedIndex >= 0) {
                        try {
                          flatListRef.current.scrollToIndex({ index: selectedIndex, animated: true, viewPosition: 0.5 });
                        } catch (e) {
                          console.log("Erreur scroll:", e);
                        }
                      }
                    }
                  }, 100);
                }}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CONTENU PRINCIPAL */}
      {loading ? (
        // État de chargement
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 10 }}>Chargement des matchs...</Text>
        </View>
      ) : (
        // Liste des matchs
        <FlatList
          data={groupedMatches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <LeagueGroup item={item} theme={theme} isDarkMode={isDarkMode} navigation={navigation} />}
          contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="soccer" size={50} color={theme.textSecondary} style={{ opacity: 0.5 }} />
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 10 }}>
                {searchQuery ? "Aucun match ne correspond à ta recherche." : "Aucun match prévu pour cette date."}
              </Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  iconsContainer: { flexDirection: 'row' },
  iconBtn: { marginLeft: 16 },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 10,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },

  calendarContainer: { paddingVertical: 15 },
  dateItem: {
    borderRadius: 12,
    paddingVertical: 10,
    width: 60,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1
  },
  dateDay: { fontSize: 11, marginBottom: 4 },
  dateNum: { fontWeight: 'bold', fontSize: 13 },
  dateTextActive: { color: '#000', fontWeight: 'bold' },

  leagueCardContainer: { borderRadius: 20, marginBottom: 20, padding: 10, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10, marginBottom: 5 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  leagueLogo: { width: 28, height: 28, marginRight: 12, borderRadius: 14, backgroundColor: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  matchesList: { marginTop: 5 },
  matchWrapper: { marginBottom: 4 },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  calendarModalScroll: {
    maxHeight: 400,
  },
  modalDateItem: {
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalDateContent: {
    alignItems: 'flex-start',
  },
  modalDateDay: {
    fontSize: 14,
    marginBottom: 4,
  },
  modalDateNum: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalDateTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  todayBadge: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  todayBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#000',
  },
  leagueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leagueModalLogo: {
    width: 30,
    height: 30,
    marginRight: 12,
    borderRadius: 15,
  },
  leagueTextContainer: {
    flex: 1,
  },
});