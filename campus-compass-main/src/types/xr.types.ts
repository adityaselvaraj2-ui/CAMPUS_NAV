export interface DeviceOrientation {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  heading: number | null;
}

export interface ARBuildingOverlay {
  buildingId: string;
  buildingName: string;
  buildingIcon: string;
  screenX: number;
  screenY: number;
  distance: number;
  bearing: number;
  status: 'open' | 'closing' | 'closed' | 'always' | 'restricted';
  statusLabel: string;
  category: string;
}

export type XRMode = 'idle' | 'ar-outdoor' | 'ar-indoor' | 'vr-campus' | 'vr-building' | 'panorama-360';

export interface XRSessionState {
  mode: XRMode;
  isLoading: boolean;
  error: string | null;
  hasCamera: boolean;
  hasGPS: boolean;
  hasCompass: boolean;
  hasXR: boolean;
}
