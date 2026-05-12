import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Llave pública generada para Web Push
const publicVapidKey = 'BOWgacrEwi9fJHKjwgn6BRykjH_pGv10KXmFrtc2bHtiaZpFGJIJ_kf4xs1-NB38qPQwaD7Lsf3XjRTZmXpfQUI';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePush(userId) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && userId) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const checkSubscription = async () => {
    try {
      // Registramos manualmente nuestro SW seguro que SOLO escucha notificaciones
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Tu navegador no soporta Service Workers o estás en modo incógnito estricto.');
      return;
    }
    if (!userId) {
      alert('No se detectó el ID de usuario.');
      return;
    }
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Debes conceder permisos en el navegador para recibir alertas.');
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      const { error } = await supabase
        .from('profiles')
        .update({ push_subscription: subscription })
        .eq('id', userId);

      if (error) throw error;
      
      setIsSubscribed(true);
      alert('¡Notificaciones activadas exitosamente!');
    } catch (error) {
      console.error('Error suscribiendo a push:', error);
      alert('Hubo un error al activar las notificaciones.');
    } finally {
      setLoading(false);
    }
  };

  return { isSubscribed, subscribe, loading };
}
