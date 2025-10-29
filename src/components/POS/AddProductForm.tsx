import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PriceInput } from '@/components/ui/price-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Scan } from 'lucide-react';
import { Product } from '@/types/pos';
import { QuantitySelector } from './QuantitySelector';
import { toast } from 'sonner';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';
import { Torch } from '@capawesome/capacitor-torch';
import { useStore } from '@/contexts/StoreContext';
import { BarcodeScannerUI } from '@/components/barcode/BarcodeScannerUI';

interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (productId: string, updates: Partial<Product>) => void;
  products?: Product[];
  onClose: () => void;
}

export default function AddProductForm({ onAddProduct, onUpdateProduct, products = [], onClose }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    costPrice: '',
    sellPrice: '',
    stock: '',
    category: '',
    code: '',
    barcode: '',
    isPhotocopy: false,
  });
  const [isService, setIsService] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(0);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const { currentStore } = useStore();
  const isAtkStore = currentStore?.category === 'atk';

  useEffect(() => {
    if (currentStore?.category !== 'atk' && formData.isPhotocopy) {
      setFormData(prev => ({ ...prev, isPhotocopy: false }));
    }
  }, [currentStore?.category, formData.isPhotocopy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sellPrice) {
      return;
    }

    // Check if code or barcode already exists
    if (formData.code && formData.code.trim()) {
      const existingCode = products.find(p => 
        p.code && p.code.toLowerCase() === formData.code.toLowerCase() &&
        p.name.toLowerCase().trim() !== formData.name.toLowerCase().trim()
      );
      if (existingCode) {
        toast.error(`Kode "${formData.code}" sudah digunakan oleh produk "${existingCode.name}"`);
        return;
      }
    }

    if (formData.barcode && formData.barcode.trim()) {
      const existingBarcode = products.find(p => 
        p.barcode && p.barcode.toLowerCase() === formData.barcode.toLowerCase() &&
        p.name.toLowerCase().trim() !== formData.name.toLowerCase().trim()
      );
      if (existingBarcode) {
        toast.error(`Barcode "${formData.barcode}" sudah digunakan oleh produk "${existingBarcode.name}"`);
        return;
      }
    }

    // Check if product with same name already exists
    const existingProduct = products.find(p => 
      p.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
    );

    if (existingProduct && onUpdateProduct) {
      // Update existing product stock
      onUpdateProduct(existingProduct.id, {
        stock: existingProduct.stock + (stockQuantity || 0),
        costPrice: parseFloat(formData.costPrice.replace(/\./g, '')) || existingProduct.costPrice,
        sellPrice: parseFloat(formData.sellPrice.replace(/\./g, '')) || existingProduct.sellPrice,
        category: formData.category || existingProduct.category,
      });
    } else {
      // Create new product
      console.log('AddProductForm Debug - Creating product:', {
        formData,
        stockQuantity,
        isService,
        finalStock: (formData.isPhotocopy || isService) ? 0 : (stockQuantity || 0)
      });
      onAddProduct({
        name: formData.name,
        costPrice: parseFloat(formData.costPrice.replace(/\./g, '')) || 0,
        sellPrice: parseFloat(formData.sellPrice.replace(/\./g, '')),
        stock: (formData.isPhotocopy || isService) ? 0 : (stockQuantity || 0),
        category: formData.category || undefined,
        code: formData.code || undefined,
        barcode: formData.barcode || undefined,
        isPhotocopy: formData.isPhotocopy,
      });
    }

    // Reset form
    setFormData({
      name: '',
      costPrice: '',
      sellPrice: '',
      stock: '',
      category: '',
      code: '',
      barcode: '',
      isPhotocopy: false,
    });
    setStockQuantity(0);
    setIsService(false);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Don't auto-close, keep form open for continuous adding
    // Force a small delay to ensure state updates properly
    setTimeout(() => {
      // This will trigger a re-render in components consuming the context
      setFormData(prev => ({ ...prev }));
    }, 100);
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    
    if (value.length > 0) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectSuggestion(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (product: Product) => {
    setFormData({
      name: product.name,
      costPrice: product.costPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      stock: '',
      category: product.category || '',
      code: product.code || '',
      barcode: product.barcode || '',
      isPhotocopy: product.isPhotocopy || false,
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleScanBarcode = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        toast.error('Barcode scanner hanya tersedia di aplikasi mobile');
        return;
      }

      const { camera } = await BarcodeScanner.requestPermissions();
      if (camera !== 'granted') {
        toast.error('Izin kamera diperlukan untuk scan barcode');
        return;
      }

      console.log('Starting barcode scan...');

      setIsScanning(true);
      document.querySelector('body')?.classList.add('barcode-scanner-active');

      let handled = false;

      const onResult = async (raw: any) => {
        if (handled) return;
        handled = true;
        const scannedCode = raw.displayValue || raw.rawValue || raw;

        console.log('Barcode scanned:', scannedCode);

        await BarcodeScanner.removeAllListeners();
        await BarcodeScanner.stopScan();
        document.querySelector('body')?.classList.remove('barcode-scanner-active');
        
        try {
          const torchStatus = await Torch.isEnabled();
          if (torchStatus.enabled) await Torch.disable();
        } catch (e) {}
        
        setIsScanning(false);

        const foundProduct = products.find(p => 
          p.barcode === scannedCode || p.code === scannedCode
        );

        if (foundProduct) {
          setFormData({
            name: foundProduct.name,
            costPrice: foundProduct.costPrice.toString(),
            sellPrice: foundProduct.sellPrice.toString(),
            stock: '',
            category: foundProduct.category || '',
            code: foundProduct.code || '',
            barcode: foundProduct.barcode || '',
            isPhotocopy: foundProduct.isPhotocopy || false,
          });
          toast.success(`Produk ditemukan: ${foundProduct.name}. Masukkan jumlah stok.`);
        } else {
          setFormData(prev => ({
            ...prev,
            barcode: scannedCode,
          }));
          toast.success(`Barcode discan: ${scannedCode}. Lengkapi data produk.`);
        }
      };

      // Use barcodesScanned event (MLKit standard)
      await BarcodeScanner.addListener('barcodesScanned', async (event) => {
        console.log('barcodesScanned event fired:', event);
        if (event.barcodes && event.barcodes.length > 0) {
          await onResult(event.barcodes[0]);
        }
      });

      console.log('Listener added, starting scan...');

      await BarcodeScanner.startScan();
      console.log('Scan started successfully');
    } catch (error) {
      console.error('Barcode scan error:', error);
      await BarcodeScanner.removeAllListeners();
      await BarcodeScanner.stopScan();
      document.querySelector('body')?.classList.remove('barcode-scanner-active');
      try {
        const torchStatus = await Torch.isEnabled();
        if (torchStatus.enabled) await Torch.disable();
      } catch (e) {}
      setIsScanning(false);
      toast.error('Gagal scan barcode');
    }
  };

  const stopScanning = async () => {
    try {
      const torchStatus = await Torch.isEnabled();
      if (torchStatus.enabled) await Torch.disable();
    } catch (e) {}
    await BarcodeScanner.removeAllListeners();
    await BarcodeScanner.stopScan();
    document.querySelector('body')?.classList.remove('barcode-scanner-active');
    setIsScanning(false);
  };

  return (
    <Card className="pos-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Produk/Layanan Baru
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="product" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="product">Produk</TabsTrigger>
            <TabsTrigger value="service">Layanan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="product">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Masukkan nama produk"
                    required
                  />
                  {showSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
                      {suggestions.map((product, index) => (
                        <div
                          key={product.id}
                          className={`px-3 py-2 cursor-pointer ${
                            index === selectedSuggestionIndex 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => selectSuggestion(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Stok: {product.stock} | {product.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="costPrice">Harga Kulakan (opsional)</Label>
                  <PriceInput
                    id="costPrice"
                    value={formData.costPrice}
                    onChange={(value) => setFormData({ ...formData, costPrice: value })}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sellPrice">Harga Jual *</Label>
                  <PriceInput
                    id="sellPrice"
                    value={formData.sellPrice}
                    onChange={(value) => setFormData({ ...formData, sellPrice: value })}
                    placeholder="0"
                    required
                  />
                </div>
                

                <div>
                  <Label htmlFor="code">Kode Produk (opsional)</Label>
                  <Input
                    id="code"
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Kode produk untuk input cepat"
                    className="h-9 sm:h-10 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="barcode">Barcode (opsional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="Barcode untuk scanner"
                      className="h-9 sm:h-10 text-sm flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleScanBarcode} 
                      disabled={isScanning}
                      className="h-9 sm:h-10"
                    >
                      <Scan className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label>Jumlah Stok (opsional)</Label>
                  <QuantitySelector
                    quantity={stockQuantity}
                    productName={formData.name}
                    category={formData.category}
                    onQuantityChange={(newQuantity) => {
                      console.log('AddProductForm - Stock quantity changed:', { from: stockQuantity, to: newQuantity });
                      setStockQuantity(newQuantity);
                    }}
                    showUnitSelector={true}
                  />
                </div>
                
                {isAtkStore && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPhotocopy"
                      checked={formData.isPhotocopy}
                      onChange={(e) => setFormData({ ...formData, isPhotocopy: e.target.checked })}
                      className="rounded border border-input"
                    />
                    <Label htmlFor="isPhotocopy" className="text-sm">
                      Layanan Fotocopy (Tiered Pricing) - Hanya untuk Toko ATK
                    </Label>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" variant="success">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="service">
            <form onSubmit={(e) => { setIsService(true); handleSubmit(e); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceName">Nama Layanan *</Label>
                  <Input
                    id="serviceName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama layanan"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="serviceCost">Biaya Operasional (opsional)</Label>
                  <PriceInput
                    id="serviceCost"
                    value={formData.costPrice}
                    onChange={(value) => setFormData({ ...formData, costPrice: value })}
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="servicePrice">Harga Layanan *</Label>
                  <PriceInput
                    id="servicePrice"
                    value={formData.sellPrice}
                    onChange={(value) => setFormData({ ...formData, sellPrice: value })}
                    placeholder="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="serviceCategory">Kategori</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                      <SelectContent>
                        {isAtkStore && (
                          <SelectItem value="Fotocopy">Fotocopy</SelectItem>
                        )}
                        <SelectItem value="Laminasi">Laminasi</SelectItem>
                        <SelectItem value="Jilid">Jilid</SelectItem>
                        <SelectItem value="Scan">Scan</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" variant="success">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Layanan
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Batal
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>

      {isScanning && (
        <BarcodeScannerUI onCancel={stopScanning} />
      )}
    </Card>
  );
}