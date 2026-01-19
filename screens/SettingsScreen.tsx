
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  optionTextActive: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  appDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});