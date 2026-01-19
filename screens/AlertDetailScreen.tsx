
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
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 16,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
});
