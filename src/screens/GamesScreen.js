import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const GamesScreen = ({ navigation }) => {
  const games = [
    {
      id: 'coin_flip',
      title: 'Coin Flip',
      description: 'Choose heads or tails. 50/50 chance to win!',
      icon: 'monetization-on',
      color: '#FFD700',
      minBet: 10,
      maxMultiplier: '1.8x',
      screen: 'CoinFlip'
    },
    {
      id: 'number_guess',
      title: 'Number Guess',
      description: 'Guess a number between 1-10. Win big!',
      icon: 'casino',
      color: '#E91E63',
      minBet: 10,
      maxMultiplier: '9x',
      screen: 'NumberGuess'
    },
    {
      id: 'lucky_wheel',
      title: 'Lucky Wheel',
      description: 'Spin the wheel of fortune!',
      icon: 'track-changes',
      color: '#9C27B0',
      minBet: 10,
      maxMultiplier: '5x',
      screen: 'LuckyWheel'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Game</Text>
        <Text style={styles.headerSubtitle}>Pick a game and start winning!</Text>
      </View>

      <View style={styles.gamesContainer}>
        {games.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => navigation.navigate(game.screen)}
          >
            <View style={styles.gameHeader}>
              <Icon name={game.icon} size={50} color={game.color} />
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
              </View>
            </View>
            
            <View style={styles.gameStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Min Bet</Text>
                <Text style={styles.statValue}>₹{game.minBet}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Max Win</Text>
                <Text style={styles.statValue}>{game.maxMultiplier}</Text>
              </View>
            </View>
            
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>Play Now</Text>
              <Icon name="arrow-forward" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <View style={styles.infoItem}>
          <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>Add money to your wallet (minimum ₹100)</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="games" size={24} color="#FF9800" />
          <Text style={styles.infoText}>Choose a game and place your bet</Text>
        </View>
        <View style={styles.infoItem}>
          <Icon name="trending-up" size={24} color="#2196F3" />
          <Text style={styles.infoText}>Win and withdraw your earnings</Text>
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
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  gamesContainer: {
    padding: 20,
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 15,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  gameStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  infoSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
});

export default GamesScreen;