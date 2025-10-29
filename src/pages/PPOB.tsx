import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Plus,
  Smartphone, 
  Wifi, 
  Zap, 
  Wallet,
  CreditCard,
  Phone,
  Lightbulb,
  ShoppingBag,
  Tv,
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const PPOB = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('beranda');
  const [depositAmount] = useState(0);

  // Kategori Prabayar dengan warna berbeda
  const prabayarCategories = [
    { id: 'pulsa', name: 'Pulsa Seluler', icon: Smartphone, gradient: 'from-blue-500 to-blue-600' },
    { id: 'paket-data', name: 'Paket Data', icon: Wifi, gradient: 'from-cyan-500 to-cyan-600' },
    { id: 'token-listrik', name: 'Token Listrik', icon: Zap, gradient: 'from-amber-500 to-amber-600' },
    { id: 'e-wallet', name: 'E-Wallet', icon: Wallet, gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'voucher', name: 'Voucher', icon: CreditCard, gradient: 'from-purple-500 to-purple-600' },
  ];

  // Kategori Pascabayar dengan warna berbeda
  const pascabayarCategories = [
    { id: 'telkom', name: 'Telkom', icon: Phone, gradient: 'from-red-500 to-red-600' },
    { id: 'pln', name: 'PLN', icon: Lightbulb, gradient: 'from-yellow-500 to-yellow-600' },
    { id: 'pulsa-pasca', name: 'Pulsa Pasca', icon: Smartphone, gradient: 'from-indigo-500 to-indigo-600' },
    { id: 'pgn', name: 'PGN', icon: DollarSign, gradient: 'from-teal-500 to-teal-600' },
    { id: 'pdam', name: 'PDAM', icon: ShoppingBag, gradient: 'from-blue-400 to-blue-500' },
    { id: 'tv-kabel', name: 'TV Kabel', icon: Tv, gradient: 'from-pink-500 to-pink-600' },
  ];

  const handleDeposit = () => {
    toast.info('Fitur deposit akan segera aktif');
  };

  const handleCategoryClick = (categoryId: string) => {
    toast.info(`Kategori ${categoryId} akan segera aktif setelah integrasi Digiflaz`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background safe-bottom">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-br from-primary to-primary/90 px-4 py-4 shadow-lg sticky top-0 z-20 safe-top">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 h-10 w-10 rounded-full transition-all hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">PPOB</h1>
              <p className="text-xs text-white/80">Payment Point Online Bank</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => toast.info('Fitur atur harga akan segera aktif')}
            className="text-white hover:bg-white/20 text-sm rounded-full px-4 h-9 transition-all hover:scale-105"
          >
            Atur Harga
          </Button>
        </div>
      </div>

      {/* Animated Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-[72px] z-10 shadow-sm">
          <TabsList className="w-full h-12 bg-transparent rounded-none border-0 grid grid-cols-2 max-w-6xl mx-auto">
            <TabsTrigger 
              value="beranda" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-semibold text-gray-600 transition-all"
            >
              Beranda
            </TabsTrigger>
            <TabsTrigger 
              value="riwayat"
              className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none font-semibold text-gray-600 transition-all"
            >
              Riwayat
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4 pb-28 animate-fade-in">
          <TabsContent value="beranda" className="space-y-4 mt-0">
            {/* Enhanced Deposit Card with Animation */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary via-primary to-primary-light overflow-hidden rounded-2xl transform transition-all hover:scale-[1.02] hover:shadow-2xl">
              <CardContent className="p-6 relative">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-white/80" />
                      <p className="text-sm text-white/90 font-medium">Saldo Deposit</p>
                    </div>
                    <p className="text-4xl font-bold text-white drop-shadow-lg">
                      Rp {depositAmount.toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Clock className="h-3 w-3" />
                      <span>Update terakhir: Hari ini</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    className="bg-white hover:bg-white/90 text-primary font-bold shadow-xl rounded-full px-6 h-12 transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Deposit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Animated Banner Promo */}
            <Card className="border-0 shadow-xl overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 transform transition-all hover:scale-[1.02] hover:shadow-2xl">
              <CardContent className="p-6 relative">
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
                </div>
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-white" />
                      <span className="text-xs font-semibold text-white/90 bg-white/20 px-2 py-1 rounded-full">PROMO TERBARU</span>
                    </div>
                    <h3 className="font-bold text-white text-xl drop-shadow">Tri EXTRA BENEFIT</h3>
                    <p className="text-sm text-white/95 font-medium">Dapatkan Bonus Pulsa Nelpon Hingga</p>
                    <p className="text-lg font-bold text-yellow-300 drop-shadow">
                      Rp 10.000,- dan Kuota Youtube Unlimited
                    </p>
                    <p className="text-xs text-white/80 mt-2">*Syarat dan Ketentuan Berlaku</p>
                  </div>
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center ml-4 shadow-xl animate-pulse">
                    <Smartphone className="h-12 w-12 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prabayar Section with Enhanced Animation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-xl text-foreground">Prabayar</h2>
                <span className="text-xs text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">5 Kategori</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {prabayarCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card shadow-md hover:shadow-xl transition-all active:scale-95 border border-border/50 hover:border-primary/50 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-3`}>
                        <Icon className="h-8 w-8 text-white drop-shadow" />
                      </div>
                      <span className="text-xs text-center font-semibold text-foreground">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pascabayar Section with Enhanced Animation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-bold text-xl text-foreground">Pascabayar</h2>
                <span className="text-xs text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">6 Kategori</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {pascabayarCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card shadow-md hover:shadow-xl transition-all active:scale-95 border border-border/50 hover:border-primary/50 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 hover:rotate-3`}>
                        <Icon className="h-8 w-8 text-white drop-shadow" />
                      </div>
                      <span className="text-xs text-center font-semibold text-foreground">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Coming Soon Notice */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl shadow-lg transform transition-all hover:scale-[1.01]">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🚀</span>
                </div>
                <p className="text-sm font-semibold text-foreground mb-2">
                  Fitur PPOB Segera Hadir!
                </p>
                <p className="text-xs text-muted-foreground">
                  Integrasi dengan Digiflaz sedang dalam proses pengembangan
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="riwayat" className="space-y-4 mt-0 animate-fade-in">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="pt-20 pb-20 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 mx-auto mb-6 flex items-center justify-center animate-pulse">
                  <CreditCard className="h-12 w-12 text-primary" />
                </div>
                <p className="text-foreground font-semibold text-lg mb-2">Belum ada riwayat transaksi</p>
                <p className="text-sm text-muted-foreground">
                  Semua transaksi PPOB Anda akan muncul di sini
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Enhanced Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border shadow-2xl safe-bottom z-10">
        <div className="max-w-6xl mx-auto">
          <Button 
            className="w-full h-14 bg-gradient-to-r from-primary via-primary to-primary-light hover:from-primary/90 hover:via-primary/90 hover:to-primary-light/90 shadow-xl text-white font-bold text-lg rounded-2xl transition-all active:scale-95 hover:shadow-2xl"
            onClick={() => toast.info('Fitur akan segera aktif')}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            <span className="mr-2">0 Item</span>
            LANJUTKAN
          </Button>
        </div>
      </div>
    </div>
  );
};
