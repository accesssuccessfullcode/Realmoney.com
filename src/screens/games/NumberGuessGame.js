import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../../../App';
import { API_BASE_URL } from '../../utils/constants';

const NumberGuessGame = ({ navigation }) => {
  const { user, updateUser } = useContext(UserContext);
  const [betAmount, setBetAmount] = useState('');
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const playGame = async () => {
    const amount = parseFloat(betAmount);
    
    if (!amount || amount < 10) {
      Alert.alert('Error', 'Minimum bet amount is ₹10');
      return;
    }

    if (amount > user.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (!selectedNumber) {
      Alert.alert('Error', 'Please select a number');
      return;
    }

    setLoading(true);
    setIsPlaying(true);
    setGameResult(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/games/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameType: 'number_guess',
          betAmount: amount,
          gameData: { guess: selectedNumber }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGameResult(data);
        setIsPlaying(false);
        
        // Update user balance
        updateUser({ ...user, balance: data.newBalance });
        
        if (data.result === 'win') {
          Alert.alert('Amazing!', `You guessed it right! You won ₹${data.winAmount.toFixed(2)}!`);
        } else {
          Alert.alert('Close!', `The number was ${Math.floor(Math.random() * 10) + 1}. You lost ₹${amount.toFixed(2)}`);
        }
      } else {
        Alert.alert('Error', data.error || 'Game failed');
        setIsPlaying(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Game error:', error);
      setIsPlaying(false);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setBetAmount('');
    setSelectedNumber(null);
    setGameResult(null);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const numbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Number Guess</Text>
        <Text style={styles.subtitle}>Guess a number between 1-10 and win 9x your bet!</Text>
        <Text style={styles.balance}>Balance: {formatCurrency(user?.balance || 0)}</Text>
      </View>

      {/* Number Selection */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionTitle}>Choose Your Lucky Number:</Text>
        <View style={styles.numbersGrid}>
          {numbers.map((number) => (
            <TouchableOpacity
              key={number}
              style={[
                styles.numberButton,
                selectedNumber === number && styles.selectedNumber
              ]}
              onPress={() => setSelectedNumber(number)}
              disabled={isPlaying}
            >
              <Text style={[
                styles.numberText,
                selectedNumber === number && styles.selectedNumberText
              ]}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bet Amount */}
      <View style={styles.betContainer}>
        <Text style={styles.betLabel}>Bet Amount (Min: ₹10)</Text>
        <TextInput
          style={styles.betInput}
          placeholder="Enter amount"
          value={betAmount}
          onChangeText={setBetAmount}
          keyboardType="numeric"
          editable={!isPlaying}
        />
        
        <View style={styles.quickBets}>
          {[10, 50, 100, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickBetButton}
              onPress={() => setBetAmount(amount.toString())}
              disabled={isPlaying}
            >
              <Text style={styles.quickBetText}>₹{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Game Result */}
      {gameResult && (
        <View style={styles.resultContainer}>
          <Text style={[
            styles.resultTitle,
            { color: gameResult.result === 'win' ? '#4CAF50' : '#F44336' }
          ]}>
            {gameResult.result === 'win' ? 'JACKPOT!' : 'TRY AGAIN!'}
          </Text>
          <Text style={styles.resultAmount}>
            {gameResult.result === 'win' 
              ? `+${formatCurrency(gameResult.winAmount)}` 
              : `-${formatCurrency(parseFloat(betAmount))}`}
          </Text>
          <Text style={styles.newBalance}>
            New Balance: {formatCurrency(gameResult.newBalance)}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!isPlaying && !gameResult && (
          <TouchableOpacity
            style={[styles.playButton, loading && styles.buttonDisabled]}
            onPress={playGame}
            disabled={loading}
          >
            <Text style={styles.playButtonText}>
              {loading ? 'Playing...' : 'Guess Number'}
            </Text>
          </TouchableOpacity>
        )}
        
        {gameResult && (
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={resetGame}
          >
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="casino" size={30} color="#4CAF50" />
          <Text style={styles.statLabel}>Win Chance</Text>
          <Text style={styles.statValue}>10%</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="trending-up" size={30} color="#FF9800" />
          <Text style={styles.statLabel}>Multiplier</Text>
          <Text style={styles.statValue}>9x</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="account-balance-wallet" size={30} color="#2196F3" />
          <Text style={styles.statLabel}>Min Bet</Text>
          <Text style={styles.statValue}>₹10</Text>
        </View>
      </View>

      {/* Game Rules */}
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>How to Play:</Text>
        <Text style={styles.rulesText}>• Choose a number between 1 and 10</Text>
        <Text style={styles.rulesText}>• Enter your bet amount (minimum ₹10)</Text>
        <Text style={styles.rulesText}>• Win 9x your bet if you guess correctly</Text>
        <Text style={styles.rulesText}>• 10% chance to win, but huge rewards!</Text>
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
    backgroundColor: '#E91E63',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  balance: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  numberButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E91E63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedNumber: {
    backgroundColor: '#E91E63',
  },
  numberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  selectedNumberText: {
    color: '#fff',
  },
  betContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  betLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  betInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
  },
  quickBets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBetButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quickBetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  resultContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  newBalance: {
    fontSize: 16,
    color: '#666',
  },
  actionContainer: {
    paddingHorizontal: 20,
  },
  playButton: {
    backgroundColor: '#E91E63',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playAgainButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statItem: {
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
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rulesContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  rulesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default NumberGuessGame;