import { Preferences } from '@capacitor/preferences';

const KEYS = {
  REMEMBER_ME: 'kasirq_remember_me',
  SAVED_IDENTIFIER: 'kasirq_saved_identifier',
  BIOMETRIC_ENABLED: 'kasirq_biometric_enabled',
  SAVED_CREDENTIALS: 'kasirq_saved_credentials',
};

export const secureStorage = {
  // Remember Me
  async setRememberMe(enabled: boolean) {
    await Preferences.set({
      key: KEYS.REMEMBER_ME,
      value: enabled.toString(),
    });
  },

  async getRememberMe(): Promise<boolean> {
    const { value } = await Preferences.get({ key: KEYS.REMEMBER_ME });
    return value === 'true';
  },

  async setSavedIdentifier(identifier: string) {
    await Preferences.set({
      key: KEYS.SAVED_IDENTIFIER,
      value: identifier,
    });
  },

  async getSavedIdentifier(): Promise<string | null> {
    const { value } = await Preferences.get({ key: KEYS.SAVED_IDENTIFIER });
    return value;
  },

  // Biometric
  async setBiometricEnabled(enabled: boolean) {
    await Preferences.set({
      key: KEYS.BIOMETRIC_ENABLED,
      value: enabled.toString(),
    });
  },

  async getBiometricEnabled(): Promise<boolean> {
    const { value } = await Preferences.get({ key: KEYS.BIOMETRIC_ENABLED });
    return value === 'true';
  },

  async saveCredentials(identifier: string, password: string) {
    const credentials = btoa(JSON.stringify({ identifier, password }));
    await Preferences.set({
      key: KEYS.SAVED_CREDENTIALS,
      value: credentials,
    });
  },

  async getCredentials(): Promise<{ identifier: string; password: string } | null> {
    const { value } = await Preferences.get({ key: KEYS.SAVED_CREDENTIALS });
    if (!value) return null;
    
    try {
      const decoded = atob(value);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  },

  async clearAll() {
    await Preferences.remove({ key: KEYS.REMEMBER_ME });
    await Preferences.remove({ key: KEYS.SAVED_IDENTIFIER });
    await Preferences.remove({ key: KEYS.BIOMETRIC_ENABLED });
    await Preferences.remove({ key: KEYS.SAVED_CREDENTIALS });
  },
};
