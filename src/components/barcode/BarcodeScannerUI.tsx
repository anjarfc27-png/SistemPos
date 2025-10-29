import { useEffect, useState } from 'react';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Torch } from '@capawesome/capacitor-torch';
import { Button } from '@/components/ui/button';
import { X, Zap, ZapOff } from 'lucide-react';

interface BarcodeScannerUIProps {
  onCancel: () => void;
}

export const BarcodeScannerUI = ({ onCancel }: BarcodeScannerUIProps) => {
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  useEffect(() => {
    checkTorchAvailability();
  }, []);

  const checkTorchAvailability = async () => {
    try {
      const { available } = await Torch.isAvailable();
      setTorchAvailable(available);
    } catch (e) {
      setTorchAvailable(false);
    }
  };

  const toggleTorch = async () => {
    try {
      await Torch.toggle();
      setTorchEnabled((prev) => !prev);
    } catch (error) {
      console.error('Torch toggle error:', error);
    }
  };

  return (
    <div className="barcode-scanner-modal fixed inset-0 z-[9999] flex flex-col">
      {/* Controls */}
      <div className="safe-top absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-[10001]">
        <Button
          variant="secondary"
          size="lg"
          onClick={onCancel}
          className="bg-black/60 hover:bg-black/80 text-white border-2 border-white backdrop-blur-md"
        >
          <X className="h-5 w-5 mr-2" />
          Batal
        </Button>

        {torchAvailable && (
          <Button
            variant="secondary"
            size="lg"
            onClick={toggleTorch}
            className={`border-2 border-white backdrop-blur-md ${
              torchEnabled
                ? 'bg-primary/80 hover:bg-primary text-white'
                : 'bg-black/60 hover:bg-black/80 text-white'
            }`}
          >
            {torchEnabled ? (
              <>
                <Zap className="h-5 w-5 mr-2 fill-current" />
                Flash ON
              </>
            ) : (
              <>
                <ZapOff className="h-5 w-5 mr-2" />
                Flash
              </>
            )}
          </Button>
        )}
      </div>

      {/* Focus Area */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-primary rounded-lg z-[10000]">
        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-white"></div>
        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-white"></div>
        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-white"></div>
        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-white"></div>
      </div>

      {/* Instruction Text */}
      <div className="safe-bottom absolute bottom-0 left-0 right-0 p-6 flex justify-center z-[10001]">
        <div className="bg-black/60 text-white px-6 py-3 rounded-lg backdrop-blur-md text-center">
          <p className="text-lg font-semibold">Arahkan kamera ke barcode</p>
        </div>
      </div>

      {/* Dark overlay around focus area */}
      <div className="absolute inset-0 z-[9999]" style={{
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
      }}></div>
    </div>
  );
};
