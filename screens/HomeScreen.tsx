
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
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }}
            style={styles.alertImage}
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
            onLoad={() => console.log('Image loaded:', item.image_url)}
          />
        ) : (
          <View style={[styles.alertImage, styles.noImage]}>
            <Ionicons name="image-outline" size={40} color="#9CA3AF" />
          </View>
        )}

        <View style={[styles.alertIconContainer, { backgroundColor: alertColor + '20' }]}>
          <Ionicons name={getAlertIcon(item.alert_stage) as any} size={28} color={alertColor} />
        </View>

        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertType}>
              {item.type.toUpperCase()} DETECTED
            </Text>
            <Text style={styles.alertTime}>{timeAgo}</Text>
          </View>

          <Text style={styles.alertDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.alertFooter}>
            <View style={[styles.stageBadge, { backgroundColor: alertColor + '20' }]}>
              <Text style={[styles.stageText, { color: alertColor }]}>
                {item.alert_stage.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.confidenceText}>
              {Math.round(item.confidence * 100)}% confident
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  notificationBadge: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#FFFFFF' },
  listContainer: { padding: 16 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  alertImage: { width: 80, height: 80, borderRadius: 12, marginRight: 12, backgroundColor: '#F3F4F6' },
  noImage: { justifyContent: 'center', alignItems: 'center' },
  alertIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 12, position: 'absolute', left: 16, top: 16 },
  alertContent: { flex: 1, marginLeft: 92 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  alertType: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  alertTime: { fontSize: 12, color: '#9CA3AF' },
  alertDescription: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 10 },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  stageText: { fontSize: 11, fontWeight: '600' },
  confidenceText: { fontSize: 12, color: '#6B7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
});
