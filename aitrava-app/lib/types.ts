export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  isDemo: boolean;
  createdAt: string;
};

export type MailResult = { sent: boolean; devLink?: string };

export type PublicConfig = {
  passPriceCop: number;
  paymentUrl: string;
  freeLimits: { vaultDocumentsPerTrip: number };
  upload: { maxBytes: number; mimeTypes: string[] };
  passFeatures: string[];
  mailEnabled: boolean;
  /** Fase de prueba: si es false, se puede usar la app sin verificar el correo. */
  emailVerificationRequired: boolean;
};

export type TripMode = 'KNOWN' | 'HELP' | 'SURPRISE';
export type Frequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type BudgetCategory = 'transporte' | 'alojamiento' | 'actividades' | 'comida' | 'seguros' | 'otros';

export type ItineraryItem = {
  id: string;
  tripId: string;
  type: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string | null;
  locationName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  estimatedCost: number | null;
  status: 'planned' | 'done' | 'cancelled';
  bookingId: string | null;
};

export type Booking = {
  id: string;
  category: string;
  title: string;
  provider: string | null;
  reference: string | null;
  startAt: string | null;
  endAt: string | null;
  cost: number | null;
  currency: string;
  isPaid: boolean;
  address: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
};

export type VaultDocument = {
  id: string;
  category: string;
  title: string;
  fileName: string;
  mimeType: string;
  size: number;
  bookingId: string | null;
  createdAt: string;
};

export type Expense = {
  id: string;
  amount: number;
  category: BudgetCategory;
  description: string | null;
  date: string;
};

export type Milestone = {
  key: string;
  label: string;
  amount: number;
  dueDate: string;
  dueSource: 'reserva' | 'sugerida';
  cumulative: number;
  funded: boolean;
  fundedOn: string | null;
};

export type SavingsComputed = {
  target: number;
  saved: number;
  remaining: number;
  progress: number;
  daysToTrip: number;
  frequency: Frequency;
  frequencyLabel: string;
  status: 'completed' | 'trip_started' | 'ahead' | 'on_track' | 'behind';
  expectedToday: number;
  delta: number;
  next: { date: string; amount: number } | null;
  monthlyNeeded: number;
  monthlyCapacity: number | null;
  fitsCapacity: boolean | null;
  naiveQuota: number;
  milestones: Milestone[];
  schedule: { date: string; amount: number; projected: number; completes: string[] }[];
  shortfalls: { key: string; label: string; dueDate: string; missing: number }[];
  suggestions: { kind: 'move_date' | 'reduce_budget' | 'raise_quota' | 'frequency'; text: string; value?: string | number }[];
};

export type Savings = {
  plan: {
    id: string;
    targetAmount: number;
    initialSaved: number;
    frequency: Frequency;
    monthlyCapacity: number | null;
    startDate: string;
    contributions: { id: string; amount: number; date: string; note: string | null }[];
  };
  computed: SavingsComputed;
};

export type Budget = {
  total: number;
  detailed: boolean;
  categories: { key: BudgetCategory; budget: number; estimated: number; spent: number }[];
  estimated: number;
  spent: number;
  remaining: number;
  unassigned: number;
};

export type Trip = {
  id: string;
  title: string;
  mode: TripMode;
  destinationCity: string;
  destinationCountry: string;
  originCity: string;
  startDate: string;
  endDate: string;
  travelerCount: number;
  budgetAmount: number;
  budgetByCategory: Partial<Record<BudgetCategory, number>> | null;
  currency: string;
  preferences: { likes?: string[]; avoid?: string[]; style?: string } | null;
  isDemo: boolean;
  createdAt: string;
  phase: 'planning' | 'active' | 'finished';
  daysToTrip: number;
  dayOfTrip: number | null;
  totalDays: number;
  hasPass: boolean;
  passStatus: 'demo' | 'active' | 'revoked' | 'none';
  readiness: { percent: number; items: { key: string; label: string; done: boolean }[] };
  items: ItineraryItem[];
  bookings: Booking[];
  documents: VaultDocument[];
  expenses: Expense[];
  budget: Budget;
  savings: Savings | null;
  limits: { vaultDocuments: number | null };
};

export type TripSummary = Pick<
  Trip,
  | 'id'
  | 'title'
  | 'destinationCity'
  | 'destinationCountry'
  | 'startDate'
  | 'endDate'
  | 'travelerCount'
  | 'isDemo'
  | 'phase'
  | 'daysToTrip'
  | 'dayOfTrip'
  | 'totalDays'
  | 'hasPass'
> & {
  readiness: number;
  savings: { progress: number; saved: number; target: number; status: SavingsComputed['status'] } | null;
};

export type Destination = {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string;
  tags: string[];
  imageUrl: string;
  description: string;
  featured: boolean;
  itinerary: { day: number; title: string; items: string[] }[];
};

export type Suggestion = {
  slug: string;
  name: string;
  country: string;
  region: string;
  imageUrl: string;
  description: string;
  tags: string[];
  fitsBudget: boolean | null;
  reasons: string[];
};

export type PaymentStatus =
  | 'created'
  | 'redirected'
  | 'pending'
  | 'pending_verification'
  | 'approved'
  | 'declined'
  | 'cancelled'
  | 'error'
  | 'unknown';

export type Payment = {
  id: string;
  reference: string;
  tripId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  isPaid: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userNote: string | null;
  trip?: { id: string; title: string; destinationCity?: string; destinationCountry?: string };
};

export type Provider = {
  id: string;
  name: string;
  category: string;
  country: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string;
  status: 'demo' | 'prospect' | 'active' | 'inactive';
};
