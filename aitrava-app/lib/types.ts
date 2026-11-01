export type Line = 'URBANO' | 'NATURALEZA' | 'ESCAPADA';

export type Place = {
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
};

export type Salida = {
  slug: string;
  title: string;
  summary: string;
  startsAt: string;
  durationMin: number;
  meetingPoint: string;
  capacity: number;
  minToRun: number;
  /** Link de pago (Wompi). Si existe, se compra en línea. */
  paymentUrl: string | null;
  seatsTaken: number;
  seatsLeft: number;
  price: number;
  serviceFee: number;
  includes: string[];
  womenOnly: boolean;
  isDemo: boolean;
  isSimulacro: boolean;
  status: 'draft' | 'open' | 'closed' | 'done' | 'cancelled';
  bookable: boolean;
  place: { slug: string; name: string; area: string; line: Line };
  host: { name: string; organization: string | null; hasRnt: boolean } | null;
};

export type ReservationStatus =
  | 'requested'
  | 'confirmed'
  | 'payment_reported'
  | 'paid'
  | 'attended'
  | 'no_show'
  | 'cancelled'
  | 'expired';

export type ReservationView = {
  code: string;
  name: string;
  status: ReservationStatus;
  holdUntil: string;
  price: number;
  serviceFee: number;
  phoneChallenge: boolean;
  comesAlone: boolean;
  createdAt: string;
  paymentReportedAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  refundNote: string | null;
  isDemo: boolean;
  salida: {
    slug: string;
    title: string;
    startsAt: string;
    durationMin: number;
    meetingPoint: string;
    includes: string[];
    status: Salida['status'];
    place: { name: string; area: string; line: Line };
  };
  paymentInstructions: string | null;
  paymentUrl: string | null;
  refund: { percent: number; text: string };
  refundPolicy: string[];
  can: { reportPayment: boolean; cancel: boolean; survey: boolean };
  surveyDone: boolean;
};

export type PublicConfig = {
  holdHours: number;
  refundPolicy: string[];
  channels: Record<string, string>;
  lines: Record<Line, { label: string; detail: string; refTicket: number }>;
};

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
