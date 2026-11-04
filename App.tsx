import Navigation from './src/Navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useEcho from './src/hooks/useEcho';
import './global.css';
import Mapbox from '@rnmapbox/maps';
import useAppStore from './store/useAppStore';
import Config from 'react-native-config';

console.log(
  'token prefix:',
  Config.MAPBOX_TOKEN?.slice(0, 3),
  'length:',
  Config.MAPBOX_TOKEN?.length,
);

const queryClient = new QueryClient();

Mapbox.setAccessToken(useAppStore.getState().mapbox_token);
export default function App() {
  useEcho();

  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
  );
}
