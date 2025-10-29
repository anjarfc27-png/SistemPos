import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';
import { toast } from 'sonner';
import { FileText, Save } from 'lucide-react';

export const ReceiptCustomization = () => {
  const { currentStore, updateStore } = useStore();
  const [formData, setFormData] = useState({
    receipt_header: '',
    receipt_footer: '',
    receipt_contact: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentStore) {
      setFormData({
        receipt_header: (currentStore as any).receipt_header || currentStore.name || '',
        receipt_footer: (currentStore as any).receipt_footer || 'Terima kasih atas kunjungan Anda!',
        receipt_contact: (currentStore as any).receipt_contact || currentStore.address || '',
      });
    }
  }, [currentStore]);

  const handleSave = async () => {
    if (!currentStore) return;

    setIsSaving(true);

    try {
      const payload: any = {
        receipt_header: formData.receipt_header,
        receipt_footer: formData.receipt_footer,
        receipt_contact: formData.receipt_contact,
      };

      await updateStore(currentStore.id, payload);
      toast.success('Format nota berhasil disimpan');
    } catch (error) {
      console.error('Error saving receipt customization:', error);
      toast.error('Gagal menyimpan format nota');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Format Nota Kustom
        </CardTitle>
        <CardDescription>
          Sesuaikan tampilan header dan footer nota sesuai keinginan Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview Section */}
        <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30">
          <p className="text-sm font-semibold mb-3 text-center">Preview Nota</p>
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-sm mx-auto font-mono text-sm">
            {/* Header */}
            <div className="text-center mb-4 whitespace-pre-line">
              <div className="font-bold text-base mb-1">{formData.receipt_header || 'Nama Toko'}</div>
              <div className="text-xs">{formData.receipt_contact || 'Alamat & Kontak'}</div>
            </div>
            
            <div className="border-t border-dashed my-3"></div>
            
            {/* Sample Items */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>No.0-1</span>
                <span>Kasir: Irfan</span>
              </div>
              <div className="flex justify-between">
                <span>2025-10-11</span>
                <span>11:40:57</span>
              </div>
            </div>
            
            <div className="border-t border-dashed my-3"></div>
            
            <div className="space-y-2 text-xs">
              <div>
                <div className="font-semibold">aqua</div>
                <div className="flex justify-between">
                  <span>6 x Rp 6.000</span>
                  <span>Rp 36.000</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-dashed my-3"></div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>Rp 36.000</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>Rp 36.000</span>
              </div>
              <div className="flex justify-between">
                <span>Bayar (Cash)</span>
                <span>Rp 50.000</span>
              </div>
              <div className="flex justify-between">
                <span>Kembali</span>
                <span>Rp 14.000</span>
              </div>
            </div>
            
            <div className="border-t border-dashed my-3"></div>
            
            {/* Footer */}
            <div className="text-center text-xs whitespace-pre-line">
              {formData.receipt_footer || 'Terima kasih!'}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="receipt_header">Header Nota (Nama Toko)</Label>
            <Input
              id="receipt_header"
              value={formData.receipt_header}
              onChange={(e) => setFormData(prev => ({ ...prev, receipt_header: e.target.value }))}
              placeholder="Toko Anjar"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nama toko yang akan ditampilkan di bagian atas nota
            </p>
          </div>

          <div>
            <Label htmlFor="receipt_contact">Info Kontak (Alamat & Telepon)</Label>
            <Textarea
              id="receipt_contact"
              value={formData.receipt_contact}
              onChange={(e) => setFormData(prev => ({ ...prev, receipt_contact: e.target.value }))}
              placeholder="4PHM+4GF, Gajah, Kec. Gajah, Kabupaten Demak,&#10;Jawa Tengah 59581, Indonesia&#10;249353920251011114057"
              rows={3}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Alamat lengkap dan informasi kontak toko
            </p>
          </div>

          <div>
            <Label htmlFor="receipt_footer">Footer Nota (Pesan Penutup)</Label>
            <Textarea
              id="receipt_footer"
              value={formData.receipt_footer}
              onChange={(e) => setFormData(prev => ({ ...prev, receipt_footer: e.target.value }))}
              placeholder="Terima kasih atas kunjungan Anda!&#10;&#10;Link Kritik dan Saran:&#10;kasirpintar.co.id/e-receipt/S-0BXFS9-08R8IN2"
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pesan yang akan ditampilkan di bagian bawah nota
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Menyimpan...' : 'Simpan Format Nota'}
        </Button>
      </CardContent>
    </Card>
  );
};
