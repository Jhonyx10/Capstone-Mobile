import { Platform } from 'react-native';
import { requestHint } from 'react-native-otp-verify';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const normalizePhone = (input: string): string | null => {
  const m = input.replace(/\D/g, '').match(/^(63|0)?(9\d{9})$/);
  return m ? `+63${m[2]}` : null;
};

// Opens Google's number picker (Android only)
export async function pickPhoneNumber(): Promise<string | null> {
  if (Platform.OS !== 'android') return null;
  try {
    const hint = await requestHint();
    return hint ? normalizePhone(hint) : null;
  } catch {
    return null; // user dismissed it
  }
}

const key = (phone: string) => `resident_secret:${phone}`;

export const saveSecret = (phone: string, secret: string) =>
  AsyncStorage.setItem(key(phone), secret);

export const getSecret = (phone: string) => AsyncStorage.getItem(key(phone));