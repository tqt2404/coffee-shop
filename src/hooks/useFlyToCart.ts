import { useCallback, useState } from 'react';

export interface FlyingParcel {
  id: number;
  label: string;
  image?: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function useFlyToCart() {
  const [parcels, setParcels] = useState<FlyingParcel[]>([]);
  const [cartPulseKey, setCartPulseKey] = useState(0);

  const launchToCart = useCallback(
    (label: string, origin?: { x: number; y: number }, image?: string) => {
      const cartEl = document.getElementById('header-cart-button');
      const targetRect = cartEl?.getBoundingClientRect();

      const endX = targetRect
        ? targetRect.left + targetRect.width / 2
        : window.innerWidth - 110;
      const endY = targetRect ? targetRect.top + targetRect.height / 2 : 32;
      const startX = origin?.x ?? window.innerWidth / 2;
      const startY = origin?.y ?? window.innerHeight * 0.55;

      const id = Date.now() + Math.floor(Math.random() * 1000);
      setParcels((prev) => [
        ...prev.slice(-4),
        { id, label, image, startX, startY, endX, endY },
      ]);

      window.setTimeout(() => {
        setCartPulseKey((k) => k + 1);
      }, 560);

      window.setTimeout(() => {
        setParcels((prev) => prev.filter((p) => p.id !== id));
      }, 820);
    },
    []
  );

  return { parcels, cartPulseKey, launchToCart };
}
