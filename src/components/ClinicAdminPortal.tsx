import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Users,
  Stethoscope,
  Plus,
  Trash2,
  Edit3,
  Palette,
  Layers,
  Check,
  LogOut,
  Phone,
  Calendar,
  AlertTriangle,
  UserCheck,
  Shield,
  Key,
  Copy,
  FolderOpen,
  Sun,
  Moon,
  Menu,
  X,
  RefreshCw,
  UserRoundCheck,
  BriefcaseMedical,
  Activity,
  User
} from 'lucide-react';
import { Clinic } from './AdminPortal';
import DoctorPortal from './DoctorPortal';
import { useToast } from './ui/ToastContext';

interface ClinicAdminPortalProps {
  onExit: () => void;
  clinicId: string;
  clinics: Clinic[];
  mockUsers: any[];
  onUpdateClinic: (updatedClinic: Clinic) => void;
  onCreateUser: (userName: string, userEmail: string, role: 'doctor' | 'secretary' | 'patient', phone?: string, customPassword?: string) => void;
  onDeleteUser: (userId: string) => void;
  clinicThemeColor?: string;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  patientName?: string;
  patientTeeth?: any[];
  updatePatientTeeth?: (teethData: any[]) => void;
  currentUser?: any;
}

export default function ClinicAdminPortal({
  onExit,
  clinicId,
  clinics,
  mockUsers,
  onUpdateClinic,
  onCreateUser,
  onDeleteUser,
  theme = 'light',
  setTheme,
  patientName,
  patientTeeth,
  updatePatientTeeth,
  currentUser
}: ClinicAdminPortalProps) {
  const toast = useToast();

  // Find current clinic
  const currentClinic = clinics.find(c => c.id === clinicId) || clinics[0] || {
    id: 'CLN-101',
    name: 'DentGroup Kadıköy Ana Klinik',
    logoUrl: '🦷',
    themeColor: '#3B82F6',
    status: 'active',
    packageName: 'Enterprise',
    doctorLimit: 25,
    storageLimit: 500,
    aiScanLimit: 10000,
    doctorCount: 18,
    storageUsed: 342.8,
    aiScanCount: 7820,
    createdDate: '2025-01-14',
    phone: '0216 444 3 444'
  };

  const [activeSubTab, setActiveSubTab] = useState<'Genel Bakış' | 'Hasta Kayıt & Listesi' | 'Tedavi & Teşhis Masası' | 'Randevu Defteri' | 'Ekipler & Kullanıcılar' | 'Klinik Özelleştirme' | 'Profilim'>('Genel Bakış');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Custom states for clinic edits
  const [clinicName, setClinicName] = useState(currentClinic.name);
  const [clinicPhone, setClinicPhone] = useState(currentClinic.phone || '');
  const [clinicTheme, setClinicTheme] = useState(currentClinic.themeColor);
  const [clinicLogo, setClinicLogo] = useState(currentClinic.logoUrl);

  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // User form states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'doctor' | 'secretary' | 'patient'>('doctor');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserTemporaryPassword, setNewUserTemporaryPassword] = useState('');
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sub-filter for users list
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'doctor' | 'secretary' | 'patient'>('all');

  // Load editing state
  useEffect(() => {
    if (currentClinic) {
      setClinicName(currentClinic.name);
      setClinicPhone(currentClinic.phone || '');
      setClinicTheme(currentClinic.themeColor);
      setClinicLogo(currentClinic.logoUrl);
    }
  }, [currentClinic]);

  // Handle clinic configurations update
  const saveClinicSettings = () => {
    onUpdateClinic({
      ...currentClinic,
      name: clinicName,
      phone: clinicPhone,
      themeColor: clinicTheme,
      logoUrl: clinicLogo
    });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Find users in this specific clinic, excluding clinic administrators
  const clinicUsers = mockUsers.filter(u => u.clinicId === clinicId && u.role !== 'clinic_admin');

  const filteredUsers = clinicUsers.filter(u => {
    if (userRoleFilter === 'all') return true;
    return u.role === userRoleFilter;
  });

  const doctorsList = clinicUsers.filter(u => u.role === 'doctor');
  const secretariesList = clinicUsers.filter(u => u.role === 'secretary');
  const patientsList = clinicUsers.filter(u => u.role === 'patient');

  // Set default role matching active category tab when modal opens
  const openAddUserModal = () => {
    setCreatedUserCredentials(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserTemporaryPassword('temp-' + Math.random().toString(36).substring(2, 8).toUpperCase());

    if (userRoleFilter && userRoleFilter !== 'all') {
      setNewUserRole(userRoleFilter as any);
    } else {
      setNewUserRole('doctor');
    }
    setShowAddUserModal(true);
  };

  // Handle staff/user registrations
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    // Validate email uniqueness to prevent session/routing hijacked conflicts
    const emailExists = mockUsers.some(
      u => u.email.toLowerCase().trim() === newUserEmail.toLowerCase().trim()
    );
    if (emailExists) {
      toast.error(`Doğrulama Hatası: "${newUserEmail}" e-posta adresi sistemde zaten kayıtlıdır. Lütfen farklı bir e-posta adresi giriniz.`);
      return;
    }

    // Check doctor quota limit
    if (newUserRole === 'doctor' && doctorsList.length >= currentClinic.doctorLimit) {
      toast.error(`Limit Uyarısı: Bu klinikteki hekim sayısı (${doctorsList.length}) mevcut paket limitine (${currentClinic.doctorLimit}) ulaştı. Limit artırımı için sistem yöneticisine başvurun.`);
      return;
    }

    // Use specified/templated temporary pass
    const tempPass = newUserTemporaryPassword.trim() || ('temp-' + Math.random().toString(36).substring(2, 8).toUpperCase());

    setActionLoading(true);
    try {
      // Fire callback
      await onCreateUser(newUserName, newUserEmail, newUserRole, newUserPhone, tempPass);

      // Capture to display in card
      setCreatedUserCredentials({
        name: newUserName,
        email: newUserEmail,
        pass: tempPass
      });

      // Reset fields
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserTemporaryPassword('');
      setShowAddUserModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Kullanıcı kaydı oluşturulurken bir hata meydana geldi.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none antialiased transition-colors duration-200">

      {/* Top Clinic Branding Responsive Navbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex items-center justify-between shadow-sm border-t-4 border-clinic-accent">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden p-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-750 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title="Klinik Menüsü"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0 bg-clinic-accent/15 border border-clinic-accent/50"
          >
            {currentClinic.logoUrl.startsWith('blob:') || currentClinic.logoUrl.startsWith('http') ? (
              <img src={currentClinic.logoUrl} alt="Logo" className="h-8 w-8 object-cover rounded" />
            ) : (
              <span>{currentClinic.logoUrl}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{currentClinic.name}</h1>
              <span className="text-[9px] bg-sky-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold uppercase">{currentClinic.packageName}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Klinik Yönetim Paneli — Yetkili: {mockUsers.find(u => u.role === 'clinic_admin' && u.clinicId === clinicId)?.name || 'Yönetici'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme?.(theme === 'light' ? 'dark' : 'light')}
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </button>

          <button
            onClick={onExit}
            className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-500" />
            <span>Sistemden Çık</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* MOBİL BACKDROP OVERLAY */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden fixed inset-0 bg-slate-950/40 z-40 backdrop-blur-sm animate-fadeIn"
            />
          )}
        </AnimatePresence>

        {/* Left Hand Navigation Drawer / Tabs */}
        <aside className={`fixed inset-y-0 left-0 sm:relative z-50 sm:z-auto w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full select-none transition-transform sm:translate-x-0 duration-300 shadow-inner ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:flex'}`}>
          <div className="p-4 space-y-5">

            {/* Mobil Menü Kapatma Başlığı */}
            <div className="flex sm:hidden items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Modüller</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-1.5 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <span className="text-[9px] font-bold text-slate-500 tracking-widest block px-3 uppercase">Modüller</span>

            <div className="space-y-1">
              {[
                { id: 'Genel Bakış', label: 'Genel Bakış', icon: Activity },
                { id: 'Hasta Kayıt & Listesi', label: 'Hasta Kayıt & Listesi', icon: UserRoundCheck },
                { id: 'Tedavi & Teşhis Masası', label: 'Tedavi & Teşhis Masası', icon: BriefcaseMedical },
                { id: 'Randevu Defteri', label: 'Randevu Defteri', icon: Calendar },
                { id: 'Ekipler & Kullanıcılar', label: 'Ekipler & Kullanıcılar', icon: Users },
                { id: 'Klinik Özelleştirme', label: 'Klinik Özelleştirme', icon: Palette },
                { id: 'Profilim', label: 'Profilim', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveSubTab(tab.id as any);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected
                      ? 'bg-clinic-accent/20 border-l-3 border-clinic-accent text-clinic-accent dark:text-white shadow-inner animate-pulse'
                      : 'text-slate-500 dark:text-slate-400 hover:text-clinic-accent dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60'
                      }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-clinic-accent' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quota overview panel */}
            <div className="border-t border-slate-200 dark:border-slate-850 pt-4 space-y-3">
              <span className="text-[9px] font-bold text-slate-500 tracking-widest block px-3 uppercase">Plan Durumu</span>

              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-inner flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Aktif Paket:</span>
                <span className="text-[10px] bg-sky-950/80 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {currentClinic.packageName} Planı
                </span>
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-950/40 text-center">
            <span className="text-[9px] font-bold text-slate-600 font-mono tracking-tight block">Klinik UUID: {currentClinic.id}</span>
          </div>
        </aside>

        {/* Mid Viewport */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">

          <AnimatePresence mode="wait">
            {/* SUB-TAB 2: STAFF & USERS (doctor, secretary, patient creation with temp password) */}
            {activeSubTab === 'Ekipler & Kullanıcılar' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Quick Credentials Information Card */}
                {createdUserCredentials && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-amber-50/50 dark:bg-slate-950 border-2 border-amber-500/30 rounded-2xl p-5 shadow-xl mb-4 relative"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="h-5 w-5 text-amber-500 animate-pulse" />
                      <h4 className="text-slate-800 dark:text-slate-250 text-xs font-black uppercase">Hesap Başarıyla Oluşturuldu (Geçici Şifre Atandı)</h4>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                      Sistem, oluşturulan yeni personel/hasta için otomatik geçici giriş şifresi tanımladı. Kullanıcı bu şifre ile ilk girişi yaptığında **zorunlu şifre değiştirme ekranına** yönlendirilecektir. Gerekli giriş bilgilerini kopyalayıp iletebilirsiniz:
                    </p>

                    <div className="bg-slate-100 dark:bg-slate-900 p-3.5 rounded-xl text-xs space-y-2 border border-slate-200 dark:border-slate-800 select-text">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Kullanıcı Sorumlusu:</span>
                        <strong className="text-slate-900 dark:text-white">{createdUserCredentials.name}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Sistem Giriş E-Postası:</span>
                        <strong className="text-cyan-600 dark:text-cyan-400">{createdUserCredentials.email}</strong>
                      </div>
                      <div className="flex justify-between items-center bg-amber-950/20 px-2 py-1.5 rounded border border-amber-900/20">
                        <span className="text-amber-605 dark:text-amber-400 font-bold uppercase text-[10px]">Geçici Şifre:</span>
                        <span className="flex items-center gap-1.5 font-mono text-slate-900 dark:text-white font-black bg-slate-200 dark:bg-slate-950 px-2.5 py-1 rounded">
                          {createdUserCredentials.pass}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(createdUserCredentials.pass);
                              toast.success('Geçici şifre panoya kopyalandı.');
                            }}
                            className="text-amber-600 dark:text-amber-400 hover:text-amber-500 cursor-pointer"
                            title="Bilgileri Kopyala"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setCreatedUserCredentials(null)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-bold"
                    >
                      Kapat
                    </button>
                  </motion.div>
                )}

                {/* Control Panel filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: `Tümü (${clinicUsers.length})` },
                      { id: 'doctor', label: `Hekimler (${doctorsList.length})` },
                      { id: 'secretary', label: `Sekreterler (${secretariesList.length})` },
                      { id: 'patient', label: `Hastalar (${patientsList.length})` }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setUserRoleFilter(f.id as any)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${userRoleFilter === f.id
                          ? 'bg-slate-100 dark:bg-slate-800 border text-slate-800 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        style={userRoleFilter === f.id ? { borderColor: currentClinic.themeColor } : {}}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={openAddUserModal}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    style={{ backgroundColor: currentClinic.themeColor }}
                  >
                    <Plus className="h-4 w-4" />
                    Yeni Kullanıcı Kaydet
                  </button>
                </div>

                {/* Users List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => {
                    const isDoctor = user.role === 'doctor';
                    const isSec = user.role === 'secretary';
                    const isPatient = user.role === 'patient';
                    const isTemp = user.isTemporaryPassword;

                    return (
                      <div
                        key={user.id}
                        className={`bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 p-4.5 rounded-2xl relative shadow flex flex-col justify-between ${isTemp ? 'border-amber-500/20 dark:border-amber-500/20' : ''
                          }`}
                      >
                        {/* Upper Details Block */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black border px-2 py-0.5 rounded-full uppercase ${isDoctor ? 'bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border-sky-105 dark:border-sky-900/40' :
                              isSec ? 'bg-teal-50 dark:bg-teal-950 text-teal-655 dark:text-teal-400 border-teal-100 dark:border-teal-900/40' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40'
                              }`}>
                              {user.role === 'doctor' ? 'HEKİM' : user.role === 'secretary' ? 'SEKRETER' : 'HASTA'}
                            </span>

                            <span className={`text-[8px] font-extrabold border py-0.5 px-2 rounded ${isTemp ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 font-mono animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-650 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                              }`}>
                              {isTemp ? 'ŞİFREMİ DEĞİŞTİRMEDİ' : 'AKTİF ŞİFRELİ'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-white tracking-tight">{user.name}</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold mt-1 truncate">{user.email}</p>
                            {user.phoneNumber && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 font-bold">
                                <Phone className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                                {user.phoneNumber}
                              </p>
                            )}
                            {isTemp && user.password && (
                              <div className="mt-2 text-[10px] bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-2 rounded-xl flex items-center justify-between">
                                <span className="text-amber-600 dark:text-amber-500 font-bold font-mono">Geçici Şifre:</span>
                                <span className="text-slate-800 dark:text-white font-mono font-black select-all cursor-pointer" title="Dokunup Kopyalayın">{user.password}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lower Action bar */}
                        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-3 mt-4 text-xs">
                          <span className="text-[9px] font-mono text-slate-500 dark:text-slate-600 font-bold">ID: {user.id}</span>

                          <div className="flex items-center gap-2">
                            {/* Prohibit clinic administrator deleting themselves */}
                            {user.role !== 'clinic_admin' && (
                              <button
                                onClick={async () => {
                                  if (await toast.confirm(`"${user.name}" kullanıcısını silmek istediğinize emin misiniz?`)) {
                                    onDeleteUser(user.id);
                                  }
                                }}
                                className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                                title="Kullanıcıyı Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Visual temporary warning */}
                        {isTemp && (
                          <div className="absolute right-3.5 bottom-12 text-right">
                            <span className="text-[8px] text-amber-600 dark:text-amber-500 font-bold block">Geçici Şifre Atandı</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <div className="col-span-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-3 text-slate-500">
                      <FolderOpen className="h-10 w-10 text-slate-400 dark:text-slate-600 animate-pulse" />
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-500">Bu kategoride kullanıcı kaydı bulunamadı.</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-600 max-w-sm">Sağ üstteki mavi düğmeye dokunarak yeni hekim veya hasta kayıt edebilir ve ilk giriş kodları alabilirsiniz.</p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* SUB-TAB 3: CLINIC CUSTOM STYLING (Branding Settings) */}
            {activeSubTab === 'Klinik Özelleştirme' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid lg:grid-cols-12 gap-6 bg-white dark:bg-slate-900/50 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">

                  {/* Styling Form */}
                  <div className="lg:col-span-7 space-y-5">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">MARKA VE RENK AYARLARI</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Klinik kimliğinizi global olarak kurdistanın her yerinde simüle eder.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Klinik Kurumsal Adı</label>
                        <input
                          type="text"
                          value={clinicName}
                          onChange={e => setClinicName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-bold"
                          placeholder="Örn: DentGroup Kadıköy Polikliniği"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Klinik İletişim Telefonu</label>
                        <input
                          type="text"
                          value={clinicPhone}
                          onChange={e => setClinicPhone(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-bold"
                          placeholder="Örn: 0216 444 3 444"
                        />
                      </div>

                      {/* Theme Colors selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Kurumsal Tema Rengi (HEX)</label>

                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={clinicTheme}
                            onChange={e => setClinicTheme(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-10 w-16 p-1 cursor-pointer focus:outline-none"
                          />
                          <input
                            type="text"
                            value={clinicTheme}
                            onChange={e => setClinicTheme(e.target.value)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
                            placeholder="#3B82F6"
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap gap-2.5 pt-1.5">
                          {[
                            { color: '#3B82F6', name: 'Zümrüt Mavi' },
                            { color: '#2ED0E1', name: 'Göz Alıcı Turkuaz' },
                            { color: '#10B981', name: 'Nane Yeşil' },
                            { color: '#E74C3C', name: 'Canlı Kırmızı' },
                            { color: '#8B5CF6', name: 'Kurumsal Mor' },
                            { color: '#F59E0B', name: 'Kehribar Sarı' }
                          ].map(preset => (
                            <button
                              key={preset.color}
                              onClick={() => setClinicTheme(preset.color)}
                              className="text-[10px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-405 dark:hover:border-slate-550 text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-all text-left font-semibold cursor-pointer"
                            >
                              <span className="h-3 w-3 rounded-full inline-block" style={{ backgroundColor: preset.color }} />
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Logo Icon Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Klinik Sembolü (Emoji Seçici)</label>
                        <div className="grid grid-cols-6 gap-2 text-center">
                          {['🦷', '✨', '⚡', '🏥', '🔬', '🤍', '⭐', '🧬', '🛡️', '🩺', '🏆', '💎'].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setClinicLogo(emoji)}
                              className={`h-11 rounded-xl text-lg flex items-center justify-center border font-bold ${clinicLogo === emoji
                                ? 'bg-slate-100 dark:bg-slate-900 border-slate-400 dark:border-white text-slate-900 dark:text-white'
                                : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {isSavedAlert && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-450 rounded-xl p-3 text-xs font-bold">
                        ✓ Klinik kurumsal ayarları başarıyla kaydedildi. Markalama değişiklikleri tüm personel ekranlarına yansıtıldı.
                      </div>
                    )}

                    <button
                      onClick={saveClinicSettings}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-3 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/5 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4 text-white" />
                      YAPILANDIRMALARI KAYDET
                    </button>
                  </div>

                  {/* Brand Preview Panel */}
                  <div className="lg:col-span-5 bg-slate-100/60 dark:bg-slate-900/45 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold uppercase tracking-wider block mb-2">Canlı Görünüm Önizleme</span>

                      <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl space-y-4 relative border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: clinicTheme }} />

                        <div className="flex items-center space-x-3 select-none">
                          <div
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow"
                            style={{ backgroundColor: `${clinicTheme}15`, border: `1.5px solid ${clinicTheme}40` }}
                          >
                            <span>{clinicLogo}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-850 dark:text-white">{clinicName || 'Klinik Kurumsal Adı'}</h4>
                            <p className="text-[9px] text-slate-505 dark:text-slate-400 font-bold font-mono mt-0.5">Telefon: {clinicPhone || 'Tanımlanmamış'}</p>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-900 p-3.5 rounded-xl space-y-2">
                          <div className="w-1/3 bg-slate-200 dark:bg-slate-800 h-2 rounded animate-pulse" />
                          <div className="w-full bg-slate-250 dark:bg-slate-800 h-1.5 rounded animate-pulse" />
                          <div className="w-4/5 bg-slate-250 dark:bg-slate-800 h-1.5 rounded animate-pulse" />
                        </div>

                        <button
                          className="w-full text-[10px] font-black py-2 rounded-lg text-white transition-all pointer-events-none text-center"
                          style={{ backgroundColor: clinicTheme }}
                        >
                          Örnek Buton
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-4 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      💡 <strong>Tasarım Notu:</strong> Tema rengi veritabanında hex kodu olarak saklanır. Klinik çalışanı (Hekim, Sekreter, Hasta) sisteme giriş yaptığı andan itibaren portal bileşenleri, kartlar ve butonlar yukarıda seçtiğiniz marka renk skalasına bürünür.
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* DOCTOR PORTAL HYBRID VIEWS */}
            {(activeSubTab === 'Genel Bakış' ||
              activeSubTab === 'Hasta Kayıt & Listesi' ||
              activeSubTab === 'Tedavi & Teşhis Masası' ||
              activeSubTab === 'Randevu Defteri' ||
              activeSubTab === 'Profilim') && (
                <motion.div
                  key="doctor-hybrid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full h-full"
                >
                  <DoctorPortal
                    onExit={onExit}
                    patientName={patientName || ''}
                    patientTeeth={patientTeeth || []}
                    updatePatientTeeth={updatePatientTeeth || (() => { })}
                    clinicId={clinicId}
                    clinics={clinics}
                    mockUsers={mockUsers}
                    onCreateUser={onCreateUser}
                    onDeleteUser={onDeleteUser}
                    theme={theme === 'light' ? 'light' : 'dark'}
                    setTheme={setTheme}
                    currentUser={currentUser}
                    hideSidebar={true}
                    forcedActiveMenu={activeSubTab}
                  />
                </motion.div>
              )}
          </AnimatePresence>

        </main>
      </div>

      {/* POPUP MODAL FOR ADDING USERSTAFF */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 w-full max-w-md text-slate-800 dark:text-white shadow-2xl relative"
            >

              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Klinik Kullanıcısı Tanımla</h3>
              </div>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Kullanıcı Tam Adı</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    required
                    disabled={actionLoading}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                    placeholder="Ad Soyad"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest block font-mono">Klinik E-Postası (Login Email)</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    required
                    disabled={actionLoading}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                    placeholder="doc.ahmet@klinik.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Sistem Rol Yetkisi</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    disabled={actionLoading}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-bold disabled:opacity-50"
                  >
                    <option value="doctor">Hekim (Doctor)</option>
                    <option value="secretary">Sekreter (Secretary)</option>
                    <option value="patient">Hasta (Patient)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Kullanıcı Telefon Numarası</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={e => setNewUserPhone(e.target.value)}
                    disabled={actionLoading}
                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none disabled:opacity-50"
                    placeholder="0532 000 00 00"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest block font-mono">Giriş Geçici Şifresi</label>
                  <input
                    type="text"
                    value={newUserTemporaryPassword}
                    onChange={e => setNewUserTemporaryPassword(e.target.value)}
                    required
                    disabled={actionLoading}
                    className="w-full bg-amber-50/30 dark:bg-slate-900/80 border border-amber-300 dark:border-amber-600/50 focus:border-amber-400 rounded-xl py-2.5 px-3.5 text-xs text-amber-900 dark:text-amber-200 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono font-bold disabled:opacity-50"
                    placeholder="Örn: GECICI123"
                  />
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">Kullanıcının ilk girişte kullanarak kendi şifresini belirleyeceği şifre.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                  ⚡ <strong>UYARI:</strong> Hesap oluşturulduğunda sistem otomatik geçici şifre atar ve kullanıcı ilk girişinde şifresini yenileyerek sisteme giriş yapabilir.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-2.5 rounded-xl text-xs tracking-wider transition-colors text-center flex items-center justify-center gap-1.5 ${actionLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    style={{ backgroundColor: currentClinic.themeColor }}
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>KAYDEDİLİYOR...</span>
                      </>
                    ) : (
                      <span>KAYDI OLUŞTUR</span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowAddUserModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    İptal Et
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
