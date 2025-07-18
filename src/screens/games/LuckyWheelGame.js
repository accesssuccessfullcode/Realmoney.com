import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../../../App';
import { API_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const LuckyWheelGame = ({ navigation }) => {
  const { user, updateUser } = useContext(UserContext);
  const [betAmount, setBetAmount] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const wheelRotation = useRef(new Animated.Value(0)).current;

  const wheelSegments = [
    { id: 1, multiplier: 0, color: '#F44336', label: 'LOSE' },
    { id: 2, multiplier: 1.5, color: '#4CAF50', label: '1.5x' },
    { id: 3, multiplier: 2, color: '#2196F3', label: '2x' },
    { id: 4, multiplier: 3, color: '#FF9800', label: '3x' },
    { id: 5, multiplier: 5, color: '#9C27B0', label: '5x' },
    { id: 6, multiplier: 2, color: '#2196F3', label: '2x' },
    { id: 7, multiplier: 1.5, color: '#4CAF50', label: '1.5x' },
    { id: 8, multiplier: 0, color: '#F44336', label: 'LOSE' },
  ];

  const spinWheel = async () => {
    const amount = parseFloat(betAmount);
    
    if (!amount || amount < 10) {
      Alert.alert('Error', 'Minimum bet amount is ₹10');
      return;
    }

    if (amount > user.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    setIsSpinning(true);
    setGameResult(null);

    // Generate random spin degrees
    const randomSpin = Math.random() * 360 + 1440; // At least 4 full rotations

    // Start wheel animation
    Animated.timing(wheelRotation, {
      toValue: randomSpin,
      duration: 3000,
      useNativeDriver: true,
    }).start();

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/games/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameType: 'lucky_wheel',
          betAmount: amount,
          gameData: {}
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          setGameResult(data);
          setIsSpinning(false);
          
          // Update user balance
          updateUser({ ...user, balance: data.newBalance });
          
          if (data.result === 'win') {
            Alert.alert('Lucky Winner!', `You won ₹${data.winAmount.toFixed(2)}!`);
          } else {
            Alert.alert('Better luck next time!', `You lost ₹${amount.toFixed(2)}`);
          }
        }, 3000);
      } else {
        Alert.alert('Error', data.error || 'Game failed');
        setIsSpinning(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Game error:', error);
      setIsSpinning(false);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setBetAmount('');
    setGameResult(null);
    wheelRotation.setValue(0);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const WheelSegment = ({ segment, index, totalSegments }) => {
    const segmentAngle = 360 / totalSegments;
    const rotation = index * segmentAngle;
    
    return (
      <View
        style={[
          styles.wheelSegment,
          {
            transform: [{ rotate: `${rotation}deg` }],
            borderTopColor: segment.color,
          }
        ]}
      >
        <View style={styles.segmentContent}>
          <Text style={styles.segmentText}>{segment.label}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lucky Wheel</Text>
        <Text style={styles.subtitle}>Spin the wheel and win up to 5x your bet!</Text>
        <Text style={styles.balance}>Balance: {formatCurrency(user?.balance || 0)}</Text>
      </View>

      {/* Wheel Container */}
      <View style={styles.wheelContainer}>
        <View style={styles.wheelWrapper}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [
                  {
                    rotate: wheelRotation.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            {wheelSegments.map((segment, index) => (
              <WheelSegment
                key={segment.id}
                segment={segment}
                index={index}
                totalSegments={wheelSegments.length}
              />
            ))}
          </Animated.View>
          <View style={styles.wheelPointer}>
            <Icon name="play-arrow" size={30} color="#333" />
          </View>
        </View>
      </View>

      {/* Multipliers Display */}
      <View style={styles.multipliersContainer}>
        <Text style={styles.multipliersTitle}>Possible Wins:</Text>
        <View style={styles.multipliersGrid}>
          {[...new Set(wheelSegments.map(s => s.multiplier))].sort((a, b) => b - a).map((multiplier) => (
            <View key={multiplier} style={styles.multiplierItem}>
              <Text style={styles.multiplierText}>
                {multiplier === 0 ? 'LOSE' : `${multiplier}x`}
              </Text>
            </View>
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
          editable={!isSpinning}
        />
        
        <View style={styles.quickBets}>
          {[10, 50, 100, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickBetButton}
              onPress={() => setBetAmount(amount.toString())}
              disabled={isSpinning}
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
            {gameResult.result === 'win' ? 'WINNER!' : 'TRY AGAIN!'}
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
        {!isSpinning && !gameResult && (
          <TouchableOpacity
            style={[styles.spinButton, loading && styles.buttonDisabled]}
            onPress={spinWheel}
            disabled={loading}
          >
            <Text style={styles.spinButtonText}>
              {loading ? 'Spinning...' : 'Spin Wheel'}
            </Text>
          </TouchableOpacity>
        )}
        
        {gameResult && (
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={resetGame}
          >
            <Text style={styles.playAgainText}>Spin Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Game Rules */}
      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>How to Play:</Text>
        <Text style={styles.rulesText}>• Enter your bet amount (minimum ₹10)</Text>
        <Text style={styles.rulesText}>• Spin the wheel and wait for it to stop</Text>
        <Text style={styles.rulesText}>• Win based on where the pointer lands</Text>
        <Text style={styles.rulesText}>• Up to 5x multiplier available!</Text>
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
    backgroundColor: '#9C27B0',
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
  wheelContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: 200,
    height: 200,
    borderRadius: 100,
    position: 'relative',
    borderWidth: 3,
    borderColor: '#333',
    backgroundColor: '#fff',
  },
  wheelSegment: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 100,
    borderRightWidth: 100,
    borderTopWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    top: 0,
    left: 0,
    transformOrigin: '50% 100px',
  },
  segmentContent: {
    position: 'absolute',
    top: -20,
    left: -15,
    width: 30,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  wheelPointer: {
    position: 'absolute',
    top: -15,
    right: 85,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  multipliersContainer: {
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
  multipliersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  multipliersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  multiplierItem: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  multiplierText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9C27B0',
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
    color: '#9C27B0',
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
  spinButton: {
    backgroundColor: '#9C27B0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  spinButtonText: {
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

export default LuckyWheelGame;