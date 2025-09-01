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
  console.log('FCM (Background/Killed):', remoteMessage);
  if (remoteMessage.notification?.body) {
    await notifee.displayNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      android: { channelId: 'messages', importance: AndroidImportance.HIGH },
    });
  }
});

AppRegistry.registerComponent(appName, () => App);
