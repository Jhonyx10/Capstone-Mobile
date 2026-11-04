export type OperationStatus = 'upcoming' | 'active' | 'completed' | 'suspended';

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [lng, lat]
}

export interface AreaUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  pivot: { area_id: number; user_id: number; status: string };
}

export interface OperationArea {
  id: number;
  operation_id: number;
  name: string;
  latitude: number;
  longitude: number;
  geofence: GeoPolygon;
  capacity: number;
  users?: AreaUser[];
}

export interface Operation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  geofence: GeoPolygon;
  status: OperationStatus;
  zone_id: number | null;
  event_date: string | null;
  created_at: string;
  updated_at: string;
  areas_count?: number; // list endpoint
  areas?: OperationArea[]; // details endpoint
  zone: { id: number; zone_name: string } | null;
}

export interface OperationsPage {
  current_page: number;
  data: Operation[];
  last_page: number;
  total: number;
}