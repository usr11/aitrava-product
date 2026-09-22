'use client';

import { useParams } from 'next/navigation';
import { SharedTripView } from '@/components/SharedTripView';

export default function SharedPage() {
  const { code } = useParams<{ code: string }>();
  return <SharedTripView code={code} mode="friend" />;
}
