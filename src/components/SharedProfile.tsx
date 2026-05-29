import React from 'react';
import { Building2, Check } from 'lucide-react';
import Avatar from './Avatar';
import { useToast } from './ui/ToastContext';

interface SharedProfileProps {
  doctorProfile: {
    name: string;
    email: string;
    phone: string;
    diplomaNo: string;
    specialty: string;
    education: string;
    bio: string;
    avatarUrl: string;
  };
  handleProfileFieldChange: (field: string, value: string) => void;
  currentUser: any;
  clinicId?: string;
  showProfileSuccess: boolean;
  setShowProfileSuccess: (val: boolean) => void;
  appendLog: (layer: 'Presentation (UI)' | 'Business Logic (BLL)' | 'Data Access (DAL)' | 'Stored Procedure (SP)', command: string, details: string) => void;
  bgCard: string;
  textTitle: string;
  textMuted: string;
  bgInput: string;
  currentClinic: any;
  isDark: boolean;
  setDoctorProfile: React.Dispatch<React.SetStateAction<any>>;
  patientsList: any[];
  appointmentsList: any[];
  doctorTasks: any[];
}

export default function SharedProfile({
  doctorProfile,
  handleProfileFieldChange,
  currentUser,
  clinicId,
  showProfileSuccess,
  setShowProfileSuccess,
  appendLog,
  bgCard,
  textTitle,
  textMuted,
  bgInput,
  currentClinic,
  isDark,
  setDoctorProfile,
  patientsList,
  appointmentsList,
  doctorTasks
}: SharedProfileProps) {
  const toast = useToast();
  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-left">

      {/* Profil Hero Kartı */}
      <div className={`${bgCard} border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative shrink-0">
            <Avatar
              url={doctorProfile.avatarUrl}
              name={doctorProfile.name}
              className="h-20 w-20 rounded-2xl border-4 border-indigo-500 shadow-md"
              iconClassName="h-10 w-10"
            />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
              <span className="h-2 w-2 rounded-full bg-emerald-100 animate-ping"></span>
            </span>
          </div>

          <div className="space-y-1">
            <h3 className={`text-lg font-black tracking-tight ${textTitle}`}>{doctorProfile.name}</h3>
            <p className="text-xs text-indigo-400 font-bold font-mono uppercase">{doctorProfile.specialty}</p>
            <p className="text-[11px] text-slate-500 font-mono font-bold">Lisans: {doctorProfile.diplomaNo} • {doctorProfile.education}</p>
          </div>
        </div>

        {/* Hekim Hızlı Özet İstatistikler */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className={`px-4 py-2.5 rounded-xl border ${isDark ? 'bg-indigo-500/5 border-slate-700/20' : 'bg-slate-50 border-slate-200'} text-center`}>
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Kayıtlı Hastalarım</p>
            <p className={`text-lg font-black ${textTitle}`}>{patientsList.length}</p>
          </div>
          <div className={`px-4 py-2.5 rounded-xl border ${isDark ? 'bg-indigo-500/5 border-slate-700/20' : 'bg-slate-50 border-slate-200'} text-center`}>
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Randevu Sayısı</p>
            <p className={`text-lg font-black ${textTitle}`}>{appointmentsList.length}</p>
          </div>
          <div className={`px-4 py-2.5 rounded-xl border ${isDark ? 'bg-indigo-500/5 border-slate-700/20' : 'bg-slate-50 border-slate-200'} text-center`}>
            <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Klinik Görevleri</p>
            <p className={`text-lg font-black ${textTitle}`}>{doctorTasks.length}</p>
          </div>
        </div>
      </div>

      {/* İki Sütunlu Form / Klinik Detayları */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sol Alan: Profil Bilgileri Formu (7 Sütun) */}
        <div className={`${bgCard} border rounded-2xl p-6 lg:col-span-12 xl:col-span-7 space-y-5 shadow-sm`}>
          <div className="border-b border-slate-700/20 pb-3 flex items-center justify-between">
            <div>
              <h4 className={`text-xs font-black tracking-widest uppercase text-indigo-400 ${textTitle}`}>HEKİM KİMLİK & BİYOGRAFİ BİLGİLERİ</h4>
              <p className={`text-[10px] font-mono ${textMuted}`}>Sistem genelinde ve raporlarda görüntülenecek hekim bilgilerini düzenleyin</p>
            </div>
          </div>

          {showProfileSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold font-mono flex items-center justify-between">
              <span>✓ Profil bilgileri başarıyla yerel diske kaydedildi ve güncellendi!</span>
              <button onClick={() => setShowProfileSuccess(false)} className="text-emerald-400 hover:text-white cursor-pointer select-none font-bold">✕</button>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!currentUser?.id) return;
              
              try {
                const response = await fetch(`http://localhost:8000/doctors/${currentUser.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    name: doctorProfile.name,
                    email: doctorProfile.email,
                    phone_number: doctorProfile.phone || null,
                    diploma_no: doctorProfile.diplomaNo,
                    specialty: doctorProfile.specialty || '',
                    education: doctorProfile.education || '',
                    bio: doctorProfile.bio || '',
                    avatar_url: doctorProfile.avatarUrl || '',
                    clinic_id: (currentUser?.clinicId && currentUser.clinicId !== 'system') ? currentUser.clinicId : (clinicId || 'CLN-101')
                  })
                });

                if (response.ok) {
                  setShowProfileSuccess(true);
                  toast.success("Profil başarıyla güncellendi!");
                  appendLog('Presentation (UI)', 'Hekim Profil Güncellemesi', 'Hekim kimlik, diploma ve iletişim detaylarını veritabanında başarıyla güncelledi.');
                  
                  // Update currentUser in localStorage so changes are durable
                  const updatedUser = {
                    ...currentUser,
                    name: doctorProfile.name,
                    email: doctorProfile.email,
                    phoneNumber: doctorProfile.phone
                  };
                  localStorage.setItem('dis_current_user', JSON.stringify(updatedUser));
                  
                  setTimeout(() => setShowProfileSuccess(false), 5000);
                } else {
                  const errData = await response.json();
                  let errMsg = 'Profil güncellenirken bir hata oluştu.';
                  if (errData && errData.detail) {
                    if (Array.isArray(errData.detail)) {
                      errMsg = errData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                    } else {
                      errMsg = errData.detail;
                    }
                  }
                  toast.error(`Hata: ${errMsg}`);
                }
              } catch (err: any) {
                console.error('Profil güncelleme hatası:', err);
                toast.error(`Hata: ${err.message || 'Sunucuya bağlanılamadı.'}`);
              }
            }}
            className="space-y-4 text-xs font-bold leading-relaxed"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">Ad Soyad (Ünvan ile birlikte)</label>
                <input
                  type="text"
                  required
                  value={doctorProfile.name}
                  onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium transition-all ${bgInput}`}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">Hekimlik Uzmanlık Alanı</label>
                <input
                  type="text"
                  required
                  value={doctorProfile.specialty}
                  onChange={(e) => handleProfileFieldChange('specialty', e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium transition-all ${bgInput}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">E-posta Adresi</label>
                <input
                  type="email"
                  required
                  value={doctorProfile.email}
                  onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium transition-all ${bgInput}`}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">Gsm No / Telefon</label>
                <input
                  type="text"
                  required
                  value={doctorProfile.phone}
                  onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium transition-all ${bgInput}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">Diploma Tescil No</label>
                <input
                  type="text"
                  required
                  value={doctorProfile.diplomaNo}
                  onChange={(e) => handleProfileFieldChange('diplomaNo', e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium transition-all ${bgInput}`}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">Mezuniyet / Eğitim</label>
                <input
                  type="text"
                  required
                  value={doctorProfile.education}
                  onChange={(e) => handleProfileFieldChange('education', e.target.value)}
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium transition-all ${bgInput}`}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">Biyografi & Klinik Özgeçmiş</label>
              <textarea
                rows={3}
                value={doctorProfile.bio}
                onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-medium transition-all ${bgInput} resize-none`}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-slate-400 font-mono tracking-wider block mb-1">Avatar Görsel Bağlantısı (URL)</label>
              <input
                type="text"
                value={doctorProfile.avatarUrl}
                onChange={(e) => handleProfileFieldChange('avatarUrl', e.target.value)}
                className={`w-full text-xs px-3.5 py-2.5 rounded-xl outline-none font-mono font-medium transition-all ${bgInput}`}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 font-semibold">
              <button
                type="button"
                onClick={async () => {
                  if (currentUser) {
                    try {
                      const response = await fetch(`http://localhost:8000/doctors/${currentUser.id}`);
                      if (response.ok) {
                        const data = await response.json();
                        const reloaded = {
                          name: data.name || currentUser.name,
                          email: data.email || currentUser.email,
                          phone: data.phone_number || currentUser.phoneNumber || '0532 999 88 77',
                          diplomaNo: data.diploma_no || '',
                          specialty: data.specialty || '',
                          education: data.education || '',
                          bio: data.bio || '',
                          avatarUrl: data.avatar_url || ''
                        };
                        setDoctorProfile(reloaded);
                        setShowProfileSuccess(true);
                        appendLog('Presentation (UI)', 'Profil Yeniden Yüklendi', 'Hekim en son veritabanı profil durumunu başarılı bir şekilde geri getirdi.');
                        setTimeout(() => setShowProfileSuccess(false), 3000);
                      }
                    } catch (err) {
                      console.error("Yeniden yüklenirken hata:", err);
                    }
                  }
                }}
                className="text-slate-500 hover:text-rose-500 text-[10.5px] font-extrabold cursor-pointer border border-slate-700/20 hover:border-rose-500/30 px-3 py-2 rounded-xl transition-all font-sans"
              >
                Geri Yükle
              </button>

              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-xs px-4 py-2.5 rounded-xl font-black transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                Değişiklikleri Kaydet
              </button>
            </div>

          </form>
        </div>

        {/* Sağ Alan: Klinik Üyelik ve Altyapı Detayları (5 Sütun) */}
        <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">

          {/* Kayıtlı ve Yetkili Klinik Kartı */}
          <div className={`${bgCard} border rounded-2xl p-6 shadow-sm space-y-4`}>
            <div className="border-b border-slate-700/20 pb-3">
              <h4 className={`text-xs font-black tracking-widest uppercase text-indigo-400 ${textTitle}`}>YETKİLİ DENTAL KLİNİK BİLGİSİ</h4>
              <p className={`text-[10px] font-mono ${textMuted}`}>Hekiminizin sisteme entegre olduğu lisanslı kuruluş</p>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl flex items-center space-x-3.5 ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-50/20 border border-indigo-100'}`}>
                <div className="bg-indigo-500 text-slate-950 p-3 rounded-2xl text-lg font-black shrink-0">
                  🏢
                </div>
                <div>
                  <span className="text-[9px] font-mono font-black text-indigo-400 tracking-wider uppercase block">Lisanslı Kuruluş</span>
                  <h5 className={`text-sm font-black tracking-tight ${textTitle}`}>{currentClinic.name}</h5>
                  <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">ID: {currentClinic.id || 'CLN-101'}</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-[11px] leading-relaxed select-text">
                <div className="flex justify-between border-b pb-1.5 border-slate-700/10">
                  <span className="text-slate-500">Klinik Telefonu</span>
                  <span className={`font-bold ${textTitle}`}>{currentClinic.phone || '0216 444 3 444'}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-700/10">
                  <span className="text-slate-500">Lisans Paketi</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">{currentClinic.packageName || 'Enterprise'}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-700/10">
                  <span className="text-slate-500">Doktor Sınırı</span>
                  <span className={`font-bold ${textTitle}`}>{currentClinic.doctorCount || '4'} / {currentClinic.doctorLimit || '25'} Hekim</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-700/10">
                  <span className="text-slate-500">Segmental Yapay Zeka Hakkı</span>
                  <span className={`font-bold ${textTitle}`}>{currentClinic.aiScanCount || '7820'} / {currentClinic.aiScanLimit || '10000'} Analiz</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-700/10">
                  <span className="text-slate-500">Bulut Disk Depolama</span>
                  <span className={`font-bold ${textTitle}`}>{currentClinic.storageUsed || '142.8'} / {currentClinic.storageLimit || '500'} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kuruluş / Kayıt Tarihi</span>
                  <span className={`font-bold ${textTitle}`}>{currentClinic.createdDate || '2025-01-14'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
