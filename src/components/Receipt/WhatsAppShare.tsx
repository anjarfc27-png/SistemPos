import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt } from '@/types/pos';
import { useStore } from '@/contexts/StoreContext';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface WhatsAppShareProps {
  receipt: Receipt;
  formatPrice: (price: number) => string;
}

export const WhatsAppShare = ({ receipt, formatPrice }: WhatsAppShareProps) => {
  const { currentStore } = useStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateReceiptImage = async (): Promise<Blob | null> => {
    try {
      setIsGenerating(true);
      
      // Create temporary div for rendering receipt
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '400px';
      tempDiv.style.padding = '20px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = '"Courier New", monospace';
      
      // Build receipt HTML
      let html = `
        <div style="font-family: 'Courier New', monospace; color: black;">
          <h2 style="text-align: center; font-size: 20px; margin-bottom: 10px; font-weight: bold;">
            ${currentStore?.name || 'NOTA PEMBELIAN'}
          </h2>
          <div style="border-bottom: 2px solid black; margin: 10px 0;"></div>
          <p style="margin: 5px 0;">No: ${receipt.id}</p>
          <p style="margin: 5px 0;">Tanggal: ${receipt.timestamp.toLocaleDateString('id-ID')}</p>
          <p style="margin: 5px 0;">Waktu: ${receipt.timestamp.toLocaleTimeString('id-ID')}</p>
          <div style="border-bottom: 2px solid black; margin: 10px 0;"></div>
      `;
      
      receipt.items.forEach(item => {
        const price = item.finalPrice || item.product.sellPrice;
        const total = price * item.quantity;
        html += `
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-weight: bold;">${item.product.name}</p>
            <p style="margin: 2px 0;">${item.quantity} x ${formatPrice(price)} = ${formatPrice(total)}</p>
          </div>
        `;
      });
      
      html += `
          <div style="border-bottom: 2px solid black; margin: 10px 0;"></div>
          <p style="margin: 5px 0;">Sub Total: ${formatPrice(receipt.subtotal)}</p>
      `;
      
      if (receipt.discount > 0) {
        html += `<p style="margin: 5px 0;">Diskon: ${formatPrice(receipt.discount)}</p>`;
      }
      
      html += `
          <p style="font-size: 18px; font-weight: bold; margin: 5px 0;">Total: ${formatPrice(receipt.total)}</p>
          <div style="border-bottom: 2px solid black; margin: 10px 0;"></div>
          <p style="text-align: center; margin: 5px 0;">Terima kasih atas kunjungan Anda!</p>
          <p style="text-align: center; margin: 5px 0;">${currentStore?.name || 'Toko Kami'}</p>
        </div>
      `;
      
      tempDiv.innerHTML = html;
      document.body.appendChild(tempDiv);
      
      // Generate canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      // Cleanup
      document.body.removeChild(tempDiv);
      
      // Convert to blob
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    } catch (error) {
      console.error('Error generating receipt image:', error);
      toast.error('Gagal membuat gambar nota');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const sendWhatsApp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Nomor WhatsApp tidak valid');
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Try to generate and share image first
    const imageBlob = await generateReceiptImage();
    
    if (imageBlob && navigator.share) {
      // Try Web Share API with image
      try {
        const file = new File([imageBlob], `nota-${receipt.id}.png`, { type: 'image/png' });
        
        // Check if can share files
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Nota ${receipt.id}`,
            text: `Nota dari ${currentStore?.name || 'Toko Kami'}`,
          });
          
          toast.success('Gambar nota berhasil dibagikan!');
          setIsOpen(false);
          return;
        }
      } catch (error) {
        console.error('Web Share API failed:', error);
        // Continue to fallback
      }
    }
    
    // Fallback: Download image + open WhatsApp text
    if (imageBlob) {
      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nota-${receipt.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Gambar nota berhasil diunduh! Silakan kirim manual via WhatsApp');
    }
    
    // Create receipt message (text fallback)
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
          <Button 
            onClick={sendWhatsApp} 
            className="w-full gap-2"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Membuat gambar...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                Kirim via WhatsApp
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
