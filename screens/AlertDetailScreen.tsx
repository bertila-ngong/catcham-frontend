
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import { Alert } from '../types';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

export default function AlertDetailScreen({ route, navigation }: any) {
  const { alertId } = route.params;
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const alertDoc = await getDoc(doc(db, 'detections', alertId));
        if (alertDoc.exists()) {
          setAlert({ id: alertDoc.id, ...alertDoc.data() } as Alert);
        }
      } catch (error) {
        console.error('Error fetching alert:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [alertId]);

  const getAlertColor = (stage: string) => {
    switch (stage) {
      case 'arrival': return '#3B82F6';
      case 'suspicious_activity': return '#EF4444';
      case 'departure': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Alert not found</Text>
      </View>
    );
  }

  const alertColor = getAlertColor(alert.alert_stage || 'unknown');
  const formattedDate = alert.timestamp
    ? format(new Date(alert.timestamp), 'MMMM dd, yyyy • hh:mm a')
    : 'Unknown date';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {alert.image_url && alert.image_url.trim() !== '' && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: alert.image_url }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              onLoad={() => console.log('Image loaded:', alert.image_url)}
            />
            <View style={[styles.statusBadge, { backgroundColor: alertColor }]}>
              <Text style={styles.statusText}>
                {(alert.alert_stage || 'unknown').replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>{(alert.type || 'unknown').toUpperCase()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Confidence</Text>
              <Text style={styles.infoValue}>{alert.confidence ? Math.round(alert.confidence * 100) : 0}%</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{(alert.duration_seconds || 0)}s</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={24} color="#1F2937" />
            <Text style={styles.cardTitle}>AI Description</Text>
          </View>
          <Text style={styles.description}>{alert.description || 'No description available'}</Text>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#1F2937" />
            <Text style={styles.cardTitle}>Detection Details</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Business Type</Text>
            <Text style={styles.detailValue}>{(alert.business_type || 'unknown').replace('_', ' ')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Detection Time</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Alert Number</Text>
            <Text style={styles.detailValue}>#{alert.alert_number || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Video Time</Text>
            <Text style={styles.detailValue}>{alert.video_time ? alert.video_time.toFixed(1) : 'N/A'}s</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
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
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#475569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 14,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    fontWeight: '400',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});
