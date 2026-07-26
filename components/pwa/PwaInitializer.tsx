'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/registerServiceWorker';

export default function PwaInitializer() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
