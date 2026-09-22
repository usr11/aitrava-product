export type User = { id: string; name: string; email: string; role: 'USER' | 'ADMIN'; referralCode: string };

export type Breakdown = {
  plan: string;
  planName: string;
  transporte: number;
  alojamiento: number;
  experiencias: number;
  tarifa: number;
  addOn: number;
  total: number;
};

export type ClueView = { order: number; type: string; unlockAt: string; paid: boolean; locked: boolean; text: string | null };

export type DestinationView = { slug: string; name: string; region: string; imageUrl: string; description: string };

export type ItineraryDay = { day: number; title: string; items: string[] };

export type TripStatus = 'GENERATED' | 'RESERVED' | 'REVEALED' | 'COMPLETED';

export type Trip = {
  id: string;
  status: TripStatus;
  originCity: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budgetTotal: number;
  breakdown: Breakdown;
  plan: string | null;
  amountPaid: number | null;
  vibes: string[];
  isGift: boolean;
  giftTo: string | null;
  giftMessage: string | null;
  shareCode: string;
  revealAt: string;
  canReveal: boolean;
  rerolls: number;
  aiGenerated: boolean;
  clues: ClueView[];
  ownerGuess: { destination: string; correct: boolean | null } | null;
  friendGuesses: { name: string; destination: string | null; correct: boolean | null }[];
  destination: DestinationView | null;
  itinerary: ItineraryDay[] | null;
  aiReason: string | null;
  createdAt: string;
};

export type SharedTrip = {
  ownerName: string;
  status: TripStatus;
  isGift: boolean;
  giftTo: string | null;
  giftMessage: string | null;
  startDate: string;
  travelers: number;
  vibes: string[];
  revealAt: string;
  clues: ClueView[];
  guesses: { name: string; isOwner: boolean; destination: string | null; correct: boolean | null }[];
  destination: DestinationView | null;
  referralCode: string;
};

export type DestinationOption = { slug: string; name: string; region: string };
