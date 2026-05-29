import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './ui/ToastContext';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  UserPlus, 
  Users, 
  ShieldCheck, 
  Phone, 
  FileText, 
  LogOut, 
  Smile, 
  ClipboardList, 
  Check,
  Copy,
  Ticket,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

interface SecretaryPortalProps {
  onExit: () => void;
  clinicId: string;
  clinics: any[];
  mockUsers: any[];
  onCreateUser: (userName: string, userEmail: string, role: 'doctor' | 'secretary' | 'patient', phone?: string, customPassword?: string) => void;
  onDeleteUser: (userId: string) => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
}

export default function SecretaryPortal({
  onExit,
  clinicId,
  clinics,
  mockUsers,
  onCreateUser,
  onDeleteUser,
  theme = 'light',
  setTheme
}: SecretaryPortalProps) {
  
  const currentClinic = clinics.find(c => c.id === clinicId) || clinics[0];
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'appointments' | 'patients'>('appointments');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration form states
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientTicket, setPatientTicket] = useState<{ name: string; email: string; pass: string } | null>(null);

  // Filter local clinic users, excluding clinic administrators
  const clinicUsers = mockUsers.filter(u => u.clinicId === clinicId && u.role !== 'clinic_admin');
  const doctors = clinicUsers.filter(u => u.role === 'doctor');
  const patients = clinicUsers.filter(u => u.role === 'patient');

  // Filter patients by search query
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientEmail.trim()) return;

    // Validate email uniqueness based on mockUsers list
    const emailExists = mockUsers.some(
      u => u.email.toLowerCase().trim() === patientEmail.toLowerCase().trim()
    );
    if (emailExists) {
      toast.error(`Doğrulama Hatası: "${patientEmail}" e-posta adresi sistemde zaten kayıtlıdır. Lütfen farklı bir e-posta adresi giriniz.`);
      return;
    }

    // Generate temporary passcode for patient
    const tempPass = 'temp-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Crucial: Pass the SAME tempPass to prevent password mismatch
    onCreateUser(patientName, patientEmail, 'patient', patientPhone, tempPass);

    setPatientTicket({
      name: patientName,
      email: patientEmail,
      pass: tempPass
    });

    setPatientName('');
    setPatientEmail('');
    setPatientPhone('');
    setShowAddPatientModal(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans select-none antialiased transition-colors duration-200">
      
      {/* Top Secretary Custom Styling banner */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-6 flex items-center justify-between shadow-sm border-t-4 border-clinic-accent">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden p-2 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-750 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title="Sistem Menüsü"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div 
            className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow shrink-0 bg-clinic-accent/15 border border-clinic-accent/50"
          >
            {currentClinic?.logoUrl.startsWith('blob:') || currentClinic?.logoUrl.startsWith('http') ? (
              <img src={currentClinic.logoUrl} alt="Logo" className="h-8 w-8 object-cover rounded" />
            ) : (
              <span>{currentClinic?.logoUrl || '🦷'}</span>
            )}
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">{currentClinic?.name} — Sekreter & Resepsiyon</h1>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">SaaS Klinik Giriş ve Randevu Koordinasyonu</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme?.(theme === 'light' ? 'dark' : 'light')}
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 animate-fade-in"
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
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sistemden Çık</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        
        {/* MOBİL BACKDROP OVERLAY */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden fixed inset-0 bg-slate-950/40 z-40 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Left Side Dock */}
        <aside className={`fixed inset-y-0 left-0 sm:relative z-50 sm:z-auto w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full select-none transition-transform sm:translate-x-0 duration-300 shadow-inner ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:flex'}`}>
          <div className="p-4 space-y-5">
            
            {/* Mobil Menü Kapatma Başlığı */}
            <div className="flex sm:hidden items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Navigasyon</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-705 dark:text-slate-300 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <span className="text-[9px] font-bold text-slate-500 tracking-widest block px-3 uppercase">Navigasyon</span>
            
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'bg-clinic-accent/20 text-clinic-accent dark:text-white font-extrabold shadow-inner'
                    : 'text-slate-500 dark:text-slate-400 hover:text-clinic-accent dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <ClipboardList className={`h-4 w-4 shrink-0 ${activeTab === 'appointments' ? 'text-clinic-accent' : 'text-slate-500'}`} />
                <span>Randevular & Hekimler</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('patients');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'patients'
                    ? 'bg-clinic-accent/20 text-clinic-accent dark:text-white font-extrabold shadow-inner'
                    : 'text-slate-500 dark:text-slate-400 hover:text-clinic-accent dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                <Users className={`h-4 w-4 shrink-0 ${activeTab === 'patients' ? 'text-clinic-accent' : 'text-slate-500'}`} />
                <span>Hasta Kayıt Defteri</span>
              </button>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-850 pt-4 space-y-2.5">
              <span className="text-[9px] font-bold text-slate-500 tracking-widest block px-3 uppercase">Görevli Hekimler</span>
              <div className="space-y-2">
                {doctors.map(d => (
                  <div key={d.id} className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white flex items-center gap-2 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="truncate">
                      <p className="font-extrabold truncate text-[11px]">{d.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase">HEKİM</p>
                    </div>
                  </div>
                ))}
                {doctors.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic px-3">Görevli hekim atanmamış.</p>
                )}
              </div>
            </div>

          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-850 text-center text-[10px] text-slate-400">
            Resepsiyon Sorumlu İstasyonu
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#F8F9FA] dark:bg-slate-950">
          
          <AnimatePresence mode="wait">
            {/* TAB 1: APPOINTMENTS & TEAM */}
            {activeTab === 'appointments' && (
              <motion.div
                key="appointments"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Intro Title */}
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-1">Randevu ve Hekim Dağılım Hizmeti</h3>
                  <p className="text-[10px] text-slate-500 font-bold">Klinik içerisindeki hekim ve hasta akışını koordine edin.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                  {[
                    { time: '09:00 - 09:30', patient: 'Selin Aydın', doctor: doctors[0]?.name || 'N/A', status: 'bitti', type: 'Yıllık Periyodik Kontrol' },
                    { time: '10:30 - 11:15', patient: 'Caner Koçak', doctor: doctors[0]?.name || 'N/A', status: 'bekliyor', type: 'Kompozit Dolgu Uygulaması' },
                    { time: '14:00 - 15:00', patient: 'Cansu Şen', doctor: doctors[0]?.name || 'N/A', status: 'aktif', type: 'Kanal Tedavisi Son Gözlem' }
                  ].map((app, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm relative animate-fade-in">
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl p-2 px-3 text-xs font-bold text-cyan-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-cyan-500" />
                          {app.time}
                        </span>
                        <span className={`text-[9px] uppercase font-black ${
                          app.status === 'bitti' ? 'text-emerald-500' : app.status === 'aktif' ? 'text-indigo-500 animate-pulse' : 'text-amber-500'
                        }`}>
                          {app.status === 'bitti' ? 'ÖDENDİ' : app.status === 'aktif' ? 'MUAYENEDE' : 'SIRASI GELEN'}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1.5">
                        <p className="text-slate-800 dark:text-white font-extrabold text-sm">{app.patient}</p>
                        <p className="text-[10px] text-slate-500">Uygulama: <em className="text-slate-600 dark:text-slate-400 font-bold font-sans not-italic">{app.type}</em></p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          Hekim: <strong className="text-slate-800 dark:text-white">{app.doctor}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Patient registration shortcut banner */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">Klinik lobisine yeni hasta mı ulaştı?</h4>
                    <p className="text-[10px] text-slate-500">Kimlik, e-posta ve telefonunu girerek anında geçici şifreli hasta kartı oluşturun.</p>
                  </div>

                  <button
                    onClick={() => {
                      setPatientTicket(null);
                      setShowAddPatientModal(true);
                    }}
                    className="bg-orange-655 hover:bg-orange-500 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/5 cursor-pointer"
                    style={{ backgroundColor: '#F97316', color: '#010409' }}
                  >
                    <UserPlus className="h-4 w-4" />
                    HASTA KAYDI OLUŞTUR
                  </button>
                </div>

              </motion.div>
            )}

            {/* TAB 2: PATIENT MANAGEMENT (Patient registration & ticket generation) */}
            {activeTab === 'patients' && (
              <motion.div
                key="patients"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Search Bar & Button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <div className="relative w-full sm:max-w-md">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 dark:text-white placeholder-slate-500 focus:outline-none"
                      placeholder="Hasta ismi veya e-posta adresi aratın..."
                    />
                  </div>

                  <button
                    onClick={() => {
                      setPatientTicket(null);
                      setShowAddPatientModal(true);
                    }}
                    className="bg-sky-652 text-white hover:bg-sky-500 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                    style={{ backgroundColor: currentClinic?.themeColor }}
                  >
                    <Plus className="h-4 w-4" />
                    Yeni Hasta Kaydı
                  </button>
                </div>

                {/* Ticket Display if just created */}
                {patientTicket && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-amber-50 dark:bg-slate-950 border-2 border-amber-500/30 p-5 rounded-2xl space-y-4 shadow flex flex-col md:flex-row items-center justify-between gap-4 relative animate-fade-in"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="text-amber-600 dark:text-amber-400 font-extrabold text-xs flex items-center gap-1.5 uppercase">
                        <Ticket className="h-4.5 w-4.5 text-amber-500 animate-bounce" />
                        HASTA GEÇİCİ ERİŞİM BİLETİ HAZIRLANDI!
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                        Hastaya ait SaaS hesabı alt yapıya eklenmiştir. Hasta, <strong>{patientTicket.email}</strong> e-posta adresi ve aşağıdaki geçici şifre ile sisteme giriş yaptığında **zorunlu şifre değiştirme ekranına** aktarılacaktır. Bilgileri yazdırıp hastaya teslim edebilir veya kopyalayabilirsiniz:
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl w-full md:w-80 space-y-2 select-text text-xs">
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">Hasta:</span><strong className="text-slate-800 dark:text-white">{patientTicket.name}</strong></div>
                      <div className="flex justify-between"><span className="text-slate-500 font-medium">E-Posta:</span><strong className="text-cyan-600 dark:text-cyan-400">{patientTicket.email}</strong></div>
                      <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-2.5 mt-2 bg-amber-50 dark:bg-amber-950/20 px-2 py-1.5 rounded border border-amber-200 dark:border-amber-900/30">
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-[10px]">Geçici Şifre:</span>
                        <span className="font-mono text-slate-800 dark:text-white font-black bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded select-all shadow-sm">{patientTicket.pass}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setPatientTicket(null)}
                      className="absolute top-3 right-3 text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-bold cursor-pointer"
                      title="Bileti Kapat"
                    >
                      Kapat
                    </button>
                  </motion.div>
                )}

                {/* Patient cards listings */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPatients.map(p => {
                    const isTemp = p.isTemporaryPassword;

                    return (
                      <div key={p.id} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between relative shadow-sm ${isTemp ? 'border-amber-500/10' : ''}`}>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="h-7 w-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] flex items-center justify-center">HP</span>
                            
                            <span className={`text-[8px] font-extrabold border py-0.5 px-2 rounded ${
                              isTemp ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                            }`}>
                              {isTemp ? 'GEÇİCİ ŞİFRE' : 'AKTİF ŞİFRELİ'}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-black text-slate-800 dark:text-white">{p.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-mono font-bold truncate">{p.email}</p>
                            {p.phoneNumber && (
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-bold">
                                <Phone className="h-3 w-3 text-slate-400" />
                                {p.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 text-[10px] font-mono text-slate-500 font-bold">
                          <span>SaaS ID: {p.id}</span>
                          <button
                            onClick={async () => {
                              if (await toast.confirm(`"${p.name}" isimli hastanın üyeliğini klinik ağından kaldırmak istiyor musunuz?`)) {
                                onDeleteUser(p.id);
                              }
                            }}
                            className="text-slate-450 hover:text-rose-455 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredPatients.length === 0 && (
                    <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center rounded-2xl font-bold flex flex-col items-center justify-center space-y-3 text-slate-500 shadow-sm">
                      <Users className="h-9 w-9 text-slate-300 dark:text-slate-600 animate-pulse" />
                      <p className="text-xs uppercase tracking-wider">Aradığınız kriterlerde kayıtlı hasta bulunamadı.</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal font-sans">SaaS klinik ağınızda henüz yeni kayıt başlatılmamış olabilir.</p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* POPUP MODAL: REGISTER PATIENT */}
      <AnimatePresence>
        {showAddPatientModal && (
          <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 w-full max-w-md text-slate-800 dark:text-white shadow-2xl relative"
            >
              <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <UserPlus className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Yeni Hasta Tanımla (Kart Tesis Et)</h3>
              </div>

              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Hasta Adı Soyadı</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="Hasta tam kimliği"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Sistem Kayıt E-Postası</label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={e => setPatientEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                    placeholder="hasta@gmail.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Telefon Numarası</label>
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                    placeholder="05..."
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                  🎟️ <strong>Ağ Güvenliği:</strong> Yeni hasta için sistem otomatik bir geçici şifre atar ve `isTemporaryPassword = true` olarak veritabanına işler. İlk girişte şifre değiştirilmesi zorunludur.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-clinic-accent hover:bg-clinic-accent/90 text-white font-black py-2.5 rounded-xl text-xs tracking-wider transition-colors cursor-pointer text-center outline-none border-none"
                  >
                    HASTAYI OLUŞTUR VE BİLET YAZDIR
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPatientModal(false)}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Kapat
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
