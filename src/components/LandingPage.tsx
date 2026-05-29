import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Activity,
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronRight,
  UserCheck,
  Building2,
  HeartPulse,
  Stethoscope,
  MessageSquare,
  Clock,
  ClipboardList,
  Zap,
  CheckCircle2,
  Users,
  HardDrive,
  User,
  HelpCircle,
  Menu,
  X,
  FileCheck,
  Globe2,
  LockKeyhole
} from 'lucide-react';

interface LandingPageProps {
  onEnterLogin: () => void;
  theme?: 'light' | 'dark';
}

export default function LandingPage({ onEnterLogin, theme = 'light' }: LandingPageProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulated live reviews metric
  const stats = [
    { value: 'CLN-101 & CLN-102', label: 'Aktif Sistem Sitede', icon: Building2, color: 'text-blue-500' },
    { value: '32 Hücreli', label: 'İnteraktif Diş Haritası', icon: Activity, color: 'text-teal-500' },
    { value: 'Real-Time', label: 'Gemini AI Hekim Asistanı', icon: Zap, color: 'text-amber-500' },
    { value: '120 Saniye', label: 'Özel Diş Fırçalama Rehberi', icon: Clock, color: 'text-indigo-500' }
  ];

  const faqs = [
    {
      q: 'DişAsistanım platformu tam olarak nedir?',
      a: 'DişAsistanım, hem klinik yöneticileri, diş hekimleri ve sekreterler için tam kapsamlı bir bulut tabanlı klinik CRM yazılımı sunan, hem de bireysel hastalar için yapay zeka destekli ağız hijyen analizi ve 120 saniyelik interaktif fırçalama takip asistanlığı sağlayan yenivelis, çoklu-kiracılı (multi-tenant) bir diş sağlığı platformudur.'
    },
    {
      q: 'Platformun veri güvenliği ve KVKK uyumluluğu nasıldır?',
      a: 'Yazılımımız en yüksek düzey şifreleme ile bütünleşik çalışır, kişisel veriler yerel veritabanlarında güven altında tutulur. Klinik şifreleme algoritmalarımız sayesinde yetkisiz erişimler tamamen engellenmektedir.'
    },
    {
      q: 'Giriş yapmak için önceden tanımlanmış kullanıcılar var mıdır?',
      a: 'Evet! Giriş panelinde tüm roller için demo hesap bilgileri (Süper Admin, Klinik Yöneticisi, Hekim, Sekreter, Hasta) otomatik olarak tek tıkla seçilebilecek şekilde hazır yer almaktadır. Böylece her rolü anında deneyimleyebilirsiniz.'
    },
    {
      q: 'Fırçalama asistanı ve Yapay Zeka analiz aracı nasıl çalışıyor?',
      a: 'Fırçalama asistanı, ağzın 8 farklı bölgesini 15’er saniyelik periyotlarla fırçalamanızı sağlayan sesli ve görsel bir zamanlayıcı sunar. Yapay zeka analiz aracı ise yüklediğiniz veya örnek seçtiğiniz diş fotoğraflarını dijital olarak tarayıp plak birikim seviyesini ve tahmini çürük riskini hesaplayarak iyileştirme tavsiyelerinde bulunur.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FBFC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Dynamic Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#F9FBFC]/85 dark:bg-slate-950/85 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 cursor-pointer">
            <div className="bg-gradient-to-tr from-blue-500 to-teal-400 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/10">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-[#1A2E40] dark:text-slate-100 flex items-center gap-1.5">
                DişAsistanım <span className="text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded">SaaS AI</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none">Dental AI Platform</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors uppercase">Özellikler</a>
            <a href="#security" className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors uppercase">Kurumsal Güvenlik</a>
            <a href="#metrics" className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors uppercase">İstatistikler</a>
            <a href="#faq" className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors uppercase">S.S.S.</a>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onEnterLogin}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <span>Platforma Giriş Yap</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Hamburg menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-[#F9FBFC] dark:bg-slate-950 px-4 py-4 space-y-3"
            >
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 py-1"
              >
                ÖZELLİKLER
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 py-1"
              >
                KURUMSAL GÜVENLİK
              </a>
              <a
                href="#metrics"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 py-1"
              >
                İSTATİSTİKLER
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 py-1"
              >
                S.S.S.
              </a>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnterLogin();
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Sisteme Giriş Yap</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero / Landing Main Area */}
      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="relative py-16 md:py-24 overflow-hidden px-4">
          <div className="absolute top-1/6 left-1/10 w-96 h-96 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-[110px] -z-10"></div>

          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Column Text Details */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <Zap className="h-3.5 w-3.5 fill-blue-500/20" />
                <span>MULTİ-TENANT BULUT TABANLI KLİNİK & AGIZ BAKIM PLATFORMU</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Dental Süreçleri <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400">
                  Yapay Zeka Gücüyle
                </span> <br />
                Yeniden Tanımlayın
              </h1>

              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl leading-relaxed mx-auto lg:mx-0">
                DişAsistanım; Diş Hekimleri, Klinik Sorumluları, Randevu Sekreterleri ve Bireysel Diş Hastalarını tek bir dijital ekosistemde birleştiren, interaktif 32 diş haritasyonu ve Gemini AI teşhis botları ile donatılmış yeni nesil ağız sağlığı platformudur.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={onEnterLogin}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3.5 rounded-full text-xs font-bold shadow-xl shadow-blue-500/15 hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="h-4.5 w-4.5" />
                  <span>Sisteme Giriş Yap</span>
                </button>
                <a
                  href="#features"
                  className="border-2 border-slate-300 dark:border-slate-800 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 dark:hover:text-white px-8 py-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Özellikleri İncele</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              {/* Secure note */}
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[10px] text-slate-400 font-semibold font-mono">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>GÜVENLİ VERİ YAPISI • %100 LOCAL STORAGE DEPOLAMA VAADİ</span>
              </div>
            </div>

            {/* Right Column Core Dashboard View Mockup */}
            <div className="lg:col-span-5 relative w-full px-4 sm:px-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6.5 shadow-2xl relative overflow-hidden"
              >
                {/* Decorative dots grid background inside mockup */}
                <div className="absolute inset-0 bg-[radial-gradient(#2F80ED_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500 inline-block"></span>
                    <span className="h-3 w-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-[10px] font-mono text-slate-400 pl-2">dentsai-cloud-node-active</span>
                  </div>
                  <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-0.5 px-2 rounded font-mono font-bold">API STATUS: 200 OK</span>
                </div>

                <div className="space-y-4">

                  {/* Visual simulated AI Scan box */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">PANORAMİK RÖNTGEN ANALİZİ</span>
                      <span className="text-[9px] font-bold text-slate-400 font-mono">Hassasiyet %98.4</span>
                    </div>

                    <div className="h-16 bg-slate-200 dark:bg-slate-900 rounded-lg flex items-center justify-center border border-slate-300/40 relative overflow-hidden">
                      {/* Pulse scanning bar */}
                      <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-gradient-to-b from-blue-400 via-sky-500 to-teal-400 opacity-90 animate-[ping_3s_infinite]" />
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                        <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Bulut Teşhis Motoru Aktif...</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded-lg">
                        <p className="text-lg font-black text-slate-900 dark:text-white font-mono">%14</p>
                        <p className="text-[9px] text-slate-500">Ortalama Plak Oranı</p>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-2 rounded-lg">
                        <p className="text-lg font-black text-rose-500 font-mono">2 Adet</p>
                        <p className="text-[9px] text-slate-500">Çürük Formasyonu</p>
                      </div>
                    </div>
                  </div>

                  {/* Visual simulated mouth tracking tooth row preview */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-slate-500 space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Aktif Tedavi Geçmişi</span>
                      <span className="text-emerald-500 font-bold">16 Sağ Üst Molar</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-bold">
                      "Kanal tedavisi başarıyla uygulandı. 2026-05-24 tarihinde son durum kontrolü kompozit dolgu ile kapatıldı."
                    </p>
                  </div>

                  {/* Gemini AI Stethoscope assistance chat simulation */}
                  <div className="bg-blue-50/50 dark:bg-slate-950/70 p-3.5 rounded-xl border border-blue-100/30 text-xs text-slate-500 relative">
                    <div className="flex items-center gap-1.5 font-bold text-[#1A2E40] dark:text-slate-200 mb-1">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <span>Hekim Klinik Yapay Zeka Asistanı</span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 dark:text-slate-400 italic">
                      "Diş gıcırdatmaya bağlı çene yıpranmaları için hastanıza özel gece plağı (splint) önermektesiniz. Tedavi planını PDF olarak kaydetmemi ister misiniz?"
                    </p>
                  </div>

                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* STATS COUNTER BAR */}
        <section id="metrics" className="bg-slate-100 dark:bg-slate-900 py-10 border-y border-slate-200/50 dark:border-slate-800/80 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, sIdx) => {
              const IconComp = stat.icon;
              return (
                <div key={sIdx} className="flex items-center space-x-3.5">
                  <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/40 dark:border-slate-705 ${stat.color}`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono">{stat.value}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HIGH-PERFORMANCE B2B SOLUTION LAYERS */}
        <section id="security" className="py-20 px-4 scroll-mt-12">
          <div className="max-w-7xl mx-auto space-y-12">

            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                <LockKeyhole className="h-3 w-3" />
                <span>GÜVENLİ VE ENTEGRE DENTAL ALTYAPI STANDARTLARI</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A2E40] dark:text-white">Veri Güvenliği ve Kurumsal Standartlar</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
                DişAsistanım, uluslararası dental standartlara uyumlu şekilde kliniklerinizin ve hastalarınızın veri sınırlarını güvenceye alır.
              </p>
            </div>

            {/* Grid of Solutions */}
            <div className="grid md:grid-cols-2 gap-8">

              {/* Item 1 */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-850 p-6.5 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-5">
                <div className="p-3.5 bg-blue-550/10 text-blue-500 dark:bg-blue-950/40 rounded-2xl shrink-0">
                  <ShieldCheck className="h-6.5 w-6.5" />
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-[#1A2E40] dark:text-slate-400 font-mono block">MİMARİ GÜVENLİK</span>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Uçtan Uca KVKK Uyumlu Şifreleme</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Sistemdeki hekim, sekreter, hastalar ve klinik detayları en yeni kriptolojiler ile şifrelenir. Randevular ve özel panoramik röntgen verileri yalnızca yetkilendirilmiş personel tarafından sorgulanabilir.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-850 p-6.5 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-5">
                <div className="p-3.5 bg-indigo-550/10 text-indigo-500 dark:bg-indigo-950/40 rounded-2xl shrink-0">
                  <FileCheck className="h-6.5 w-6.5" />
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-indigo-500 dark:text-indigo-400 font-mono block">VERİ SAĞLIĞI</span>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">FDI Standartlarında Teşhis Raporlama</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Tüm ağız diş şemaları Dünya Diş Hekimleri Birliği (FDI) uyumlu 32 diş numara yapısına göre kaydedilir. Hekimler ve sekreterler arasındaki iş akışları hatasız bir şekilde akıllı kartlara dönüştürülür.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-850 p-6.5 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-5">
                <div className="p-3.5 bg-teal-550/10 text-teal-500 dark:bg-teal-950/40 rounded-2xl shrink-0">
                  <Globe2 className="h-6.5 w-6.5" />
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-teal-500 dark:text-teal-400 font-mono block">ALTYAPI</span>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Multi-Tenant Bağımsız Bulut Kümeleri</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Her sisteme kaydolan klinik bağımsız depolama hacmine ve izole kullanıcı yetki sınırlarına sahip olur. Süper seviyedeki sistem kaynakları dinamik olarak dengelenir ve kesintisiz erişim (99.9% Uptime) sunulur.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-850 p-6.5 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start gap-5">
                <div className="p-3.5 bg-amber-550/10 text-amber-500 dark:bg-amber-950/40 rounded-2xl shrink-0">
                  <Sparkles className="h-6.5 w-6.5" />
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-[#1A2E40] dark:text-slate-400 font-mono block">ZEKİ TEKNOLOJİ</span>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Akıllı Klinik Karar Destek Mekanizması</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Gelişmiş LLM (Gemini AI) dil modelleri ile uyumlu hekim asistanlığı sayesinde tedavi planlamaları, fırçalama analizleri ve hasta bilgilendirmeleri otomatik öneri motoruyla optimize edilir.
                  </p>
                </div>
              </div>

            </div>

            {/* Custom Interactive flow representation for dental clinics */}
            <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-850 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-sm font-extrabold text-[#1A2E40] dark:text-white">Kendi kliniğinizin dijital güvenliğini şimdi aktif edin</h4>
                <p className="text-xs text-slate-550 dark:text-slate-400">Üst seviye hiyerarşik güvenlik ve ön tanımlı demo ekosistemimizi saniyeler içinde keşfedin.</p>
              </div>
              <button
                onClick={onEnterLogin}
                className="bg-transparent hover:bg-slate-900 hover:text-white dark:hover:bg-slate-800 border-2 border-slate-805 dark:border-slate-700 text-slate-800 dark:text-slate-205 py-2.5 px-6 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>Hemen Giriş Yap</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </section>

        {/* CORE PLATFORM FEATURES BENTO SECTIONS */}
        <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-850 px-4">
          <div className="max-w-7xl mx-auto space-y-12">

            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A2E40] dark:text-white">Gelişmiş Teknolojik Altyapı</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Hem hekimler hem hastalar için tasarlanmış uçtan uca zeki yetenekler.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

              {/* Feature 1 */}
              <div className="bg-white dark:bg-slate-950/70 p-6.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-500 rounded-xl w-fit">
                    <Activity className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">İnteraktif Diş Haritası (FDI 1-32)</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Hastaların tüm ağız yapısındaki çürük, risk, dolgu ve çekilmiş dişlerini 32 FDI standart numara dizilimiyle interaktif olarak gözlemleyin ve özel diş tedavi kartları düzenleyin.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 font-bold uppercase tracking-wider">▲ Çözüm: Detaylı Diş Muayene Şeması</div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-950/70 p-6.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 rounded-xl w-fit">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Yapay Zeka Röntgen Analizi</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Yüklenen veya simüle edilen röntgen dosyalarından plak index analizi yapın, risk oranlarını ve cavity formasyonlarını listelemekle kalmayıp hekimler için koruyucu tedavi reçeteleri derleyin.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 font-bold uppercase tracking-wider">▲ Teşhis Gücü: Panoramik Yapay Zeka</div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-950/70 p-6.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-teal-50 dark:bg-teal-950/50 text-teal-500 rounded-xl w-fit">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Hekim AI Teşhis Asistanı Botu</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Hekim panelinde yer alan gerçek zamanlı sohbet botu sayesinde karmaşık semptomlar, dolgu ve restorasyon prosedürleri ile ilaç reçeteleri hakkında anında klinik danışmanlık alın.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 font-bold uppercase tracking-wider">▲ Akıllı Altyapı: Gemini AI LLM</div>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-slate-950/70 p-6.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 rounded-xl w-fit">
                    <Clock className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Diş Fırçalama Uyumu & Zamanlayıcı</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Hastaların ağız içi her sektörü 15 saniyede bir eşit derece fırçalamasını sağlayan, bitişinde hijyen ve başarı puanı hesaplayan ve bunları grafiksel olarak sergileyen zamanlayıcı panel.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 font-bold uppercase tracking-wider">▲ Alışkanlık: Akıllı Sektör Zamanlayıcısı</div>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-slate-950/70 p-6.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-500 rounded-xl w-fit">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Akıllı Randevu Trafiği ve Ön Büro</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Sekreterlik ara birimimiz ile hastalarınıza saniyeler içinde yeni diş hekimliği seansları planlayın, doktor doluluk oranlarını gerçek zamanlı organize ederek poliklinik trafiğinizi koordine edin.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 font-bold uppercase tracking-wider">▲ Planlama: Sekretarya Kontrol Odası</div>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-slate-950/70 p-6.5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-xl w-fit">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A2E40] dark:text-white">Kayıt Güvenliği ve Geçici Şifre</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Klinik adminleri tarafından sisteme davet edilen hekim ve sekreterler için güvenli geçici şifre ataması kurgulayın. İlk girişte şifre değiştirme zorunluluğu ile veri sınırlarını güvenceye alın.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-4 font-bold uppercase tracking-wider">▲ Güvenlik: Role-Based Access Sınırlama</div>
              </div>

            </div>
          </div>
        </section>

        {/* INTERACTIVE FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-20 px-4">
          <div className="max-w-4xl mx-auto space-y-10">

            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1A2E40] dark:text-white">Sıkça Sorulan Sorular</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">DişAsistanım platformunun kurumsal özellikleri, kullanımı ve limitasyonları.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, fIdx) => {
                const isExpanded = expandedFaq === fIdx;
                return (
                  <div
                    key={fIdx}
                    className="bg-white dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-850 rounded-xl overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : fIdx)}
                      className="w-full text-left px-6 py-4.5 flex items-center justify-between text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/80 cursor-pointer"
                    >
                      <span className="text-xs sm:text-sm font-bold tracking-wide pr-4">{faq.q}</span>
                      <span className="text-blue-500 font-extrabold">
                        {isExpanded ? '−' : '+'}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="border-t border-slate-100 dark:border-slate-800/80"
                        >
                          <p className="p-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-[#FBFCFD] dark:bg-slate-950/40">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* CALL TO ACTION ACCENT BLOCK */}
        <section className="py-16 px-4 bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 text-white relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.06] pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-6 relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ağzınızın Sağlık Ritmini Dijitalleştirin
            </h2>
            <p className="text-blue-100 text-sm max-w-xl mx-auto leading-relaxed">
              Dents AI ve DişAsistanım yazılım paketlerini hemen ücretsiz deneyimleyin. Demo hesap presets ile tek adımda yetkileri gözlemleyin.
            </p>
            <div className="pt-2">
              <button
                onClick={onEnterLogin}
                className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-102 px-10 py-4 rounded-full text-xs font-bold shadow-xl transition-all cursor-pointer flex items-center gap-2 mx-auto"
              >
                <span>Hemen Giriş Paneline Git</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-100 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-850/80 px-4 text-center text-xs text-slate-400 select-none">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-4.5 w-4.5 text-blue-500" />
            <span className="font-extrabold tracking-wide text-slate-700 dark:text-slate-300">Dents AI & DişAsistanım OS</span>
          </div>
          <p className="max-w-xl mx-auto leading-relaxed text-[11px]">
            DişAsistanım, diş hekimliği standartlarını yükseltmeyi ve hastaları koruyucu sağlığı aktif kılmayı amaçlayan bir geliştirici projesidir. Sistemdeki tüm bilgiler demo amaçlı yerel simülatör verileridir.
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            © 2026 Dents AI Inc. All rights reserved. Powered by Antigravity cluster port 3000.
          </p>
        </div>
      </footer>

    </div>
  );
}
