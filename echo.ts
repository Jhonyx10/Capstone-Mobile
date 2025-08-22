// src/utils/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

// ✅ Attach Pusher globally
(global as any).Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'z8diipoeo7875sl4ntvd', // same as REVERB_APP_KEY
  wsHost: '192.168.1.36', // 🔥 Use your Laravel backend local IP (not localhost/127.0.0.1)
  wsPort: 8080,
  forceTLS: false,
  enabledTransports: ['ws'], // Only use WebSocket
  cluster: 'mt1',
});

export default echo;
