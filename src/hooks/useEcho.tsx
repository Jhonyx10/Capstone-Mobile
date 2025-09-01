import { useEffect } from 'react';
import notifee, {
  AndroidImportance,
  AndroidCategory,
} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

// 🔔 helper to display local notifications
const displayNotification = async (title: string, body: string) => {
  const channelId = await notifee.createChannel({
    id: 'messages',
    name: 'Messages',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      category: AndroidCategory.MESSAGE,
      pressAction: { id: 'messages' },
      smallIcon: 'ic_launcher', // ⚠️ replace with proper monochrome icon
    },
  });
};

export default function useEcho() {
  useEffect(() => {
    (async () => {
      // ✅ Ask for notification permission
      await notifee.requestPermission();
      await messaging().requestPermission();

      // ✅ Get FCM token (send this to Laravel backend)
      const token = await messaging().getToken();
      console.log('📲 FCM Token:', token);
    })();

    // ✅ Foreground message handler
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('📩 FCM Foreground Message:', remoteMessage);

      await displayNotification(
        remoteMessage.notification?.title ?? 'Notification',
        remoteMessage.notification?.body ?? 'You have a new message',
      );
    });

    return () => {
      unsubscribeOnMessage();
    };
  }, []);
}
