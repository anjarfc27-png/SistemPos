import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { usePOSContext } from "@/contexts/POSContext";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, BarChart3 } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { loading, isAdminCheckComplete } = useAuth();
  const { currentStore } = useStore();
  const { receipts, formatPrice, products } = usePOSContext();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | '3months' | 'year'>('today');

  useEffect(() => {
    document.title = "Analytics - KasirQ POS";
  }, []);

  const analytics = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    if (timeRange === 'today') {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (timeRange === 'week') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (timeRange === 'month') {
      startDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (timeRange === '3months') {
      startDate = new Date(now.setMonth(now.getMonth() - 3));
    } else {
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
    }

    const filteredReceipts = receipts.filter(r => {
      const receiptDate = new Date(r.timestamp);
      return receiptDate >= startDate && !r.isManual && !r.id.startsWith('MNL-');
    });

    const revenue = filteredReceipts.reduce((sum, r) => sum + r.total, 0);
    const profit = filteredReceipts.reduce((sum, r) => sum + r.profit, 0);
    const transactions = filteredReceipts.length;
    const avgTransaction = transactions > 0 ? revenue / transactions : 0;

    // Weekly data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayReceipts = receipts.filter(r => {
        const rd = new Date(r.timestamp);
        return rd.toDateString() === date.toDateString() && !r.isManual;
      });
      weeklyData.push({
        name: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()],
        revenue: dayReceipts.reduce((sum, r) => sum + r.total, 0),
        profit: dayReceipts.reduce((sum, r) => sum + r.profit, 0),
        transactions: dayReceipts.length,
      });
    }

    // Top products
    const productSales: { [key: string]: number } = {};
    filteredReceipts.forEach(receipt => {
      receipt.items.forEach(item => {
        if (!productSales[item.product.name]) {
          productSales[item.product.name] = 0;
        }
        productSales[item.product.name] += item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Payment methods
    const paymentMethods: { [key: string]: number } = {};
    filteredReceipts.forEach(r => {
      const method = r.paymentMethod || 'Tunai';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    return {
      revenue,
      profit,
      transactions,
      avgTransaction,
      weeklyData,
      topProducts,
      paymentData
    };
  }, [receipts, timeRange]);

  if (loading || !isAdminCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="min-h-screen w-full bg-background animate-fade-in-up">
      {/* Header */}
      <header className="bg-card pb-6 pt-[calc(env(safe-area-inset-top)+24px)] border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-muted-foreground">{currentStore?.name || "Sistem Kasir"}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Analytics Dashboard
              </h1>
            </div>
          </div>

          {/* Time Range Tabs */}
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="today" className="text-xs sm:text-sm">Hari Ini</TabsTrigger>
              <TabsTrigger value="week" className="text-xs sm:text-sm">7 Hari</TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm">1 Bulan</TabsTrigger>
              <TabsTrigger value="3months" className="text-xs sm:text-sm">3 Bulan</TabsTrigger>
              <TabsTrigger value="year" className="text-xs sm:text-sm">1 Tahun</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border shadow-sm bg-card">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(analytics.revenue)}</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(analytics.profit)}</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </div>
                <BarChart3 className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Transaksi</p>
              <p className="text-xl font-bold text-foreground">{analytics.transactions}</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-card">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Rata-rata</p>
              <p className="text-xl font-bold text-foreground">{formatPrice(analytics.avgTransaction)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Performa Penjualan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.weeklyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))", 
                    borderRadius: "8px",
                    fontSize: "12px"
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue" 
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorProfit)" 
                  name="Profit" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Products */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Top 5 Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis 
                    type="number" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))" 
                    width={100}
                    fontSize={11}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: "8px",
                      fontSize: "12px"
                    }} 
                  />
                  <Bar 
                    dataKey="quantity" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.paymentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.name}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.paymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))", 
                      borderRadius: "8px",
                      fontSize: "12px"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};