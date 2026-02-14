'use client';

import dynamic from 'next/dynamic';

const PopupAd = dynamic(() => import('@/components/Advertisement/PopupAd'), { ssr: false });

export default function PopupAdClient() {
  return <PopupAd />;
}
