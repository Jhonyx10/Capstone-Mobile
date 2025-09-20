/**
 * @format
 */

// index.js

import { AppRegistry } from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background/Killed Message:', remoteMessage);

  const title = remoteMessage.data?.title ?? 'Notification';
  const body = remoteMessage.data?.body ?? 'You have a new message';

  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId: 'messages',
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
      smallIcon: 'ic_launcher', // ⚠️ must be a valid monochrome resource in android/app/src/main/res/drawable
    },
  });
});

AppRegistry.registerComponent(appName, () => App);
