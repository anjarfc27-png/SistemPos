import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt } from '@/types/pos';
import { useStore } from '@/contexts/StoreContext';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppShareProps {
  receipt: Receipt;
  formatPrice: (price: number) => string;
}

export const WhatsAppShare = ({ receipt, formatPrice }: WhatsAppShareProps) => {
  const { currentStore } = useStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, '');
    
    // If starts with 0, replace with 62
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    
    // If doesn't start with 62, add it
    if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow digits
    const cleaned = input.replace(/\D/g, '');
    
    // Auto-add +62 prefix display
    if (cleaned.length === 0) {
      setPhoneNumber('');
    } else if (cleaned.startsWith('62')) {
      setPhoneNumber(cleaned);
    } else if (cleaned.startsWith('0')) {
      setPhoneNumber('62' + cleaned.substring(1));
    } else {
      setPhoneNumber('62' + cleaned);
    }
  };

  const sendWhatsApp = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Nomor WhatsApp tidak valid');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Create receipt message
    let message = `*${currentStore?.name || 'NOTA PEMBELIAN'}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `No: ${receipt.id}\n`;
    message += `Tanggal: ${receipt.timestamp.toLocaleDateString('id-ID')}\n`;
    message += `Waktu: ${receipt.timestamp.toLocaleTimeString('id-ID')}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Items
    receipt.items.forEach(item => {
      const price = item.finalPrice || item.product.sellPrice;
      const total = price * item.quantity;
      message += `${item.product.name}\n`;
      message += `${item.quantity} x ${formatPrice(price)} = ${formatPrice(total)}\n\n`;
    });
    
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Sub Total: ${formatPrice(receipt.subtotal)}\n`;
    
    if (receipt.discount > 0) {
      message += `Diskon: ${formatPrice(receipt.discount)}\n`;
    }
    
    message += `*Total: ${formatPrice(receipt.total)}*\n`;
    message += `Bayar: ${formatPrice(receipt.total)}\n`;
    message += `Kembali: Rp 0\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Terima kasih atas kunjungan Anda!\n`;
    message += `${currentStore?.name || 'Toko Kami'}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    toast.success('Membuka WhatsApp...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Kirim WhatsApp
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kirim Nota via WhatsApp</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <div className="flex gap-2 mt-2">
              <div className="flex items-center px-3 border rounded-md bg-muted">
                <span className="text-sm font-medium">+62</span>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="8123456789"
                value={phoneNumber.replace('62', '')}
                onChange={handlePhoneChange}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Masukkan nomor tanpa +62 atau 0
            </p>
          </div>
          <Button onClick={sendWhatsApp} className="w-full gap-2">
            <MessageSquare className="h-4 w-4" />
            Kirim via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
