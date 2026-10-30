import type { Line, ReservationStatus } from './types';

type Ind = { value: number | null; n: number; target: number };
export type ValueBlock = {
  surveys: number;
  attended: number;
  salidasDone: number;
  newContactRate: Ind;
  wouldReturnRate: Ind;
  nps: Ind;
  challengeRate: Ind;
  hostConfirmsRate: Ind;
  improvements: string[];
};

export type Overview = {
  targets: Record<string, number>;
  evidence: {
    interest: number;
    reservations: number;
    qualified: number;
    pendingReview: number;
    friendsFamily: number;
    paymentReported: number;
    paid: number;
    paidQualified: number;
    conversionToPay: number | null;
    simulacros: number;
  };
  cac: { spend: number; paid: number; value: number | null };
  hosts: { total: number; contacted: number; accepted: number; acceptedAt20: number; testHosts: number };
  ab: {
    variants: { variant: 'A' | 'B'; label: string; visits: number; clicks: number; waitlist: number; reservations: number; clickRate: number | null; leadRate: number | null }[];
    enough: boolean;
    diffPp: number | null;
    winner: 'A' | 'B' | null;
    decision: string;
  };
  funnel: { key: string; label: string; value: number; fromPrevious: number | null; fromStart: number | null }[];
  channels: { channel: string; label: string; visits: number; reservations: number; paid: number; spend: number; cac: number | null; overCac: boolean }[];
  value: { real: ValueBlock; simulacro: ValueBlock };
  viability: { salidasDone: number; ready: boolean; conditions: { key: string; label: string; value: number | null; ok: boolean | null }[]; decision: string };
};

export type Profile = { v1: boolean; v2: boolean; v3: boolean; v4: boolean; v5: boolean | null; qualifies: boolean | null };

export type AdminReservation = {
  id: string;
  number: number;
  code: string;
  salidaId: string;
  name: string;
  phone: string;
  email: string | null;
  isAdult: boolean;
  inCali: boolean;
  knowsTeam: boolean;
  heardFrom: string;
  channel: string | null;
  variant: string | null;
  motivation: string;
  intentValid: boolean | null;
  comesAlone: boolean;
  phoneChallenge: boolean;
  challengeCompleted: boolean | null;
  price: number;
  status: ReservationStatus;
  holdUntil: string;
  holdExpired: boolean;
  paymentNote: string | null;
  paymentReportedAt: string | null;
  paidAt: string | null;
  adminNotes: string | null;
  refundNote: string | null;
  isDemo: boolean;
  createdAt: string;
  hasSurveyLink: boolean;
  profile: Profile;
  survey: { nps: number; newContact: boolean; wouldReturn: boolean; cameAlone: boolean; improve: string | null } | null;
  salida?: { title: string; slug: string; startsAt: string; isSimulacro: boolean };
};

export type AdminSalida = {
  id: string;
  slug: string;
  placeId: string;
  hostId: string | null;
  title: string;
  summary: string;
  startsAt: string;
  durationMin: number;
  meetingPoint: string;
  capacity: number;
  minToRun: number;
  price: number;
  serviceFee: number;
  commissionRate: number;
  includes: string[];
  womenOnly: boolean;
  paymentInstructions: string | null;
  status: 'draft' | 'open' | 'closed' | 'done' | 'cancelled';
  isSimulacro: boolean;
  isDemo: boolean;
  hostNewClients: number | null;
  coordinatorHours: number | null;
  commissionPaidAt: string | null;
  commissionPaidAmount: number | null;
  notes: string | null;
  seatsTaken: number;
  place: { name: string; line: Line };
  host: { name: string } | null;
  counts?: Record<ReservationStatus, number>;
  reservations?: AdminReservation[];
};

export type AdminPlace = {
  id: string;
  slug: string;
  line: Line;
  name: string;
  area: string;
  experience: string;
  duration: string;
  distance: string | null;
  refPrice: number;
  note: string | null;
  status: 'active' | 'verify' | 'excluded';
  sortOrder: number;
  _count?: { salidas: number };
};

export type AdminHost = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  organization: string | null;
  activity: string;
  area: string | null;
  rnt: string | null;
  status: 'prospect' | 'contacted' | 'interested' | 'accepted' | 'declined' | 'active';
  commissionAccepted: number | null;
  isTestHost: boolean;
  source: string;
  notes: string | null;
  createdAt: string;
  _count?: { salidas: number };
};
