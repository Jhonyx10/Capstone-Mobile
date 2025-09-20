import Navigation from './src/Navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useEcho from './src/hooks/useEcho';
import './global.css';
import { View } from 'react-native';

const queryClient = new QueryClient();

export default function App() {
  useEcho();

  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
    </QueryClientProvider>
  );
}
