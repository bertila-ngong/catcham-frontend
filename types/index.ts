
export interface Alert {
  id: string;
  alert_number: number;
  alert_stage: 'arrival' | 'suspicious_activity' | 'departure';
  type: 'person' | 'animal';
  business_type: string;
  confidence: number;
  video_time: number;
  duration_seconds: number;
  timestamp: string;
  image_filename?: string;
  image_url?: string; 
  description: string;
}

export interface UserSettings {
  business_type: 'home' | 'office' | 'farm_livestock' | 'farm_crops' | 'business' | 'warehouse';
  intruder_types: ('person' | 'animal')[];
  monitoring_schedule: 'always' | 'scheduled';
  alert_start_hour: number;
  alert_end_hour: number;
  first_alert_trigger: 'immediate' | 'suspicious_only';
  alert_frequency_minutes: number;
}

export type RootStackParamList = {
  Main: undefined;
  AlertDetail: { alertId: string };
};

export type BottomTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};
