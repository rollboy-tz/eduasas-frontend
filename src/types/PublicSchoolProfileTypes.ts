// Interface ya Location
export interface SchoolLocation {
  region: string;
  district: string;
  ward: string | null;
  address: string | null;
}

// Interface ya Contacts
export interface SchoolContacts {
  email: string;
  phone: string;
}

// Interface ya Branding
export interface SchoolBranding {
  logoUrl: string | null;
}

// Interface ya Data ya Shule (School Profile Data)
export interface SchoolProfileData {
  schoolId: string;
  name: string;
  displayName: string;
  schoolType: 'GOVERNMENT' | 'PRIVATE' | string; // Unaweza kuongeza aina nyingine za shule
  location: SchoolLocation;
  contacts: SchoolContacts;
  branding: SchoolBranding;
}

// Interface Kuu ya ApiResponse (SchoolProfile)
export interface SchoolProfileResponse {
  status: 'success' | 'error' | string;
  message: string;
  action: 'NONE' | string;
  data: SchoolProfileData;
  metadata: Record<string, unknown> | null;
  timestamp: string;
}

// Kama unataka type ya Data pekee kama SchoolProfile:
export type SchoolProfile = SchoolProfileData;