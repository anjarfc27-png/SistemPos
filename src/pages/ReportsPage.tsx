import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Download, Calendar, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Receipt as ReceiptComponent } from '@/components/POS/Receipt';
import { usePOSContext } from '@/contexts/POSContext';
import { Receipt } from '@/types/pos';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export const ReportsPage = () => {
  const { receipts, formatPrice } = usePOSContext();
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredReceipts = useMemo(() => {
    let filtered = receipts.filter(receipt => {
      if (receipt.isManual || receipt.id.startsWith('MNL-')) return false;
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      const matchesId = receipt.id.toLowerCase().includes(query);
      const matchesDate = new Date(receipt.timestamp).toLocaleDateString('id-ID').includes(query);
      const matchesProducts = receipt.items.some(item => 
        item.product.name.toLowerCase().includes(query)
      );
      
      return matchesId || matchesDate || matchesProducts;
    });

    // Apply time filter
    const now = new Date();
    if (filter === 'today') {
      filtered = filtered.filter(r => {
        const receiptDate = new Date(r.timestamp);
        return receiptDate.toDateString() === now.toDateString();
      });
    } else if (filter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter(r => new Date(r.timestamp) >= weekAgo);
    } else if (filter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filtered = filtered.filter(r => new Date(r.timestamp) >= monthAgo);
    }

    return filtered;
  }, [receipts, searchQuery, filter]);

  // Group by date
  const groupedReceipts = useMemo(() => {
    const groups: { [key: string]: Receipt[] } = {};
    filteredReceipts.forEach(receipt => {
      const date = format(new Date(receipt.timestamp), 'dd MMMM yyyy', { locale: localeId });
      if (!groups[date]) groups[date] = [];
      groups[date].push(receipt);
    });
    return groups;
  }, [filteredReceipts]);

  // Calculate summary
  const summary = useMemo(() => {
    const total = filteredReceipts.reduce((sum, r) => sum + r.total, 0);
    const transactions = filteredReceipts.length;
    const avg = transactions > 0 ? total / transactions : 0;
    return { total, transactions, avg };
  }, [filteredReceipts]);

  const handleViewReceipt = (receipt: Receipt) => {
    setViewingReceipt(receipt);
  };

  const handlePrintReceipt = (receipt: Receipt) => {
    window.print();
  };

  const handleBackToReports = () => {
    setViewingReceipt(null);
  };

  if (viewingReceipt) {
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="container mx-auto p-2 sm:p-4 max-w-4xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToReports}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Kembali</span>
              </Button>
              <h1 className="text-lg sm:text-2xl font-bold">Detail Transaksi</h1>
            </div>

            <ReceiptComponent
              receipt={viewingReceipt}
              formatPrice={formatPrice}
              onBack={handleBackToReports}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-blue-50/30 animate-fade-in-up">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-2xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Laporan Penjualan
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Kelola dan pantau riwayat transaksi Anda
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <Link to="/">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 animate-scale-in">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-white/80">Total Revenue</p>
                <p className="text-2xl font-bold text-white mt-1">{formatPrice(summary.total)}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 animate-scale-in" style={{ animationDelay: '100ms' }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-white/80">Transaksi</p>
                <p className="text-2xl font-bold text-white mt-1">{summary.transactions}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 animate-scale-in" style={{ animationDelay: '200ms' }}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-white/80">Rata-rata</p>
                <p className="text-2xl font-bold text-white mt-1">{formatPrice(summary.avg)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari invoice, produk, atau tanggal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    Semua
                  </Button>
                  <Button
                    variant={filter === 'today' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('today')}
                  >
                    Hari Ini
                  </Button>
                  <Button
                    variant={filter === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('week')}
                  >
                    7 Hari
                  </Button>
                  <Button
                    variant={filter === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('month')}
                  >
                    30 Hari
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <div className="space-y-6">
            {Object.keys(groupedReceipts).length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-16 pb-16 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">Tidak ada transaksi ditemukan</p>
                  <p className="text-sm text-muted-foreground mt-2">Coba ubah filter atau kata kunci pencarian</p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedReceipts).map(([date, dateReceipts]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">{date}</h3>
                    <Badge variant="secondary">{dateReceipts.length} transaksi</Badge>
                  </div>
                  <div className="space-y-3">
                    {dateReceipts.map((receipt) => (
                      <Card
                        key={receipt.id}
                        className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleViewReceipt(receipt)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10">
                                  <ShoppingCart className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">Invoice #{receipt.id.slice(-6)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {receipt.items.length} items • {format(new Date(receipt.timestamp), 'HH:mm')}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-14">
                                <Badge variant="outline" className="text-xs">
                                  {receipt.paymentMethod || 'Tunai'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">{formatPrice(receipt.total)}</p>
                              <p className="text-xs text-muted-foreground">
                                Profit: {formatPrice(receipt.profit)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};