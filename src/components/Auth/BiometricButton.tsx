import { Button } from '@/components/ui/button';
import { BiometryType } from '@aparajita/capacitor-biometric-auth';
import { biometricAuth } from '@/lib/biometric-auth';

interface BiometricButtonProps {
  biometryType: BiometryType | null;
  isEnabled: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export const BiometricButton = ({ 
  biometryType, 
  isEnabled, 
  isLoading = false,
  onClick 
}: BiometricButtonProps) => {
  const icon = biometricAuth.getBiometricIcon(biometryType);
  const label = biometricAuth.getBiometricLabel(biometryType);

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={isLoading}
      className="h-[42px] px-4 border-l-2 rounded-l-none flex items-center gap-2 hover:bg-primary/10 transition-colors"
      title={isEnabled ? `Login dengan ${label}` : 'Aktifkan biometrik'}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs hidden sm:inline">
        {isEnabled ? label : 'Aktifkan'}
      </span>
    </Button>
  );
};
