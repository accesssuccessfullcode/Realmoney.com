import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../../App';
import { API_BASE_URL } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { user, updateUser } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    totalWinnings: 0,
    totalDeposits: 0,
    recentGames: []
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      // Fetch updated user profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        updateUser(profileData);
      }

      // Fetch game history
      const historyResponse = await fetch(`${API_BASE_URL}/api/games/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setStats(prev => ({
          ...prev,
          recentGames: historyData.slice(0, 5)
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.username}!</Text>
        <Text style={styles.balanceText}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(user?.balance || 0)}</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Icon name="add" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Add Cash</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Games')}
        >
          <Icon name="games" size={24} color="#FF9800" />
          <Text style={styles.actionText}>Play Games</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Icon name="trending-up" size={24} color="#2196F3" />
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{user?.gamesPlayed || 0}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(user?.totalWinnings || 0)}</Text>
          <Text style={styles.statLabel}>Total Winnings</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(user?.totalDeposits || 0)}</Text>
          <Text style={styles.statLabel}>Total Deposits</Text>
        </View>
      </View>

      {/* Recent Games */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Games</Text>
        {stats.recentGames.length > 0 ? (
          stats.recentGames.map((game, index) => (
            <View key={index} style={styles.gameItem}>
              <View style={styles.gameInfo}>
                <Text style={styles.gameType}>{game.gameType.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.gameDate}>{formatDate(game.createdAt)}</Text>
              </View>
              <View style={styles.gameResult}>
                <Text style={styles.betAmount}>Bet: {formatCurrency(game.betAmount)}</Text>
                <Text style={[
                  styles.resultText,
                  { color: game.result === 'win' ? '#4CAF50' : '#F44336' }
                ]}>
                  {game.result === 'win' ? `+${formatCurrency(game.winAmount)}` : `-${formatCurrency(game.betAmount)}`}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>No games played yet. Start playing to see your history!</Text>
        )}
      </View>

      {/* Featured Games */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Games</Text>
        <View style={styles.featuredGames}>
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => navigation.navigate('Games', { screen: 'CoinFlip' })}
          >
            <Icon name="monetization-on" size={40} color="#FFD700" />
            <Text style={styles.gameCardTitle}>Coin Flip</Text>
            <Text style={styles.gameCardDesc}>50/50 chance to win!</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => navigation.navigate('Games', { screen: 'NumberGuess' })}
          >
            <Icon name="casino" size={40} color="#E91E63" />
            <Text style={styles.gameCardTitle}>Number Guess</Text>
            <Text style={styles.gameCardDesc}>Guess the right number!</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => navigation.navigate('Games', { screen: 'LuckyWheel' })}
          >
            <Icon name="track-changes" size={40} color="#9C27B0" />
            <Text style={styles.gameCardTitle}>Lucky Wheel</Text>
            <Text style={styles.gameCardDesc}>Spin to win big!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  balanceText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -10,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  gameItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  gameInfo: {
    flex: 1,
  },
  gameType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gameDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  gameResult: {
    alignItems: 'flex-end',
  },
  betAmount: {
    fontSize: 12,
    color: '#666',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  featuredGames: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 5,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  gameCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  gameCardDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen;