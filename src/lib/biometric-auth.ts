import { BiometricAuth, CheckBiometryResult, BiometryType } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export const biometricAuth = {
  async isAvailable(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      const result: CheckBiometryResult = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch {
      return false;
    }
  },

  async getBiometryType(): Promise<BiometryType | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      const result: CheckBiometryResult = await BiometricAuth.checkBiometry();
      return result.biometryType;
    } catch {
      return null;
    }
  },

  async authenticate(reason: string = 'Login ke KasirQ'): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Batal',
        allowDeviceCredential: true,
        iosFallbackTitle: 'Gunakan Password',
        androidTitle: 'Verifikasi Biometrik',
        androidSubtitle: reason,
        androidConfirmationRequired: false,
      });
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  },

  getBiometricIcon(biometryType: BiometryType | null): string {
    switch (biometryType) {
      case BiometryType.fingerprintAuthentication:
        return '👆';
      case BiometryType.faceAuthentication:
        return '😊';
      case BiometryType.irisAuthentication:
        return '👁️';
      default:
        return '🔐';
    }
  },

  getBiometricLabel(biometryType: BiometryType | null): string {
    switch (biometryType) {
      case BiometryType.fingerprintAuthentication:
        return 'Fingerprint';
      case BiometryType.faceAuthentication:
        return 'Face ID';
      case BiometryType.irisAuthentication:
        return 'Iris';
      default:
        return 'Biometrik';
    }
  },
};
