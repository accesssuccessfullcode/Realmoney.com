import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { UserContext } from '../../App';
import { API_BASE_URL } from '../utils/constants';

const ProfileScreen = () => {
  const { user, updateUser, logout } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);
  const [commission, setCommission] = useState({ totalCommission: 0, todayCommission: 0 });

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const fetchCommissionData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/commission`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCommission(data);
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchCommissionData()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Icon name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.memberSince}>
          Member since {formatDate(user?.createdAt)}
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="account-balance-wallet" size={30} color="#4CAF50" />
          <Text style={styles.statValue}>{formatCurrency(user?.balance || 0)}</Text>
          <Text style={styles.statLabel}>Current Balance</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="games" size={30} color="#FF9800" />
          <Text style={styles.statValue}>{user?.gamesPlayed || 0}</Text>
          <Text style={styles.statLabel}>Games Played</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="trending-up" size={30} color="#2196F3" />
          <Text style={styles.statValue}>{formatCurrency(user?.totalWinnings || 0)}</Text>
          <Text style={styles.statLabel}>Total Winnings</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="add-circle" size={30} color="#9C27B0" />
          <Text style={styles.statValue}>{formatCurrency(user?.totalDeposits || 0)}</Text>
          <Text style={styles.statLabel}>Total Deposits</Text>
        </View>
      </View>

      {/* Commission Section (Admin Feature) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Commission Earned</Text>
        <View style={styles.commissionContainer}>
          <View style={styles.commissionItem}>
            <Text style={styles.commissionLabel}>Today's Commission</Text>
            <Text style={styles.commissionValue}>{formatCurrency(commission.todayCommission)}</Text>
          </View>
          <View style={styles.commissionItem}>
            <Text style={styles.commissionLabel}>Total Commission</Text>
            <Text style={styles.commissionValue}>{formatCurrency(commission.totalCommission)}</Text>
          </View>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <Icon name="person" size={24} color="#666" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="email" size={24} color="#666" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Icon name="date-range" size={24} color="#666" />
          <View style={styles.infoText}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{formatDate(user?.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Icon name="security" size={24} color="#666" />
          <Text style={styles.settingsText}>Change Password</Text>
          <Icon name="arrow-forward-ios" size={16} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Icon name="notifications" size={24} color="#666" />
          <Text style={styles.settingsText}>Notifications</Text>
          <Icon name="arrow-forward-ios" size={16} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Icon name="help" size={24} color="#666" />
          <Text style={styles.settingsText}>Help & Support</Text>
          <Icon name="arrow-forward-ios" size={16} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Icon name="privacy-tip" size={24} color="#666" />
          <Text style={styles.settingsText}>Privacy Policy</Text>
          <Icon name="arrow-forward-ios" size={16} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Real Money Gaming App v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    padding: 30,
    paddingTop: 50,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 5,
  },
  memberSince: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
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
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
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
    color: '#333',
    marginBottom: 15,
  },
  commissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commissionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  commissionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  commissionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ProfileScreen;