
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert as RNAlert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  business_type: 'home',
  intruder_types: ['person'],
  monitoring_schedule: 'always',
  alert_start_hour: 18,
  alert_end_hour: 6,
  first_alert_trigger: 'immediate',
  alert_frequency_minutes: 5,
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { logout, user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('user_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    try {
      await AsyncStorage.setItem('user_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      RNAlert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      RNAlert.alert('Error', 'Failed to save settings');
    }
  };

  const handleLogout = async () => {
    console.log('Logout button pressed directly');
    try {
      console.log('Calling logout function');
      await logout();
      console.log('Logout completed successfully');
    } catch (error) {
      console.log('Logout error:', error);
      RNAlert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const businessTypes = [
    { value: 'home', label: 'Home Security', icon: 'home-outline' },
    { value: 'office', label: 'Office', icon: 'business-outline' },
    { value: 'farm_livestock', label: 'Farm (Livestock)', icon: 'leaf-outline' },
    { value: 'farm_crops', label: 'Farm (Crops)', icon: 'nutrition-outline' },
    { value: 'business', label: 'Business/Store', icon: 'storefront-outline' },
    { value: 'warehouse', label: 'Warehouse', icon: 'cube-outline' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Type</Text>
          <Text style={styles.sectionDescription}>
            Choose what you're monitoring
          </Text>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.optionCard,
                settings.business_type === type.value && styles.optionCardActive,
              ]}
              onPress={() => saveSettings({ ...settings, business_type: type.value as any })}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={settings.business_type === type.value ? '#3B82F6' : '#6B7280'}
              />
              <Text
                style={[
                  styles.optionText,
                  settings.business_type === type.value && styles.optionTextActive,
                ]}
              >
                {type.label}
              </Text>
              {settings.business_type === type.value && (
                <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detection Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Detect People</Text>
              <Text style={styles.settingDescription}>Alert when humans detected</Text>
            </View>
            <Switch
              value={settings.intruder_types.includes('person')}
              onValueChange={(value) => {
                const types = value
                  ? [...settings.intruder_types, 'person']
                  : settings.intruder_types.filter((t) => t !== 'person');
                saveSettings({ ...settings, intruder_types: types as any });
              }}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.intruder_types.includes('person') ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Detect Animals</Text>
              <Text style={styles.settingDescription}>Alert when animals detected</Text>
            </View>
            <Switch
              value={settings.intruder_types.includes('animal')}
              onValueChange={(value) => {
                const types = value
                  ? [...settings.intruder_types, 'animal']
                  : settings.intruder_types.filter((t) => t !== 'animal');
                saveSettings({ ...settings, intruder_types: types as any });
              }}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.intruder_types.includes('animal') ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Preferences</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Immediate Alerts</Text>
              <Text style={styles.settingDescription}>Alert when intruder first detected</Text>
            </View>
            <Switch
              value={settings.first_alert_trigger === 'immediate'}
              onValueChange={(value) =>
                saveSettings({
                  ...settings,
                  first_alert_trigger: value ? 'immediate' : 'suspicious_only',
                })
              }
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={settings.first_alert_trigger === 'immediate' ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive real-time alerts</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={notificationsEnabled ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Ionicons name="shield-checkmark" size={48} color="#3B82F6" />
            <Text style={styles.appName}>CATCHAM</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              AI-Powered Security System for Homes, Offices, and Farms
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  optionCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
    elevation: 8,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 16,
    fontWeight: '600',
  },
  optionTextActive: {
    fontWeight: '700',
    color: '#3B82F6',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  appVersion: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  appDescription: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: 280,
  },
});
