import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../../../App';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const CoinFlipGame = ({ navigation }) => {
  const { user, updateUser } = useContext(UserContext);
  const [betAmount, setBetAmount] = useState('');
  const [selectedSide, setSelectedSide] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  const flipCoin = async () => {
    const amount = parseFloat(betAmount);
    
    if (!amount || amount < 10) {
      Alert.alert('Error', 'Minimum bet amount is ₹10');
      return;
    }

    if (amount > user.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (!selectedSide) {
      Alert.alert('Error', 'Please select heads or tails');
      return;
    }

    setLoading(true);
    setIsFlipping(true);
    setGameResult(null);

    // Start flip animation
    Animated.sequence([
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/games/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameType: 'coin_flip',
          betAmount: amount,
          gameData: { choice: selectedSide }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          setGameResult(data);
          setIsFlipping(false);
          flipAnimation.setValue(0);
          
          // Update user balance
          updateUser({ ...user, balance: data.newBalance });
          
          if (data.result === 'win') {
            Alert.alert('Congratulations!', `You won ₹${data.winAmount.toFixed(2)}!`);
          } else {
            Alert.alert('Better luck next time!', `You lost ₹${amount.toFixed(2)}`);
          }
        }, 2000);
      } else {
        Alert.alert('Error', data.error || 'Game failed');
        setIsFlipping(false);
        flipAnimation.setValue(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Game error:', error);
      setIsFlipping(false);
      flipAnimation.setValue(0);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setBetAmount('');
    setSelectedSide(null);
    setGameResult(null);
    flipAnimation.setValue(0);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const spin = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1800deg']
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Coin Flip</Text>
        <Text style={styles.subtitle}>Choose heads or tails and win 1.8x your bet!</Text>
        <Text style={styles.balance}>Balance: {formatCurrency(user?.balance || 0)}</Text>
      </View>

      {/* Coin Animation */}
      <View style={styles.coinContainer}>
        <Animated.View style={[styles.coin, { transform: [{ rotateY: spin }] }]}>
          <Text style={styles.coinText}>
            {isFlipping ? '?' : selectedSide === 'heads' ? 'H' : selectedSide === 'tails' ? 'T' : '?'}
          </Text>
        </Animated.View>
      </View>

      {/* Side Selection */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionTitle}>Choose Your Side:</Text>
        <View style={styles.sidesContainer}>
          <TouchableOpacity
            style={[
              styles.sideButton,
              selectedSide === 'heads' && styles.selectedSide
            ]}
            onPress={() => setSelectedSide('heads')}
            disabled={isFlipping}
          >
            <Icon name="face" size={40} color={selectedSide === 'heads' ? '#fff' : '#4CAF50'} />
            <Text style={[
              styles.sideText,
              selectedSide === 'heads' && styles.selectedSideText
            ]}>Heads</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sideButton,
              selectedSide === 'tails' && styles.selectedSide
            ]}
            onPress={() => setSelectedSide('tails')}
            disabled={isFlipping}
          >
            <Icon name="star" size={40} color={selectedSide === 'tails' ? '#fff' : '#4CAF50'} />
            <Text style={[
              styles.sideText,
              selectedSide === 'tails' && styles.selectedSideText
            ]}>Tails</Text>
          </TouchableOpacity>
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
          editable={!isFlipping}
        />
        
        <View style={styles.quickBets}>
          {[10, 50, 100, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickBetButton}
              onPress={() => setBetAmount(amount.toString())}
              disabled={isFlipping}
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
            {gameResult.result === 'win' ? 'YOU WON!' : 'YOU LOST!'}
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
        {!isFlipping && !gameResult && (
          <TouchableOpacity
            style={[styles.flipButton, loading && styles.buttonDisabled]}
            onPress={flipCoin}
            disabled={loading}
          >
            <Text style={styles.flipButtonText}>
              {loading ? 'Playing...' : 'Flip Coin'}
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

      {/* Game Rules */}
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>How to Play:</Text>
        <Text style={styles.rulesText}>• Choose heads or tails</Text>
        <Text style={styles.rulesText}>• Enter your bet amount (minimum ₹10)</Text>
        <Text style={styles.rulesText}>• Win 1.8x your bet if you guess correctly</Text>
        <Text style={styles.rulesText}>• 50% chance to win!</Text>
      </View>
    </View>
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
  coinContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  coin: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  coinText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
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
  sidesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sideButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    flex: 1,
    marginHorizontal: 10,
  },
  selectedSide: {
    backgroundColor: '#4CAF50',
  },
  sideText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 10,
  },
  selectedSideText: {
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
    color: '#4CAF50',
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
  flipButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  flipButtonText: {
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

export default CoinFlipGame;