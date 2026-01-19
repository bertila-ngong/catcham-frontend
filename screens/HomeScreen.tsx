
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, collection, query, orderBy, onSnapshot, limit } from '../firebase.config';
import { Alert } from '../types';
import { formatDistanceToNow } from 'date-fns';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const alertsRef = collection(db, 'detections');
    const q = query(alertsRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData: Alert[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Alert data:', data.image_url); // DEBUG
        alertsData.push({ id: doc.id, ...data } as Alert);
      });
      setAlerts(alertsData);
      setLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => setRefreshing(true);

  const getAlertColor = (stage: string) => {
    switch (stage) {
      case 'arrival': return '#3B82F6';
      case 'suspicious_activity': return '#EF4444';
      case 'departure': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getAlertIcon = (stage: string) => {
    switch (stage) {
      case 'arrival': return 'log-in-outline';
      case 'suspicious_activity': return 'warning-outline';
      case 'departure': return 'log-out-outline';
      default: return 'alert-circle-outline';
    }
  };

  const renderAlert = ({ item }: { item: Alert }) => {
    const alertColor = getAlertColor(item.alert_stage);
    const timeAgo = formatDistanceToNow(new Date(item.timestamp), { addSuffix: true });

    return (
      <TouchableOpacity
        style={styles.alertCard}
        onPress={() => navigation.navigate('AlertDetail', { alertId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.alertMain}>
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.alertImage}
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              onLoad={() => console.log('Image loaded:', item.image_url)}
            />
          ) : (
            <View style={[styles.alertImage, styles.noImage]}>
              <Ionicons name="image-outline" size={24} color="#9CA3AF" />
            </View>
          )}

          <View style={styles.alertContent}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertType}>
                {item.type.toUpperCase()} DETECTED
              </Text>
              <View style={[styles.statusIcon, { backgroundColor: alertColor + '20' }]}>
                <Ionicons name={getAlertIcon(item.alert_stage) as any} size={16} color={alertColor} />
              </View>
            </View>

            <Text style={styles.alertDescription} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.alertMeta}>
              <Text style={styles.alertTime}>{timeAgo}</Text>
              <Text style={styles.confidenceText}>
                {Math.round(item.confidence * 100)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.alertFooter}>
          <View style={[styles.stageBadge, { backgroundColor: alertColor + '15' }]}>
            <Text style={[styles.stageText, { color: alertColor }]}>
              {item.alert_stage.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CATCHAM</Text>
          <Text style={styles.headerSubtitle}>Security Alerts</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          {alerts.length > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="shield-checkmark-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>All Clear!</Text>
          <Text style={styles.emptyText}>No security alerts detected yet.</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          renderItem={renderAlert}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
          }
        />
      )}
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
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.9,
  },
  notificationButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    overflow: 'hidden',
  },
  alertMain: {
    flexDirection: 'row',
    padding: 16,
  },
  alertImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
    flex: 1,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  alertDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: '400',
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stageText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confidenceText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
});
