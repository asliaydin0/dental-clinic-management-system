import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ShieldAlert,
  Sliders,
  Check,
  Plus,
  Lock,
  Search,
  Zap,
  HardDrive,
  Users,
  Building2,
  Edit3,
  Trash2,
  BadgeAlert,
  ToggleLeft,
  ToggleRight,
  Palette,
  Terminal,
  Cpu,
  X,
  Download,
  UploadCloud,
  Sun,
  Moon,
  Menu,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AdminPortalProps {
  onExit: () => void;
  clinics: Clinic[];
  onUpdateClinic: (updatedClinic: Clinic) => void;
  onCreateClinic: (newClinic: Clinic) => void;
  onDeleteClinic: (clinicId: string) => void;
  mockUsers: any[];
  onCreateUser: (userName: string, userEmail: string, role: 'clinic_admin' | 'doctor' | 'secretary' | 'patient', phone?: string, clinicId?: string, customPassword?: string) => void;
  onDeleteUser: (userId: string) => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
}

export interface Clinic {
  id: string;
  name: string;
  logoUrl: string; // preselected or custom mock symbol
  themeColor: string; // Hex code for custom branding
  status: 'active' | 'passive';
  packageName: 'Standard' | 'Professional' | 'Enterprise';
  doctorLimit: number;
  storageLimit: number; // in GB
  aiScanLimit: number; // in scans per month
  doctorCount: number;
  storageUsed: number; // in GB
  aiScanCount: number; // in scans per month
  createdDate: string;
  phone: string;
  adminEmail?: string;
  temporaryPassword?: string;
}

// Interactive demo data for development charting
const CHART_USAGE_DATA = [
  { name: 'Pzt', AI_Scans: 280, Storage_GB: 120, Servers_Req: 1400 },
  { name: 'Sal', AI_Scans: 390, Storage_GB: 185, Servers_Req: 1950 },
  { name: 'Çar', AI_Scans: 480, Storage_GB: 220, Servers_Req: 2300 },
  { name: 'Per', AI_Scans: 350, Storage_GB: 250, Servers_Req: 1800 },
  { name: 'Cum', AI_Scans: 590, Storage_GB: 340, Servers_Req: 3100 },
  { name: 'Cmt', AI_Scans: 710, Storage_GB: 410, Servers_Req: 3800 },
  { name: 'Paz', AI_Scans: 850, Storage_GB: 480, Servers_Req: 4500 }
];

import { useToast } from './ui/ToastContext';

export default function AdminPortal({
  onExit,
  clinics,
  onUpdateClinic,
  onCreateClinic,
  onDeleteClinic,
  theme = 'light',
  setTheme
}: AdminPortalProps) {
  const isDark = theme === 'dark';
  const toast = useToast();

  // Adaptive variables for complete layout flexibility and modern aesthetics
  const bgMain = isDark ? 'bg-slate-900 text-slate-100' : 'bg-[#f8fafc] text-slate-800';
  const bgCard = isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)] rounded-2xl transition-all duration-300 text-slate-700';
  const bgSidebar = isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100/90 shadow-[4px_0_24px_rgba(15,23,42,0.02)]';
  const textTitle = isDark ? 'text-white' : 'text-slate-900 font-extrabold';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500 font-semibold';
  const borderLine = isDark ? 'border-slate-800' : 'border-slate-100';
  const bgInput = isDark ? 'bg-slate-900 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-205 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all duration-300';

  // Authentication check
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [developerId, setDeveloperId] = useState<string>('dev-admin');
  const [securityKey, setSecurityKey] = useState<string>('antigravity-2026');
  const [loginError, setLoginError] = useState<string>('');

  // Tab control inside the portal
  const [activeTab, setActiveTab] = useState<'system' | 'clinics' | 'limits' | 'terminal'>('system');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected clinic for Editing & limit adjustments
  const [selectedClinicId, setSelectedClinicId] = useState<string>('CLN-101');
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Clinic Editing form state
  const [formName, setFormName] = useState<string>('');
  const [formLogo, setFormLogo] = useState<string>('🦷');
  const [formTheme, setFormTheme] = useState<string>('#3B82F6');
  const [formPackage, setFormPackage] = useState<'Standard' | 'Professional' | 'Enterprise'>('Standard');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formAdminEmail, setFormAdminEmail] = useState<string>('');
  const [formTemporaryPassword, setFormTemporaryPassword] = useState<string>('');
  const [logoInputType, setLogoInputType] = useState<'emoji' | 'upload'>('emoji');
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);

  // Limits form states
  const [limitDoctors, setLimitDoctors] = useState<number>(10);
  const [limitStorage, setLimitStorage] = useState<number>(100);
  const [limitAi, setLimitAi] = useState<number>(2000);

  // System Simulator status highlights
  const [systemUptime] = useState<string>('99.98%');
  const [cpuUsage, setCpuUsage] = useState<number>(24);
  const [memUsage] = useState<number>(41);
  const [latency, setLatency] = useState<number>(31); // inside ms

  // Terminal state logs simulation
  const [terminalInput, setTerminalInput] = useState<string>('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYS-INIT] Antigravity developer backend services synchronized successfully.',
    '[AUTH-DB] Dev session started at ' + new Date().toISOString(),
    '[INFO] Port 3000 mapping: active nginx upstream container status 200 OK.',
    '[CRON] Running hourly database replication with storage engine bucket...',
    '[SUCCESS] 4 production clinic environments reported healthy signals.'
  ]);

  // Handle live system simulation counters
  useEffect(() => {
    const idx = setInterval(() => {
      setCpuUsage(Math.min(100, Math.max(8, Math.floor(25 + (Math.random() - 0.5) * 15))));
    }, 4000);
    return () => clearInterval(idx);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (developerId === 'dev-admin' && securityKey.length > 5) {
      setIsAuthenticated(true);
      addTerminalLog(`[AUTH] Welcome developer ${developerId}. Elevated administration keys granted.`);
    } else {
      setLoginError('Hata: Yetersiz veya yanlış Geliştirici kimlik bilgileri.');
    }
  };

  const addTerminalLog = (logText: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logText}`]);
  };

  const selectedClinic = clinics.find(c => c.id === selectedClinicId) || clinics[0];

  // Load clinic data into edit form fields
  useEffect(() => {
    if (selectedClinic) {
      setFormName(selectedClinic.name);
      setFormLogo(selectedClinic.logoUrl);
      setFormTheme(selectedClinic.themeColor);
      setFormPackage(selectedClinic.packageName);
      setFormPhone(selectedClinic.phone || '');

      setLimitDoctors(selectedClinic.doctorLimit);
      setLimitStorage(selectedClinic.storageLimit);
      setLimitAi(selectedClinic.aiScanLimit);
    }
  }, [selectedClinicId, selectedClinic]);

  // Quick preset package selection overrides limits
  const applyPackageLimits = (pkgType: 'Standard' | 'Professional' | 'Enterprise') => {
    setFormPackage(pkgType);
    if (pkgType === 'Standard') {
      setLimitDoctors(5);
      setLimitStorage(50);
      setLimitAi(1000);
    } else if (pkgType === 'Professional') {
      setLimitDoctors(15);
      setLimitStorage(200);
      setLimitAi(5000);
    } else if (pkgType === 'Enterprise') {
      setLimitDoctors(50);
      setLimitStorage(1000);
      setLimitAi(20000);
    }
    addTerminalLog(`[PAKET] Selected template suite for ${pkgType} Package.`);
  };

  // Save the modified parameters
  const saveClinicDetails = async () => {
    if (!formName.trim()) {
      toast.error("Lütfen geçerli bir Klinik İsmi giriniz.");
      return;
    }

    if (selectedClinic) {
      setActionLoading(true);
      try {
        await onUpdateClinic({
          ...selectedClinic,
          name: formName,
          logoUrl: uploadedLogo || formLogo,
          themeColor: formTheme,
          packageName: formPackage,
          phone: formPhone,
          doctorLimit: limitDoctors,
          storageLimit: limitStorage,
          aiScanLimit: limitAi
        });
        addTerminalLog(`[KLİNİK-DÜZENLE] Clinic "${formName}" (${selectedClinicId}) characteristics changed.`);
        setIsEditModalOpen(false);
        setUploadedLogo(null);
      } catch (err) {
        console.error(err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Toggle active / passive
  const toggleClinicStatus = async (id: string, name: string) => {
    const target = clinics.find(c => c.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'passive' : 'active';
    try {
      await onUpdateClinic({
        ...target,
        status: nextStatus
      });
      addTerminalLog(`[KLİNİK-STATUS] ${name} is marked as [${nextStatus.toUpperCase()}].`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateClinicPackage = async (clinic: any, newPackage: string) => {
    // Determine package limits
    let doctorLimit = clinic.doctorLimit;
    let storageLimit = clinic.storageLimit;
    let aiScanLimit = clinic.aiScanLimit;

    if (newPackage === 'Standard') {
      doctorLimit = 5;
      storageLimit = 50;
      aiScanLimit = 1000;
    } else if (newPackage === 'Professional') {
      doctorLimit = 15;
      storageLimit = 250;
      aiScanLimit = 5000;
    } else if (newPackage === 'Enterprise') {
      doctorLimit = 50;
      storageLimit = 1000;
      aiScanLimit = 20000;
    }

    const updatedClinic = {
      ...clinic,
      packageName: newPackage,
      doctorLimit,
      storageLimit,
      aiScanLimit
    };

    try {
      const response = await fetch(`http://localhost:8000/clinics/${clinic.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: updatedClinic.id,
          name: updatedClinic.name,
          logo_url: updatedClinic.logoUrl,
          theme_color: updatedClinic.themeColor,
          status: updatedClinic.status,
          package_name: updatedClinic.packageName,
          doctor_limit: updatedClinic.doctorLimit,
          storage_limit: updatedClinic.storageLimit,
          ai_scan_limit: updatedClinic.aiScanLimit,
          doctor_count: updatedClinic.doctorCount || 0,
          storage_used: updatedClinic.storageUsed || 0.0,
          ai_scan_count: updatedClinic.aiScanCount || 0,
          phone: updatedClinic.phone || "",
          admin_email: updatedClinic.adminEmail || "",
          temporary_password: updatedClinic.temporaryPassword || ""
        })
      });

      if (response.ok) {
        await onUpdateClinic(updatedClinic);
        addTerminalLog(`[PLAN-GÜNCELLE] Updated clinic ${clinic.name} package to ${newPackage}.`);
        toast.success(`Başarılı: ${clinic.name} kliniğinin paketi ${newPackage} olarak güncellendi!`);
      } else {
        const errData = await response.json();
        toast.error(`Hata: ${JSON.stringify(errData.detail || errData)}`);
      }
    } catch (err) {
      console.error('Paket güncelleme hatası:', err);
      toast.error('Klinik paketi güncellenirken hata oluştu.');
    }
  };

  const openCreateClinicModal = (pkg: 'Standard' | 'Professional' | 'Enterprise' = 'Standard') => {
    setFormName('');
    setFormPhone('');
    setFormTheme(pkg === 'Standard' ? '#10B981' : '#3B82F6');
    setFormLogo('🦷');
    setUploadedLogo(null);
    setFormPackage(pkg);
    setLimitDoctors(pkg === 'Standard' ? 3 : pkg === 'Professional' ? 12 : 25);
    setLimitStorage(pkg === 'Standard' ? 50 : pkg === 'Professional' ? 200 : 500);
    setLimitAi(pkg === 'Standard' ? 1500 : pkg === 'Professional' ? 5000 : 10000);
    setFormAdminEmail('');
    setFormTemporaryPassword(`DHT${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setIsCreateModalOpen(true);
  };

  // Creating a new clinic from scratch
  const createNewClinic = async () => {
    if (!formName.trim()) {
      toast.error("Lütfen Klinik Adı giriniz.");
      return;
    }

    if (!formAdminEmail.trim() || !formAdminEmail.includes('@')) {
      toast.error("Lütfen geçerli bir yönetici e-posta adresi giriniz.");
      return;
    }

    if (!formTemporaryPassword.trim()) {
      toast.error("Lütfen geçerli bir geçici şifre giriniz.");
      return;
    }

    const newId = `CLN-${Math.floor(105 + Math.random() * 899)}`;
    const freshClinic: Clinic = {
      id: newId,
      name: formName,
      logoUrl: uploadedLogo || formLogo,
      themeColor: formTheme,
      status: 'passive', // Initialized as passive until admin sets password
      packageName: formPackage,
      doctorLimit: limitDoctors,
      storageLimit: limitStorage,
      aiScanLimit: limitAi,
      doctorCount: 0,
      storageUsed: 0.0,
      aiScanCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      phone: formPhone || '0212 100 00 00',
      adminEmail: formAdminEmail.toLowerCase().trim(),
      temporaryPassword: formTemporaryPassword.trim()
    };

    setActionLoading(true);
    try {
      await onCreateClinic(freshClinic);
      setSelectedClinicId(newId);
      setIsCreateModalOpen(false);
      setUploadedLogo(null);
      addTerminalLog(`[KLİNİK-ÜRET] Successfully created passive clinic: "${formName}". Assigning node ID: ${newId}. Admin account initialized with: ${formAdminEmail.toLowerCase().trim()}`);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Terminal input processor simulator
  const runTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.toLowerCase().trim();
    addTerminalLog(`> ${terminalInput}`);
    setTerminalInput('');

    setTimeout(() => {
      if (cmd === '/sysinfo' || cmd === 'sysinfo') {
        addTerminalLog(`[SYSINFO] Core CPU: ${cpuUsage}%, MEM: ${memUsage}%, ping: ${latency}ms, active sockets: ${clinics.length}.`);
      } else if (cmd.startsWith('/activate ') || cmd.startsWith('activate ')) {
        const targetId = cmd.replace('activate ', '').toUpperCase().trim();
        const found = clinics.find(c => c.id === targetId);
        if (found) {
          onUpdateClinic({
            ...found,
            status: 'active'
          });
          addTerminalLog(`[SYS] Clinic ID: ${targetId} successfully started on production cluster.`);
        } else {
          addTerminalLog(`[ERR] Clinic ID "${targetId}" not found in current network.`);
        }
      } else if (cmd === '/backup' || cmd === 'backup') {
        addTerminalLog(`[SYS] Initializing remote hot snapshot...`);
        addTerminalLog(`[SUCCESS] Snapshot saved in master-bucket-2026.tar.gz (Size: 842.1 MB)`);
      } else if (cmd === '/clear' || cmd === 'clear') {
        setTerminalLogs(['[SYS] Shell buffer reset successfully.']);
      } else {
        addTerminalLog(`[SH-ERR] Command unrecognized: "${cmd}". Available queries: sysinfo, activate [ID], backup, clear.`);
      }
    }, 200);
  };

  // Handlers for local fake logo loaders
  const mockLogoSelect = (emoji: string) => {
    setFormLogo(emoji);
    setUploadedLogo(null);
  };

  const simulateLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedLogo(URL.createObjectURL(file));
      addTerminalLog(`[UPLOAD] Custom asset uploaded: "${file.name}" (MIME: ${file.type})`);
    }
  };

  const filteredClinics = clinics.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // AUTH VIEW
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900 flex items-center justify-center p-4 select-none">
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#2F80ED_1.5px,transparent_1.5px)] [background-size:16px_16px] -z-10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-550/20 rounded-full blur-[80px] -z-10"></div>
        <div className="absolute bottom-1/4 right-3/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-[100px] -z-10"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-slate-950/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative text-white"
        >
          {/* Back Button & Theme Toggle */}
          <div className="absolute top-6 right-6 flex items-center space-x-3">
            <button
              onClick={() => setTheme?.(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 dark:text-slate-200 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-slate-300" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>
            <button
              onClick={onExit}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2.5 rounded-full transition-all cursor-pointer"
              title="Sistemden Çık"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center space-y-3.5 mb-8">
            <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-cyan-500/10 border border-cyan-400/20">
              <ShieldAlert className="h-6 w-6 animate-pulse text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                Sistem Yöneticisi & Geliştirici <span className="text-[10px] bg-sky-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">ROOT</span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">Dents AI Genel Altyapı ve Lisanslama Merkezi</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Geliştirici Sorumlu Kodu (ID)</label>
              <input
                type="text"
                value={developerId}
                required
                onChange={e => setDeveloperId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-sky-500 font-mono font-bold placeholder-slate-600"
                placeholder="dev-admin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Şifreli Erişim Anahtarı (Security Key)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={securityKey}
                  required
                  onChange={e => setSecurityKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-sky-500 font-bold placeholder-slate-650"
                  placeholder="••••••••••••••"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-rose-400 text-xs font-semibold">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-indigo-650 hover:from-cyan-500 hover:to-indigo-550 text-white font-bold py-3.5 rounded-xl text-xs tracking-wider transition-all shadow-lg hover:shadow-cyan-500/15 flex items-center justify-center gap-2 cursor-pointer border border-cyan-400/20"
            >
              <Cpu className="h-4 w-4 text-cyan-300 animate-spin" />
              YÖNETİM KONSOLUNU BAŞLAT
            </button>
          </form>

          <div className="border-t border-slate-800 pt-5 mt-6 text-center space-y-2">
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Yasal Uyarı: Bu panel sadece lisanslı geliştiriciler ve sistem yöneticileri içindir. <br />
              Yetkisiz erişim girişimleri gerçek zamanlı olarak IP bazlı rapor edilmektedir.
            </p>
            <button
              onClick={onExit}
              className="text-[11px] font-semibold text-cyan-400 hover:underline cursor-pointer"
            >
              ← DişAsistanım Kullanıcı Ekranına Dön
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // PLATFORM CONSOLE MAIN WRAPPER
  return (
    <div className={`h-screen overflow-hidden ${bgMain} flex flex-col font-sans relative antialiased selection:bg-sky-500/30 selection:text-white transition-all duration-200`}>


      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* MOBİL BACKDROP OVERLAY */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/45 z-40 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* SIDE BAR DESIGN */}
        <aside className={`fixed inset-y-0 left-0 lg:relative z-50 lg:z-auto w-64 ${bgSidebar} flex flex-col justify-between transition-transform lg:translate-x-0 duration-305 border-r h-full select-none ${sidebarOpen ? 'translate-x-0 animate-fadeIn' : '-translate-x-full lg:flex'}`}>
          <div className="p-5 space-y-6">

            <div className={`flex items-center justify-between border-b ${borderLine} pb-4`}>
              <div className="flex items-center space-x-2.5">
                <div className="bg-gradient-to-tr from-sky-500 to-indigo-650 p-2 rounded-xl text-white shadow-lg shadow-sky-500/10 border border-sky-400/20">
                  <Sliders className="h-4.5 w-4.5 font-bold text-cyan-300 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black tracking-tight ${textTitle}`}>Dents AI</span>

                </div>
              </div>

              {/* Mobil Menü Kapatma Butonu */}
              <button
                onClick={() => setSidebarOpen(false)}
                className={`lg:hidden p-1.5 rounded-lg border ${isDark ? 'bg-slate-900 border-slate-800 text-slate-350' : 'bg-slate-50 border-slate-205 text-slate-700'} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu exactly for system administrator */}
            <div className="space-y-1">
              {[
                { id: 'system', label: 'Sistem Genel Bakış', icon: Cpu },
                { id: 'clinics', label: 'Klinik Yönetimi', icon: Building2, badge: clinics.length.toString() },
                { id: 'limits', label: 'Paket Yönetimi', icon: Sliders },
                { id: 'terminal', label: 'Developer Terminal', icon: Terminal }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all group cursor-pointer ${isSelected
                      ? 'bg-sky-500/15 text-sky-500 border-l-[3.5px] border-sky-500 font-extrabold shadow-sm'
                      : isDark
                        ? 'text-slate-450 hover:text-white hover:bg-slate-900'
                        : 'text-slate-650 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-sky-500 font-extrabold' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[8px] font-mono border px-1.5 py-0.5 rounded font-extrabold ${isDark ? 'bg-slate-800 border-slate-750 text-sky-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Simulated Server Info Group */}
            <div className={`pt-4 border-t ${borderLine} space-y-2.5`}>
              <span className={`text-[9.5px] font-black tracking-widest block px-3 uppercase ${textMuted}`}>Cluster Nodes</span>

              <div className={`p-3 rounded-xl border space-y-2 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-150'}`}>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={textMuted}>Çalışma Süresi:</span>
                  <span className="font-mono text-emerald-500 font-extrabold">{systemUptime}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={textMuted}>Veritabanı:</span>
                  <span className="font-mono text-sky-500 font-black">MySQL</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={textMuted}>API Gecikmesi:</span>
                  <span className="font-mono text-cyan-500 font-semibold">{latency}ms</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={textMuted}>Nginx Container:</span>
                  <span className={`font-mono font-bold ${textTitle}`}>v1.25.3</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar exit actions */}
          <div className={`p-5 border-t ${borderLine} space-y-2.5 ${isDark ? 'bg-slate-950/40' : 'bg-slate-50/50'}`}>
            <button
              onClick={() => {
                const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(clinics, null, 2));
                const dlAnchor = document.createElement('a');
                dlAnchor.setAttribute("href", jsonStr);
                dlAnchor.setAttribute("download", "platform_system_data.json");
                dlAnchor.click();
              }}
              className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border cursor-pointer ${isDark
                ? 'bg-slate-900 border-slate-700 text-slate-350 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                }`}
            >
              <Download className="h-3.5 w-3.5 text-sky-500" />
              Sistem Şemasını İndir
            </button>

            <button
              onClick={onExit}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${isDark
                ? 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-rose-455 hover:text-rose-400'
                : 'bg-white hover:bg-rose-50 border-slate-205 text-rose-600 shadow-sm'
                }`}
            >
              <X className="h-3.5 w-3.5" />
              Sistemden Güvenli Çık
            </button>
          </div>
        </aside>

        {/* CLUSTER CENTER LAYOUT */}
        <section className={`flex-1 flex flex-col min-w-0 ${bgMain} overflow-y-auto`}>

          {/* HEADER SEGMENT */}
          <header className={`h-[76px] ${bgSidebar} border-b ${borderLine} px-6 flex items-center justify-between select-none shadow-sm`}>
            <div className="flex items-center gap-3">
              {/* Mobil Hamburger Butonu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer ${isDark
                  ? 'bg-slate-900 border-slate-805 text-slate-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200/80 text-slate-705 shadow-sm'
                  }`}
                title="Menüyü Aç/Kapa"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <h1 className={`text-sm font-black tracking-widest uppercase flex items-center gap-2 ${textTitle}`}>
                  YÖNETİM PANELİ
                </h1>
                <p className={`text-[10px] ${textMuted} font-semibold mt-0.5`}>Sistem ve kliniklerin global konfigürasyonlarını düzenleyin.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <button
                onClick={() => openCreateClinicModal('Standard')}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-sky-500/10 hover:shadow-sky-500/25"
              >
                <Plus className="h-4 w-4" />
                <span>Klinik Oluştur</span>
              </button>

              {/* Theme Toggle Button as Requested */}
              <button
                onClick={() => setTheme?.(theme === 'light' ? 'dark' : 'light')}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${isDark
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 shadow-sm'
                  }`}
                title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 text-slate-500" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-400" />
                )}
              </button>

              <button
                onClick={onExit}
                className={`font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-2 cursor-pointer border ${isDark
                  ? 'bg-slate-900 hover:bg-slate-850 border-slate-700 text-slate-300'
                  : 'bg-white hover:bg-slate-50 border-slate-205 text-slate-705 shadow-sm'
                  }`}
              >
                Çıkış Yap →
              </button>
            </div>
          </header>

          {/* DYNAMIC CONTENT CONTAINER */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

            {/* TAB 1: SYSTEM MONITORING */}
            {activeTab === 'system' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Kayıtlı Klinikler</span>
                      <p className="text-3xl font-black text-white font-mono">{clinics.length}</p>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                        <Check className="h-3 w-3" />
                        {clinics.filter(c => c.status === 'active').length} Aktif Sitede
                      </span>
                    </div>
                    <div className="bg-indigo-950 text-indigo-400 p-3 rounded-xl border border-indigo-900/40">
                      <Building2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Kayıtlı Hekim Kotası</span>
                      <p className="text-3xl font-black text-white font-mono">
                        {clinics.reduce((acc, current) => acc + current.doctorCount, 0)}
                        <span className="text-xs text-slate-500 font-bold font-sans"> / {clinics.reduce((acc, cur) => acc + cur.doctorLimit, 0)}</span>
                      </p>
                      <span className="text-[10px] text-sky-400">
                        {clinics.reduce((acc, cur) => acc + cur.doctorLimit, 0) - clinics.reduce((acc, current) => acc + current.doctorCount, 0)} Kalan Kontenjan
                      </span>
                    </div>
                    <div className="bg-cyan-950 text-cyan-400 p-3 rounded-xl border border-cyan-900/40">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Toplam Disk Kullanımı</span>
                      <p className="text-3xl font-black text-white font-mono">
                        {clinics.reduce((acc, current) => acc + current.storageUsed, 0).toFixed(1)}
                        <span className="text-xs text-slate-500 font-medium font-sans"> GB</span>
                      </p>
                      <span className="text-[10px] text-emerald-400 uppercase font-bold">
                        {((clinics.reduce((acc, current) => acc + current.storageUsed, 0) / clinics.reduce((acc, current) => acc + current.storageLimit, 0)) * 100).toFixed(1)}% Kullanımda
                      </span>
                    </div>
                    <div className="bg-emerald-950 text-emerald-400 p-3 rounded-xl border border-emerald-900/40">
                      <HardDrive className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Aylık AI Tarama Yükü</span>
                      <p className="text-3xl font-black text-white font-mono">
                        {clinics.reduce((acc, current) => acc + current.aiScanCount, 0)}
                        <span className="text-xs text-slate-500 font-medium font-sans"> / {clinics.reduce((acc, current) => acc + current.aiScanLimit, 0)}</span>
                      </p>
                      <span className="text-[10px] text-cyan-400 font-semibold uppercase">
                        {((clinics.reduce((acc, current) => acc + current.aiScanCount, 0) / clinics.reduce((acc, current) => acc + current.aiScanLimit, 0)) * 105 - 5).toFixed(0)}% Sınır Oranı
                      </span>
                    </div>
                    <div className="bg-sky-950 text-sky-400 p-3 rounded-xl border border-sky-900/40">
                      <Zap className="h-5 w-5 text-cyan-300" />
                    </div>
                  </div>

                </div>

                {/* Charts Area with recharts */}
                <div className="grid lg:grid-cols-12 gap-6">

                  {/* Analytic scan frequency and storage trend charts */}
                  <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between mb-5 select-none">
                      <div>
                        <h3 className="text-xs font-black tracking-wider text-white uppercase">Platform Global Trafik Eğilimleri (Son 7 Gün)</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Günlük yapay zeka kullanımı ve depolama istatistikleri</p>
                      </div>
                    </div>

                    <div className="h-64 sm:h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_USAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2F80ED" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#2F80ED" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                          <YAxis stroke="#64748B" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', color: '#FFF' }} />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                          <Area type="monotone" dataKey="AI_Scans" name="Aylık Yapay Zeka Taraması (Adet)" stroke="#2F80ED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAI)" />
                          <Area type="monotone" dataKey="Storage_GB" name="Disk Depolama Kapasitesi (GB)" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorDisk)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* System Load Dial panel */}
                  <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black tracking-wider text-white uppercase font-sans">Sistem Sunucu Kaynak Dağılımı</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">CPU, RAM ve Port upstream durumu</p>
                    </div>

                    <div className="space-y-5 py-4">

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>İşlemci Kullanımı</span>
                          <span className="text-cyan-400 font-mono">{cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${cpuUsage}%` }}
                            className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>Bellek Kullanımı</span>
                          <span className="text-indigo-400 font-mono">{memUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${memUsage}%` }}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>Sunucu Gecikmesi</span>
                          <span className="text-emerald-400 font-mono">{latency} ms</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800 animate-pulse">
                          <div
                            style={{ width: `${(latency / 120) * 100}%` }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-[11px] text-slate-400">
                      <p className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                        <span>Tüm sistem servisleri sorunsuz çalışıyor.</span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Simulated live platform messages feed logs */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-black tracking-wider text-white uppercase block">Platform Sistem Etkinlik Logları</span>
                    <button
                      onClick={() => setTerminalLogs(['[SYS] Logger restarted.'])}
                      className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Temizle
                    </button>
                  </div>

                  <div className="bg-slate-900/40 p-3.5 rounded-xl font-mono text-xs text-slate-400 space-y-2 max-h-40 overflow-y-auto border border-slate-800/80">
                    {terminalLogs.map((log, lidx) => (
                      <div key={lidx} className="flex gap-2.5">
                        <span className="text-slate-600">[{lidx + 1}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: CLINIC MANAGEMENT (Klinik oluşturma, düzenleme, pasif etme, paket, logo, tema) */}
            {activeTab === 'clinics' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Search and Quick Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950 p-4 border border-slate-800 rounded-2xl shadow-sm">
                  <div className="relative w-full sm:max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                      placeholder="Klinik adı veya klinik ID ile arama yapın..."
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <span className="text-xs text-slate-400 font-bold">{filteredClinics.length} Klinik süzüldü</span>
                    <button
                      onClick={() => openCreateClinicModal('Standard')}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      Yeni Klinik Kaydı
                    </button>
                  </div>
                </div>

                {/* Clinics Listings Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredClinics.map((c) => {
                    const isPassive = c.status === 'passive';
                    return (
                      <div
                        key={c.id}
                        className={`bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg transition-all relative overflow-hidden flex flex-col justify-between ${isPassive ? 'border-dashed border-slate-850 brightness-75' : ''
                          }`}
                      >
                        {/* Custom Clinic Color Band accent */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1.5"
                          style={{ backgroundColor: c.themeColor }}
                        />

                        {/* Top info and logo block */}
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3.5">
                              <div
                                className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shadow-md cursor-help select-none"
                                style={{ backgroundColor: `${c.themeColor}15`, border: `1.5px solid ${c.themeColor}50` }}
                                title="Klinik Logosu"
                              >
                                {c.logoUrl.startsWith('blob:') || c.logoUrl.startsWith('http') ? (
                                  <img src={c.logoUrl} alt="Logo" className="h-10 w-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                                ) : (
                                  <span>{c.logoUrl}</span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-sm font-extrabold text-white tracking-wide truncate max-w-[170px] sm:max-w-[200px]" title={c.name}>
                                    {c.name}
                                  </h3>
                                  <span className={`text-[8px] font-extrabold border py-0.5 px-1.5 rounded uppercase ${c.packageName === 'Enterprise' ? 'bg-indigo-950 text-indigo-400 border-indigo-900/50' :
                                    c.packageName === 'Professional' ? 'bg-cyan-950 text-cyan-400 border-cyan-900/50' : 'bg-slate-900 text-slate-400 border-slate-800'
                                    }`}>
                                    {c.packageName}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1 font-mono font-bold flex items-center gap-1.5">
                                  <span>Node ID: <strong className="text-slate-400">{c.id}</strong></span>
                                  <span>•</span>
                                  <span>Tarih: <strong className="text-slate-400">{c.createdDate}</strong></span>
                                </p>
                              </div>
                            </div>

                            {/* Status and Active Switch */}
                            <button
                              onClick={() => toggleClinicStatus(c.id, c.name)}
                              className="text-slate-400 hover:text-white transition-all cursor-pointer border-none bg-transparent"
                              title={isPassive ? 'Aktif et' : 'Pasif et'}
                            >
                              {isPassive ? (
                                <div className="flex items-center gap-1 bg-rose-950/50 border border-rose-900/50 text-rose-400 font-extrabold text-[8px] px-2 py-1 rounded">
                                  <ToggleLeft className="h-5 w-5 text-rose-500" />
                                  <span>PASİF</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 font-extrabold text-[8px] px-2 py-1 rounded">
                                  <ToggleRight className="h-5 w-5 text-emerald-400" />
                                  <span>SİSTEMDE</span>
                                </div>
                              )}
                            </button>
                          </div>

                          {/* Quick visual gauges of limits vs usage */}
                          <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl space-y-3">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Kaynak Kotasyon Raporu</span>

                            {/* Doctor usage */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Lisans Sorumlu Hekim:</span>
                                <span className="text-white">{c.doctorCount} / <strong className="text-sky-400">{c.doctorLimit}</strong></span>
                              </div>
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-sky-450"
                                  style={{ width: `${Math.min(100, (c.doctorCount / c.doctorLimit) * 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Storage usage */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Veri Depolama (X-ray, Raporlar):</span>
                                <span className="text-white">{c.storageUsed.toFixed(1)} GB / <strong className="text-emerald-400">{c.storageLimit} GB</strong></span>
                              </div>
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-emerald-450"
                                  style={{ width: `${Math.min(100, (c.storageUsed / c.storageLimit) * 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* AI request limit */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Yapay Zeka Aylık Sınır:</span>
                                <span className="text-white">{c.aiScanCount} / <strong className="text-indigo-400">{c.aiScanLimit}</strong></span>
                              </div>
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-indigo-500"
                                  style={{ width: `${Math.min(100, (c.aiScanCount / c.aiScanLimit) * 105)}%` }}
                                />
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Admin Account details (especially for passive clinics needing first login) */}
                        {c.adminEmail && (
                          <div className="mt-3.5 p-2 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1 text-[10px]">
                            <div className="text-indigo-400 font-black uppercase tracking-wider text-[8px]">KLİNİK YÖNETİCİ HESAP BİLGİLERİ</div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-mono">E-Posta:</span>
                              <span className="text-white font-mono font-bold select-all">{c.adminEmail}</span>
                            </div>
                            {c.temporaryPassword && isPassive && (
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-mono">Geçici Şifre:</span>
                                <span className="text-amber-400 font-mono font-bold select-all">{c.temporaryPassword}</span>
                              </div>
                            )}
                            <div className="text-[8px] text-slate-400 mt-1 flex items-center gap-1">
                              {isPassive ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                                  <span>Yönetici ilk girişte geçici şifresini değiştirdiğinde aktifleşir.</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                  <span className="text-emerald-400 font-bold">Kurulum ve şifre güncelleme tamamlandı, aktiftir.</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Custom branding metadata preview */}
                        <div className="flex items-center justify-between mt-5 pt-3.5 border-t border-slate-905 border-dashed text-xs text-slate-400">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Palette className="h-4.5 w-4.5" style={{ color: c.themeColor }} />
                            <span>Tema Rengi:</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white" style={{ borderLeft: `3px solid ${c.themeColor}` }}>{c.themeColor}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedClinicId(c.id);
                                setIsEditModalOpen(true);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-850 p-2 rounded-lg flex items-center justify-center text-sky-400 cursor-pointer"
                              title="Klinik ve Limitleri Düzenle"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={async () => {
                                if (await toast.confirm(`DİKKAT! "${c.name}" kliniğini sistemden silmek istiyor musunuz? Bu işlem geri alınamaz.`)) {
                                  onDeleteClinic(c.id);
                                  addTerminalLog(`[KLİNİK-SİL] Deleted clinic registry node: ${c.name} (${c.id}).`);
                                }
                              }}
                              className="bg-slate-900 hover:bg-rose-950 hover:text-rose-400 border border-slate-855 p-2 rounded-lg flex items-center justify-center text-slate-500 cursor-pointer"
                              title="Kliniği Sistemden Kaldır"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 3: LIMIT DETAILS & TEMPLATES */}
            {activeTab === 'limits' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-md">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2">Sistem Paketleri ve Limitler</h3>
                  <p className="text-[10px] text-slate-500">Platformda sunulan lisans paketleri ve bu paketlere ait hekim, depolama ve yapay zeka kullanım kotaları.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { title: 'Standart Paket', price: '₺14,999 / Ay', clr: 'border-slate-800 bg-slate-950/40', docs: 5, space: 50, ai: 1000 },
                    { title: 'Profesyonel Paket', price: '₺34,999 / Ay', clr: 'border-sky-500/30 bg-sky-950/10', docs: 15, space: 250, ai: 5000 },
                    { title: 'Enterprise Premium', price: '₺79,999 / Ay', clr: 'border-indigo-500/30 bg-indigo-950/10', docs: 'Limitsiz (50+)', space: '1000 (1 TB)', ai: '20,000+' }
                  ].map((p, pidx) => (
                    <div key={pidx} className={`border p-6 rounded-2xl flex flex-col justify-between ${p.clr}`}>
                      <div className="space-y-4">

                        <div>
                          <h4 className="text-sm font-extrabold text-white">{p.title}</h4>
                          <span className="text-xs text-sky-400 font-mono font-bold mt-1 block">{p.price}</span>
                        </div>

                        <ul className="text-xs text-slate-400 space-y-2.5 pt-2 border-t border-slate-900 list-none p-0">
                          <li className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            <span>Maksimum Diş Hekimi: <strong>{p.docs} Hekim Hesabı</strong></span>
                          </li>
                          <li className="flex items-center gap-2">
                            <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                            <span>Maksimum Depolama Kapasitesi: <strong>{p.space} GB</strong></span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-slate-500" />
                            <span>AI Röntgen Segmentasyonu: <strong>{p.ai} / Ay</strong></span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Klinik Paket Yönetimi */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Klinik Paket Yönetimi</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sistemde kayıtlı kliniklerin lisans paketlerini değiştirin. Limitler seçilen pakete göre otomatik ayarlanacaktır.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-bold">
                          <th className="pb-2.5">Klinik Adı</th>
                          <th className="pb-2.5">Mevcut Paket</th>
                          <th className="pb-2.5">Limitler (Doktor/Depolama/AI)</th>
                          <th className="pb-2.5 text-right">Paket Değiştir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clinics.map((c) => (
                          <tr key={c.id} className="border-b border-slate-900/50 hover:bg-slate-900/20">
                            <td className="py-3 font-extrabold text-white flex items-center gap-2">
                              <span className="text-base">{c.logoUrl}</span>
                              <div>
                                <span>{c.name}</span>
                                <span className="block text-[9px] text-slate-500 font-mono">{c.id}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className="text-[9px] bg-slate-900 text-cyan-400 border border-cyan-800/40 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                                {c.packageName}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400 font-medium">
                              {c.doctorLimit} Hekim / {c.storageLimit} GB / {c.aiScanLimit} Tarama
                            </td>
                            <td className="py-3 text-right">
                              <select
                                value={c.packageName}
                                onChange={(e) => handleUpdateClinicPackage(c, e.target.value)}
                                className="bg-slate-900 border border-slate-800 text-white rounded px-2.5 py-1 text-xs focus:outline-none font-bold"
                              >
                                <option value="Standard">Standard</option>
                                <option value="Professional">Professional</option>
                                <option value="Enterprise">Enterprise</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: DEVELOPER COMMAND LINE CONTAINER */}
            {activeTab === 'terminal' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-cyan-400" />
                      Sistem Terminali
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Sistem loglarını izleyebileceğiniz ve yönetici komutlarını çalıştırabileceğiniz konsol.</p>
                  </div>

                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 font-mono text-xs text-slate-400 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto">
                    <div># Sistem Geliştirici Terminali v1.0</div>


                    <div className="space-y-1.5 pt-2">
                      {terminalLogs.map((log, index) => (
                        <div key={index} className="leading-relaxed">
                          <span className="text-slate-600 mr-2">&gt;&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={runTerminalCommand} className="flex gap-2">
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={e => setTerminalInput(e.target.value)}
                      className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl py-2.5 px-4 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                      placeholder="Komut girin (örn: sysinfo, backup, clear)..."
                    />
                    <button
                      type="submit"
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:text-white text-slate-400 font-mono text-xs px-5 py-2.5 rounded-xl cursor-pointer transition-all"
                    >
                      Enter
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

          </main>
        </section>

      </div>

      {/* CLINIC EDIT MODAL DIALOG */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/85 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white space-y-5"
            >

              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-sky-950 text-sky-450 p-2 rounded-xl border border-sky-800/40">
                    <Edit3 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Klinik Lisans & Konfigürasyon Düzenle</h3>
                    <p className="text-[10px] text-slate-500">ID: {selectedClinicId}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 p-2 rounded-full text-slate-400 hover:text-white cursor-pointer border-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Edit form */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Klinik Adı / Tanımı</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white uppercase focus:outline-none"
                    placeholder="DENT KLİNİK İSMİ..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Klinik Telefonu</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Kurumsal Lisans Paketi</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl">
                      {(['Standard', 'Professional', 'Enterprise'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => applyPackageLimits(p)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all border-none ${formPackage === p
                            ? 'bg-sky-600 text-white'
                            : 'text-slate-400 hover:text-white bg-transparent'
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logo & Theme selections */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">

                  {/* Symbol choice */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Klinik Logosu</label>
                      <div className="flex gap-1.5 text-[8px] font-bold">
                        <button
                          onClick={() => setLogoInputType('emoji')}
                          className={`px-1 py-0.5 rounded border-none cursor-pointer ${logoInputType === 'emoji' ? 'bg-sky-950 text-sky-400' : 'text-slate-500 bg-transparent'}`}
                        >
                          Emoji
                        </button>
                        <button
                          onClick={() => setLogoInputType('upload')}
                          className={`px-1 py-0.5 rounded border-none cursor-pointer ${logoInputType === 'upload' ? 'bg-sky-950 text-sky-400' : 'text-slate-500 bg-transparent'}`}
                        >
                          Yükle
                        </button>
                      </div>
                    </div>

                    {logoInputType === 'emoji' ? (
                      <div className="grid grid-cols-6 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        {['🦷', '✨', '⚡', '🏥', '🔬', '🛡️'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => mockLogoSelect(emoji)}
                            className={`p-1.5 hover:bg-slate-800 rounded text-base transition-colors border-none cursor-pointer ${formLogo === emoji && !uploadedLogo ? 'bg-sky-600' : 'bg-transparent'}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
                        <label className="w-full flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-sky-500 p-3 rounded-lg cursor-pointer transition-colors">
                          <UploadCloud className="h-6 w-6 text-slate-400" />
                          <span className="text-[9px] text-slate-400 font-bold mt-1">Logo Seç</span>
                          <input type="file" onChange={simulateLogoUpload} className="hidden" accept="image/*" />
                        </label>
                        {uploadedLogo && (
                          <div className="flex items-center gap-2">
                            <img src={uploadedLogo} alt="Preview" className="h-6 w-6 object-cover rounded-md" />
                            <span className="text-[9px] text-emerald-400 font-bold">Logo Yüklendi</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Theme color selections */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Kurumsal Arayüz Renk Tonu</label>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      {['#3B82F6', '#2ED0E1', '#10B981', '#FF9F0A', '#8B5CF6'].map(col => (
                        <button
                          key={col}
                          onClick={() => setFormTheme(col)}
                          className={`w-12 h-12 rounded-full transition-all border-2 border-slate-950 cursor-pointer flex items-center justify-center`}
                          style={{ backgroundColor: col }}
                        >
                          {formTheme === col && (
                            <Check className="h-4 w-4 text-white shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Adjust limits for this clinic */}
                <div className="border-t border-slate-900 pt-3.5 space-y-3.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">ÖZEL LİMİTLERİ ATAMA</span>

                  <div className="grid grid-cols-3 gap-4 text-xs bg-slate-900/40 p-3 rounded-xl">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Hekim Lisansı</span>
                      <input
                        type="number"
                        value={limitDoctors}
                        onChange={e => setLimitDoctors(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold p-2.5 rounded-lg focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Storage (GB)</span>
                      <input
                        type="number"
                        value={limitStorage}
                        onChange={e => setLimitStorage(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold p-2.5 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">AI Röntgen (Limit)</span>
                      <input
                        type="number"
                        value={limitAi}
                        onChange={e => setLimitAi(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold p-2.5 rounded-lg focus:outline-none focus:border-indigo-555"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Action operations buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={saveClinicDetails}
                  className={`bg-sky-600 hover:bg-sky-550 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-md border-none ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Güncellemeleri Kaydet
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLINIC CREATE MODAL DIALOG */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[150] overflow-y-auto bg-black/85 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white space-y-5"
            >

              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-emerald-900 text-emerald-450 p-2 rounded-xl border border-emerald-800/40">
                    <Plus className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">Kurumsal Yeni Klinik Tanımla</h3>
                    <p className="text-[10px] text-slate-500">Mevcut sunucu kümesine yeni bir diş kliniği ekleyin.</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-850 p-2 rounded-full text-slate-400 hover:text-white cursor-pointer border-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Create Form */}
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Klinik Adı / Tanımı</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                    placeholder="Örn: DentElite Nişantaşı Premium..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">İrtibat Telefon Numarası</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={e => setFormPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                      placeholder="0212 999 99 99"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Klinik Paketi</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl">
                      {(['Standard', 'Professional', 'Enterprise'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => applyPackageLimits(p)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all border-none ${formPackage === p
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-white bg-transparent'
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin credentials section */}
                <div className="border-t border-slate-900 pt-3.5 space-y-3">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block font-sans">KLİNİK YÖNETİCİSİ YETKİLİ HESABI (B2B SAHİBİ)</span>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Yetkili E-Posta Adresi</label>
                      <input
                        type="email"
                        value={formAdminEmail}
                        onChange={e => setFormAdminEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-505 font-mono"
                        placeholder="iletisim@yeniklinik.com"
                      />
                      <p className="text-[9px] text-slate-500">Bu e-posta yeni klinik kurucu hesabı olarak tanımlanır.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Geçici Erişim Şifresi</label>
                      <input
                        type="text"
                        value={formTemporaryPassword}
                        onChange={e => setFormTemporaryPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-505 font-mono font-bold"
                        placeholder="Örn: GECICI123"
                      />
                      <p className="text-[9px] text-slate-500">İlk girişte kalıcı şifre belirleterek kliniği aktif kılar.</p>
                    </div>
                  </div>
                </div>

                {/* Logo & Theme custom values */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-3">

                  {/* Symbol selection */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Klinik Logosu</label>
                      <div className="flex gap-1.5 text-[8px] font-bold">
                        <button
                          onClick={() => setLogoInputType('emoji')}
                          className={`px-1 py-0.5 rounded border-none cursor-pointer ${logoInputType === 'emoji' ? 'bg-sky-950 text-sky-450' : 'text-slate-500 bg-transparent'}`}
                        >
                          Emoji
                        </button>
                        <button
                          onClick={() => setLogoInputType('upload')}
                          className={`px-1 py-0.5 rounded border-none cursor-pointer ${logoInputType === 'upload' ? 'bg-sky-950 text-sky-458' : 'text-slate-500 bg-transparent'}`}
                        >
                          Yükle
                        </button>
                      </div>
                    </div>

                    {logoInputType === 'emoji' ? (
                      <div className="grid grid-cols-6 gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        {['🦷', '✨', '⚡', '🏥', '🔬', '🛡️'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => mockLogoSelect(emoji)}
                            className={`p-1.5 hover:bg-slate-800 rounded text-base transition-colors border-none cursor-pointer ${formLogo === emoji && !uploadedLogo ? 'bg-emerald-600' : 'bg-transparent'}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
                        <label className="w-full flex flex-col items-center justify-center border border-dashed border-slate-700 hover:border-sky-500 p-3 rounded-lg cursor-pointer transition-colors">
                          <UploadCloud className="h-6 w-6 text-slate-400" />
                          <span className="text-[9px] text-slate-400 font-bold mt-1">Logo Seç</span>
                          <input type="file" onChange={simulateLogoUpload} className="hidden" accept="image/*" />
                        </label>
                        {uploadedLogo ? (
                          <div className="flex items-center gap-2">
                            <img src={uploadedLogo} alt="Preview" className="h-6 w-6 object-cover rounded-md" />
                            <span className="text-[9px] text-emerald-400 font-bold">Logo Yüklendi</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Brand Theme selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Kurumsal Tema Rengi</label>
                    <div className="grid grid-cols-5 gap-1.5 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      {['#3B82F6', '#2ED0E1', '#10B981', '#FF9F0A', '#8B5CF6'].map(col => (
                        <button
                          key={col}
                          onClick={() => setFormTheme(col)}
                          className={`w-12 h-12 rounded-full transition-all border-2 border-slate-950 cursor-pointer flex items-center justify-center hover:scale-105`}
                          style={{ backgroundColor: col }}
                        >
                          {formTheme === col && (
                            <Check className="h-4 w-4 text-white shadow" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Adjust core resources limits */}
                <div className="border-t border-slate-900 pt-3.5 space-y-3.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-sans">ÖZEL KAYNAK LİMİTLERİ ATAMA</span>

                  <div className="grid grid-cols-3 gap-4 text-xs bg-slate-900/40 p-3 rounded-xl">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Doktor Lisansı</span>
                      <input
                        type="number"
                        value={limitDoctors}
                        onChange={e => setLimitDoctors(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Depolama (GB)</span>
                      <input
                        type="number"
                        value={limitStorage}
                        onChange={e => setLimitStorage(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-400 block font-bold">Aylık AI Röntgen</span>
                      <input
                        type="number"
                        value={limitAi}
                        onChange={e => setLimitAi(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold p-2.5 rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Action operations buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={createNewClinic}
                  className={`bg-emerald-600 hover:bg-emerald-550 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1 shadow-md border-none ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Ekleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Sisteme Dahil Et
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
