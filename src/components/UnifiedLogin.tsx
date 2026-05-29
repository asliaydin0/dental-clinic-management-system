import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building,
  UserSquare,
  ChevronRight,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Fingerprint,
  Info
} from 'lucide-react';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'clinic_admin' | 'doctor' | 'secretary' | 'patient';
  clinicId: string;
  isTemporaryPassword: boolean;
  phoneNumber?: string;
}

interface UnifiedLoginProps {
  onLoginSuccess: (session: UserSession) => void;
  mockUsers: any[];
  onUpdateUserPassword: (email: string, newPassword: string) => void;
  onBack?: () => void;
  clinics?: any[];
}

export default function UnifiedLogin({ onLoginSuccess, mockUsers, onUpdateUserPassword, onBack, clinics }: UnifiedLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forced Password Change states
  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errMsg = "Giriş başarısız.";
        if (errorData && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errMsg = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
          } else {
            errMsg = errorData.detail;
          }
        }
        setError(errMsg);
        return;
      }

      const data = await response.json();
      if (data.success && data.user) {
        const user = data.user;

        // Check if the user's clinic is passive (only restricts non-admin/non-super roles)
        if (clinics && user.role !== 'super_admin' && user.role !== 'clinic_admin') {
          const userClinic = clinics.find(c => c.id === user.clinicId);
          if (userClinic && userClinic.status === 'passive') {
            setError('Kliniğiniz henüz aktif değildir. Lütfen klinik yöneticinizin ilk kurulumu/geçici şifre güncellemesini tamamlamasını bekleyiniz.');
            return;
          }
        }

        // Block access and force password change if password is temporary
        if (user.isTemporaryPassword) {
          setPendingUser(user);
          setNewPassword('');
          setConfirmPassword('');
          setPassError(null);
          return;
        }

        // Success Authentication
        const sessionResponse: UserSession = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clinicId: user.clinicId,
          isTemporaryPassword: false,
          phoneNumber: user.phoneNumber
        };
        onLoginSuccess(sessionResponse);
      } else {
        setError("Giriş bilgileri doğrulanamadı.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Bağlantı hatası: Sunucuya erişilemiyor.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPassword.length < 6) {
      setPassError('Şifre en az 6 karakter uzunluğunda olmalıdır.');
      return;
    }

    if (newPassword === password) {
      setPassError('Yeni şifre, geçici şifre ile aynı olamaz.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/users/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: pendingUser.email,
          new_password: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errMsg = "Şifre güncellenemedi.";
        if (errorData && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errMsg = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(", ");
          } else {
            errMsg = errorData.detail;
          }
        }
        setPassError(errMsg);
        return;
      }

      const data = await response.json();
      if (data.success) {
        onUpdateUserPassword(pendingUser.email, newPassword);

        const sessionResponse: UserSession = {
          id: pendingUser.id,
          email: pendingUser.email,
          name: pendingUser.name,
          role: pendingUser.role,
          clinicId: pendingUser.clinicId,
          isTemporaryPassword: false,
          phoneNumber: pendingUser.phoneNumber
        };

        setPendingUser(null);
        onLoginSuccess(sessionResponse);
      } else {
        setPassError("Şifre güncelleme başarısız oldu.");
      }
    } catch (err: any) {
      console.error(err);
      setPassError("Bağlantı hatası: Sunucuya erişilemiyor.");
    } finally {
      setLoading(false);
    }
  };

  // Preset accounts helper for testing
  const triggerPresetAccount = (presetEmail: string, presetPass: string) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setError(null);
  };


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative antialiased overflow-hidden">
      {/* Decorative Grid Network Background */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3B82F6_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* Glowing Blob Ambient Lights */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-550/25 rounded-full blur-[110px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-550/15 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <AnimatePresence mode="wait">
        {!pendingUser ? (
          /* STANDARD EMAIL & PASSWORD GATEWAY */
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full max-w-md bg-slate-950/90 border border-slate-800 rounded-3xl p-8 shadow-2xl relative text-white"
          >
            {/* Back button to landing */}
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="absolute top-6 left-6 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1 transition-all hover:-translate-x-0.5"
                title="Anasayfaya Dön"
              >
                <span>← Geri Dön</span>
              </button>
            )}

            {/* Logo area */}
            <div className="flex flex-col items-center text-center space-y-3 mb-8">
              <div className="bg-gradient-to-tr from-blue-500 to-teal-400 p-3 rounded-2xl text-white shadow-xl shadow-blue-500/10 border border-cyan-400/20">
                <Sparkles className="h-6 w-6 text-cyan-300 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                  Dents <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">SaaS AI</span>
                </h1>
                <p className="text-slate-400 text-xs mt-1">Akıllı Klinik ve Kimlik Doğrulama Ağ Geçidi</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Kullanıcı E-Posta Adresi</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900/80 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-medium"
                    placeholder="email@klinik.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Sistem Giriş Şifresi</label>
                  <span className="text-[10px] text-blue-400 hover:underline cursor-not-allowed">Geçici mi?</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-900/80 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-3 pl-11 pr-11 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                    placeholder="••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-rose-950/40 border border-rose-900/50 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-300 font-semibold leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-400 hover:to-indigo-550 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-blue-500/15 flex items-center justify-center gap-2 border border-blue-400/20 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>GİRİŞ YAPILIYOR...</span>
                  </>
                ) : (
                  <>
                    <span>SİSTEME GİRİŞ YAP</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="border-t border-slate-800/80 pt-5 mt-6 text-center">
              <p className="text-[11.5px] text-slate-400">
                SaaS Kimlik Doğrulama: Giriş yapıldığında rolünüze (`super_admin`, `clinic_admin`, `doctor`, `secretary` veya `patient`) göre otomatik yönlendirileceksiniz.
              </p>
            </div>
          </motion.div>
        ) : (
          /* MANDATORY PASSWORD CHANGE ON FIRST ACCESS */
          <motion.div
            key="force-password-change"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-slate-950/95 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl relative text-white"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-xl">
              <KeyRound className="h-3 w-3" />
              İlk Giriş: Şifre Yenileme Zorunluluğu
            </div>

            <div className="text-center space-y-2 mb-6 pt-2">
              <h2 className="text-lg font-bold text-white">Güvenli SaaS Aktivasyonu</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hesabınız geçici bir şifreyle oluşturulduğu için ilk kullanımda **kalıcı ve güvenli şifre belirlemeniz zorunludur**. Şifrenizi değiştirmeden sisteme erişemezsiniz.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-xs mb-5 flex items-start gap-2.5">
              <Building className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">{pendingUser.name}</p>
                <p className="text-slate-500 text-[10px] font-mono mt-0.5">{pendingUser.email} ({pendingUser.role.toUpperCase()})</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Yeni Güvenli Şifre</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none font-mono disabled:opacity-50"
                    placeholder="Yeni şifrenizi girin (min 6 karakter)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Yeni Şifre Tekrarı</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none font-mono disabled:opacity-50"
                    placeholder="Şifreyi tekrar onaylayın"
                  />
                </div>
              </div>

              {passError && (
                <p className="text-rose-400 text-xs font-semibold">{passError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-550 text-slate-950 font-black py-3 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-amber-500/10 flex items-center justify-center gap-1.5 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>GÜNCELLENİYOR...</span>
                  </>
                ) : (
                  <>
                    <span>ŞİFREMİ GÜNCELLE VE BAĞLAN</span>
                    <ShieldCheck className="h-4 w-4" />
                  </>
                )}
              </button>


              <button
                type="button"
                onClick={() => setPendingUser(null)}
                className="w-full bg-transparent hover:bg-slate-900 text-slate-400 hover:text-white py-2 rounded-xl text-xs font-bold transition-all"
              >
                İptal Et
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEVELOPER LIVE TESTING PRESET ACCESS DOCK */}
      <div className="w-full max-w-4xl mt-12 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 select-none relative z-10">
        <div className="flex items-center gap-2 mb-3.5 border-b border-slate-800 pb-2.5">
          <Fingerprint className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-black uppercase text-white tracking-widest">
            İlk Giriş Test Paneli (Geliştirici Konsolu)
          </h3>
          <span className="text-[8px] bg-sky-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">DEMO SPEEDWAY</span>
        </div>

        <p className="text-slate-400 text-xs leading-relaxed mb-4">
          Bu dock, sistem yöneticisi ve diğer roller arasındaki geçici şifre ile ilk giriş ve zorunlu şifre değiştirme akışını canlı test etmeniz için tasarlanmıştır.
          Hesapların üzerine tıklayarak form alanlarını otomatik doldurabilirsiniz.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              role: 'super_admin',
              label: 'Super Admin',
              user: 'Sistem Yöneticisi',
              email: 'admin@dentsai.com',
              pass: 'superadmin2026',
              badge: 'Kalıcı Şifre',
              badgeColor: 'bg-indigo-950 text-indigo-400 border-indigo-900/50'
            },
            {
              role: 'clinic_admin',
              label: 'Clinic Admin',
              user: 'Kadıköy Admin',
              email: 'group@dentgroup.com',
              pass: 'admin',
              badge: 'Geçici Şifre',
              badgeColor: 'bg-amber-950 text-amber-400 border-amber-900/50'
            },
            {
              role: 'doctor',
              label: 'Doctor',
              user: 'Dr. Ahmet',
              email: 'ahmet@dentsai.com',
              pass: 'doctor',
              badge: 'Geçici Şifre',
              badgeColor: 'bg-amber-950 text-amber-400 border-amber-900/50'
            },
            {
              role: 'secretary',
              label: 'Secretary',
              user: 'Canan Sekreter',
              email: 'canan@dentsai.com',
              pass: 'secretary',
              badge: 'Geçici Şifre',
              badgeColor: 'bg-amber-950 text-amber-400 border-amber-900/50'
            },
            {
              role: 'patient',
              label: 'Patient',
              user: 'Selin Aydın',
              email: 'selin@dentsai.com',
              pass: 'patient',
              badge: 'Kalıcı Şifre',
              badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-900/50'
            }
          ].map((preset, idx) => {
            // Find current password from state to display live on the card
            const currentObj = mockUsers.find(u => u.email === preset.email);
            const displayPass = currentObj ? currentObj.password : preset.pass;
            const isTemp = currentObj ? currentObj.isTemporaryPassword : true;

            return (
              <button
                key={idx}
                onClick={() => triggerPresetAccount(preset.email, displayPass)}
                className="bg-slate-900/40 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-3 rounded-xl transition-all text-left flex flex-col justify-between group cursor-pointer hover:shadow-lg focus:outline-none"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-black text-white group-hover:text-blue-400 transition-colors uppercase">
                      {preset.label}
                    </span>
                    <span className={`text-[8px] font-extrabold border py-0.5 px-1.5 rounded uppercase ${isTemp ? 'bg-amber-950 text-amber-400 border-amber-900/50' : 'bg-emerald-950 text-emerald-450 border-emerald-900/50'
                      }`}>
                      {isTemp ? 'GEÇİCİ' : 'KALICI'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] italic">{preset.user}</p>
                </div>

                 <div className="mt-2.5 font-mono text-[9px] text-slate-500 space-y-0.5 border-t border-slate-800/60 pt-2 font-bold select-text">
                  <div className="truncate text-slate-400" title={preset.email}>E: {preset.email}</div>
                  <div className="text-slate-350">Ş: {displayPass}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
