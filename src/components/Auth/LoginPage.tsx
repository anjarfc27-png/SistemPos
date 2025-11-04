import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { StoreSelector } from '@/components/Store/StoreSelector';
import { LoadingScreen } from '@/components/Auth/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { Store } from '@/types/store';
import { MessageCircle, Instagram, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import kasirqLogo from '@/assets/kasirq-logo.png';
import { secureStorage } from '@/lib/secure-storage';
import { biometricAuth } from '@/lib/biometric-auth';
import { Capacitor } from '@capacitor/core';
import { BiometryType } from '@aparajita/capacitor-biometric-auth';

export const LoginPage = () => {
  const { signIn, signInWithUsername, signUp, loading, user, checkBiometricAvailable, enableBiometric, isBiometricEnabled, isAdmin } = useAuth();
  const { currentStore, stores, loading: storeLoading, setCurrentStore } = useStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [adminContacts, setAdminContacts] = useState<{ whatsapp?: string; instagram?: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: ''
  });
  
  const [signUpData, setSignUpData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    whatsapp: ''
  });
  
  const [errors, setErrors] = useState<string>('');
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading states untuk proper loading screen
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Check biometric and load saved data
  useEffect(() => {
    const init = async () => {
      // Check biometric availability
      if (Capacitor.isNativePlatform()) {
        const available = await checkBiometricAvailable();
        setBiometricAvailable(available);
        
        if (available) {
          const enabled = await isBiometricEnabled();
          setBiometricEnabled(enabled);
        }
      }

      // Load saved identifier if remember me was enabled
      const savedRememberMe = await secureStorage.getRememberMe();
      setRememberMe(savedRememberMe);
      
      if (savedRememberMe) {
        const savedIdentifier = await secureStorage.getSavedIdentifier();
        if (savedIdentifier) {
          setLoginData(prev => ({ ...prev, identifier: savedIdentifier }));
        }
      }
    };

    init();
  }, []);

  // Fetch admin contact info
  useEffect(() => {
    const fetchAdminContacts = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('admin_whatsapp, admin_instagram')
          .eq('email', 'tokoanjar09@gmail.com')
          .maybeSingle();
        
        if (data) {
          setAdminContacts({
            whatsapp: (data as any).admin_whatsapp,
            instagram: (data as any).admin_instagram
          });
        }
      } catch (error) {
        console.error('Error fetching admin contacts:', error);
      }
    };

    fetchAdminContacts();
  }, []);

  const handleWhatsAppContact = () => {
    if (adminContacts.whatsapp) {
      const message = encodeURIComponent('Halo, saya ingin mengajukan pendaftaran atau mencoba trial 1 bulan.');
      window.open(`https://wa.me/${adminContacts.whatsapp}?text=${message}`, '_blank');
    }
  };

  const handleInstagramContact = () => {
    if (adminContacts.instagram) {
      window.open(`https://instagram.com/${adminContacts.instagram}`, '_blank');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');
    setIsRedirecting(true);
    setLoadingProgress(0);
    setLoadingMessage('Memeriksa akun');
    
    try {
      // Step 1: Authenticate
      const isEmail = loginData.identifier.includes('@');
      const { error } = isEmail 
        ? await signIn(loginData.identifier, loginData.password, rememberMe)
        : await signInWithUsername(loginData.identifier, loginData.password, rememberMe);
      
      if (error) {
        let errorMessage = 'Login gagal';
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Email/Username atau password salah';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Email belum dikonfirmasi. Silakan cek email Anda';
        } else if (error.message?.includes('menunggu persetujuan')) {
          navigate('/waiting-approval');
          return;
        } else if (error.message?.includes('Username tidak ditemukan')) {
          errorMessage = 'Username tidak ditemukan';
        }
        setErrors(errorMessage);
        setIsRedirecting(false);
        return;
      }
      
      setLoadingProgress(50);
      
      // Auto-enable biometric on first login if "Remember Me" is checked
      if (rememberMe && biometricAvailable && !biometricEnabled && Capacitor.isNativePlatform()) {
        try {
          await secureStorage.setBiometricEnabled(true);
          await secureStorage.saveCredentials(loginData.identifier, loginData.password);
          await secureStorage.setSavedIdentifier(loginData.identifier);
          await secureStorage.setRememberMe(true);
          setBiometricEnabled(true);
          sonnerToast.success('Biometrik diaktifkan untuk login cepat!');
        } catch (bioError) {
          console.error('Biometric setup error:', bioError);
        }
      } else if (rememberMe && biometricEnabled) {
        // Update saved credentials
        await secureStorage.saveCredentials(loginData.identifier, loginData.password);
        await secureStorage.setSavedIdentifier(loginData.identifier);
        await secureStorage.setRememberMe(true);
      } else if (rememberMe && !biometricAvailable) {
        // Just save identifier if biometric not available
        await secureStorage.setSavedIdentifier(loginData.identifier);
        await secureStorage.setRememberMe(true);
      }
      
      setLoadingProgress(100);
      
      // Force page reload to ensure session is loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors('Terjadi kesalahan saat login');
      setIsRedirecting(false);
    }
  };

  const handleBiometricLogin = async () => {
    setErrors('');
    setIsRedirecting(true);
    setLoadingProgress(0);
    setLoadingMessage('Verifikasi biometrik');
    
    try {
      const authenticated = await biometricAuth.authenticate('Login ke KasirQ');
      
      if (!authenticated) {
        setIsRedirecting(false);
        return;
      }
      
      setLoadingProgress(30);
      const credentials = await secureStorage.getCredentials();
      
      if (!credentials) {
        setErrors('Kredensial tidak ditemukan');
        setIsRedirecting(false);
        return;
      }
      
      setLoadingProgress(60);
      setLoadingMessage('Memeriksa akun');
      
      const isEmail = credentials.identifier.includes('@');
      const { error } = isEmail
        ? await signIn(credentials.identifier, credentials.password, true)
        : await signInWithUsername(credentials.identifier, credentials.password, true);
      
      if (error) {
        setErrors('Login gagal');
        setIsRedirecting(false);
        return;
      }
      
      setLoadingProgress(100);
      
      // Redirect langsung ke dashboard untuk semua role
      navigate('/dashboard');
    } catch (error) {
      console.error('Biometric login error:', error);
      setErrors('Login gagal');
      setIsRedirecting(false);
    }
  };


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors('');

    if (!signUpData.whatsapp) {
      setErrors('Nomor WhatsApp wajib diisi');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setErrors('Password tidak cocok');
      return;
    }

    if (signUpData.password.length < 6) {
      setErrors('Password minimal 6 karakter');
      return;
    }

    // Show loading state
    sonnerToast.loading('Mendaftar...', { id: 'signup-loading' });

    const { error } = await signUp(signUpData.email, signUpData.username, signUpData.password, signUpData.whatsapp);
    
    // Dismiss loading
    sonnerToast.dismiss('signup-loading');
    
    if (error) {
      // Handle specific error messages in Indonesian
      let errorMessage = 'Pendaftaran gagal';
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = 'Email atau username sudah terdaftar';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Format email tidak valid';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'Password terlalu lemah';
      }
      setErrors(errorMessage);
      sonnerToast.error(errorMessage);
    } else {
      sonnerToast.success(
        'Pendaftaran berhasil!',
        {
          description: 'Silakan cek email Anda untuk konfirmasi (maksimal 15 menit), lalu tunggu approval admin',
          duration: 7000
        }
      );
      setErrors('');
      // Clear form
      setSignUpData({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        whatsapp: ''
      });
      // Redirect to waiting approval page
      navigate('/waiting-approval');
    }
  };

  const handleStoreSelected = (store: Store) => {
    sonnerToast.success(`Toko "${store.name}" aktif!`);
    
    // Redirect ke dashboard setelah memilih toko
    navigate('/dashboard');
  };

  // Show store selector only after stores are loaded and there's no store
  if (user && !storeLoading && stores.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl">
          <StoreSelector onStoreSelected={handleStoreSelected} />
        </div>
      </div>
    );
  }

  // If user is logged in and stores are loaded (with or without selection), redirect to main page
  if (user && !storeLoading && (currentStore || stores.length > 0)) {
    navigate('/');
    return null;
  }

  // Loading state saat redirect - menggunakan LoadingScreen component
  if (isRedirecting) {
    return <LoadingScreen message={loadingMessage} progress={loadingProgress} />;
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        {/* iOS-style header */}
        <div className="bg-gradient-to-br from-primary to-primary-light p-8 text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-3xl shadow-xl">
              <img src={kasirqLogo} alt="KasirQ Logo" className="w-20 h-20" />
            </div>
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">KasirQ</h1>
            <p className="text-white/90 text-sm font-medium">Sistem Kasir Modern</p>
          </div>
        </div>

        <CardContent className="pt-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl mb-6">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">Daftar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Label htmlFor="identifier" className="text-sm font-semibold">Email atau Username</Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Masukkan email atau username"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-all mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-12 rounded-xl border-2 focus:border-primary transition-all pr-10"
                    />
                    
                    {/* Show/Hide Password Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm font-medium cursor-pointer"
                  >
                    Ingat Saya
                  </Label>
                </div>
                
                {errors && (
                  <div className="bg-error/10 text-error text-sm p-3 rounded-xl border border-error/20">
                    {errors}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all" 
                    disabled={loading}
                  >
                    {loading ? 'Masuk...' : 'Masuk'}
                  </Button>
                  
                  {biometricEnabled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleBiometricLogin}
                      className="h-12 w-12 rounded-xl border-2 hover:bg-primary/10"
                      title="Login dengan biometrik"
                      disabled={loading}
                    >
                      <Fingerprint className="h-5 w-5 text-primary" />
                    </Button>
                  )}
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="signup-email" className="text-sm font-semibold">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-all mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-sm font-semibold">Username (Nama Toko)</Label>
                  <Input
                    id="username"
                    type="text"
                    value={signUpData.username}
                    onChange={(e) => setSignUpData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    className="h-12 rounded-xl border-2 focus:border-primary transition-all mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="signup-whatsapp" className="text-sm font-semibold">
                    WhatsApp <span className="text-error">*</span>
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex items-center px-3 border-2 rounded-xl bg-muted h-12">
                      <span className="text-sm font-medium">+62</span>
                    </div>
                    <Input
                      id="signup-whatsapp"
                      type="tel"
                      placeholder="8123456789"
                      value={signUpData.whatsapp.replace('62', '')}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        const formatted = cleaned.startsWith('0') ? '62' + cleaned.substring(1) : '62' + cleaned;
                        setSignUpData(prev => ({ ...prev, whatsapp: formatted }));
                      }}
                      required
                      className="h-12 rounded-xl border-2 focus:border-primary transition-all flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Masukkan nomor tanpa +62 atau 0</p>
                </div>
                <div>
                  <Label htmlFor="signup-password" className="text-sm font-semibold">Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                      className="h-12 rounded-xl border-2 focus:border-primary transition-all pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-sm font-semibold">Konfirmasi Password</Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      minLength={6}
                      className="h-12 rounded-xl border-2 focus:border-primary transition-all pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {errors && (
                  <div className="bg-error/10 text-error text-sm p-3 rounded-xl border border-error/20">
                    {errors}
                  </div>
                )}
                
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                  {loading ? 'Mendaftar...' : 'Daftar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
