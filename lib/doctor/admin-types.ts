export type FacilityData = {
  name: string;
  shortName: string;
  regon: string;
  nip: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  workingHours: string;
  nfzCode: string;
  teryt: string;
  bankAccount: string;
  rodConsentText: string;
  logoUrl: string;
};

export type AppSettings = {
  blockDoubleBooking: boolean;
  requireTeleconfirm: boolean;
  showPeselMaskedOnly: boolean;
  autoEndDayReminder: boolean;
  allowReceptionEditNotes: boolean;
  smsRemindersEnabled: boolean;
  onlineBookingSync: boolean;
  strictRoomAssignment: boolean;
  showPricesInCalendar: boolean;
  requireIcdOnComplete: boolean;
  auditLogEnabled: boolean;
  weekendSlotsEnabled: boolean;
};

export type StaffMember = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  pwz: string;
  role: "doctor" | "reception" | "admin" | "physio";
  branchIds: string[];
  active: boolean;
  email: string;
  phone: string;
  /** powiązanie z lib/booking/doctors */
  doctorId?: string;
  availabilityFactor: number;
};

export type Room = {
  id: string;
  name: string;
  branchId: string;
  floor: string;
  notes: string;
  active: boolean;
};

export type VisitTypeConfig = {
  id: string;
  name: string;
  durationMin: number;
  mode: "stacjonarna" | "teleporada" | "domowa";
  active: boolean;
};
