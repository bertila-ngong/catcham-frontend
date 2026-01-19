
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, collection, query, orderBy, onSnapshot } from '../firebase.config';
import { Alert } from '../types';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

export default function HistoryScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    const alertsRef = collection(db, 'detections');
    const q = query(alertsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const alertsData: Alert[] = [];
        snapshot.forEach((doc) => {
          alertsData.push({ id: doc.id, ...doc.data() } as Alert);
        });
        // Remove duplicates by id
        const uniqueAlerts = alertsData.filter((alert, index, self) =>
          index === self.findIndex(a => a.id === alert.id)
        );
        setAlerts(uniqueAlerts);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase onSnapshot error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getFilteredAlerts = () => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return alerts.filter(a => {
          const date = new Date(a.timestamp);
          return date instanceof Date && !isNaN(date.getTime()) && date >= startOfDay(now);
        });
      case 'week':
        return alerts.filter(a => {
          const date = new Date(a.timestamp);
          return date instanceof Date && !isNaN(date.getTime()) && date >= startOfWeek(now);
        });
      case 'month':
        return alerts.filter(a => {
          const date = new Date(a.timestamp);
          return date instanceof Date && !isNaN(date.getTime()) && date >= startOfMonth(now);
        });
      default:
        return alerts;
    }
  };

  const filteredAlerts = getFilteredAlerts();

  const stats = {
    total: filteredAlerts.length,
    persons: filteredAlerts.filter(a => a.type === 'person').length,
    animals: filteredAlerts.filter(a => a.type === 'animal').length,
    suspicious: filteredAlerts.filter(a => a.alert_stage === 'suspicious_activity').length,
  };

  const renderAlert = ({ item }: { item: Alert }) => {
    const dateObj = new Date(item.timestamp);
    const date = dateObj instanceof Date && !isNaN(dateObj.getTime())
      ? format(dateObj, 'MMM dd, hh:mm a')
      : 'Invalid date';
    const color = item.alert_stage === 'suspicious_activity' ? '#EF4444' : '#3B82F6';
    const alertStageText = item.alert_stage ? item.alert_stage.replace('_', ' ') : 'Unknown';

    return (
      <TouchableOpacity
        style={styles.alertItem}
        onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
      >
        <View style={[styles.alertDot, { backgroundColor: color }]} />
        <View style={styles.alertInfo}>
          <Text style={styles.alertTitle}>
            {item.type ? item.type.toUpperCase() : 'UNKNOWN'} - {alertStageText}
          </Text>
          <Text style={styles.alertDate}>{date}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.persons}</Text>
          <Text style={styles.statLabel}>Persons</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.animals}</Text>
          <Text style={styles.statLabel}>Animals</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.suspicious}</Text>
          <Text style={styles.statLabel}>Suspicious</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'today', 'week', 'month'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredAlerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>No alerts in this period</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    elevation: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  alertDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  alertDate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
});
