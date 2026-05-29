import React from 'react';
import { 
  User, 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Activity, 
  Play, 
  X 
} from 'lucide-react';
import Avatar from './Avatar';

interface Patient {
  id: string;
  tcNo: string;
  name: string;
  phone: string;
  email: string;
  gender: 'Erkek' | 'Kadın';
  age: number;
  dob: string;
  bloodType: string;
  allergies: string;
  treatmentStatus: 'Tedavide' | 'Teşhis Aşamasında' | 'Tamamlandı';
  avatarUrl: string;
  recommendedTreatment?: string;
  isActive?: boolean;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'Bekliyor' | 'Tamamlandı' | 'İptal Edildi';
}

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

interface SharedDashboardProps {
  isDark: boolean;
  bgCard: string;
  textTitle: string;
  textMuted: string;
  bgInput: string;
  patientsList: Patient[];
  appointmentsList: Appointment[];
  doctorTasks: TaskItem[];
  setDoctorTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  newTaskText: string;
  setNewTaskText: (val: string) => void;
  trackerSeconds: number;
  isTrackerRunning: boolean;
  setIsTrackerRunning: (val: boolean) => void;
  formatTrackerTime: (sec: number) => string;
  setSelectedPatientId: (id: string | null) => void;
  setActiveMenu: (menu: string) => void;
  appendLog: (layer: 'Presentation (UI)' | 'Business Logic (BLL)' | 'Data Access (DAL)' | 'Stored Procedure (SP)', command: string, details: string) => void;
  activePatient: Patient | null;
}

export default function SharedDashboard({
  isDark,
  bgCard,
  textTitle,
  textMuted,
  bgInput,
  patientsList,
  appointmentsList,
  doctorTasks,
  setDoctorTasks,
  newTaskText,
  setNewTaskText,
  trackerSeconds,
  isTrackerRunning,
  setIsTrackerRunning,
  formatTrackerTime,
  setSelectedPatientId,
  setActiveMenu,
  appendLog,
  activePatient
}: SharedDashboardProps) {
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* İstatistik Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className={`${bgCard} border p-4.5 rounded-2xl flex items-center space-x-4`}>
          <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-500">
            <User className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className={`text-[10px] uppercase font-mono block ${textMuted}`}>TOPLAM KAYITLI HASTA</span>
            <p className={`text-xl font-black ${textTitle}`}>{(patientsList || []).length} Hasta</p>
          </div>
        </div>

        <div className={`${bgCard} border p-4.5 rounded-2xl flex items-center space-x-4`}>
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className={`text-[10px] uppercase font-mono block ${textMuted}`}>BEKLEYEN RANDEVULAR</span>
            <p className={`text-xl font-black ${textTitle}`}>{(appointmentsList || []).filter(a => a?.status === 'Bekliyor').length} Seans</p>
          </div>
        </div>

        <div className={`${bgCard} border p-4.5 rounded-2xl flex items-center space-x-4`}>
          <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className={`text-[10px] uppercase font-mono block ${textMuted}`}>YAPAY ZEKA ALARM SKORU</span>
            <p className={`text-xl font-black ${textTitle}`}>%91 (Ciddi Vaka)</p>
          </div>
        </div>

        <div className={`${bgCard} border p-4.5 rounded-2xl flex items-center space-x-4`}>
          <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className={`text-[10px] uppercase font-mono block ${textMuted}`}>YAKLAŞAN RANDEVU</span>
            <p className={`text-base font-black ${textTitle}`}>14:30 - {activePatient ? activePatient.name : 'Randevu Yok'}</p>
          </div>
        </div>

      </div>

      {/* Randevu Çizelgesi & Hızlı Vaka Notları */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sol: Aktif Hasta Detay Kartı */}
        <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-4 flex flex-col justify-between space-y-6`}>
          {activePatient ? (
            <>
              <div>
                <div className="flex items-center space-x-3 pb-4 border-b border-slate-700/20">
                  <Avatar
                    url={activePatient?.avatarUrl}
                    name={activePatient?.name}
                    className="h-11 w-11 rounded-xl border-2 border-indigo-400"
                    iconClassName="h-6 w-6"
                  />
                  <div>
                    <h3 className={`text-sm font-black ${textTitle}`}>{activePatient?.name}</h3>
                    <p className="text-[10px] text-cyan-500 font-bold font-mono uppercase tracking-wider">{activePatient?.id}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className={textMuted}>T.C. Kimlik No:</span>
                    <span className={`font-mono ${textTitle}`}>{activePatient?.tcNo || 'Belirtilmedi'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textMuted}>Telefon:</span>
                    <span className={`font-mono ${textTitle}`}>{activePatient?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textMuted}>Yaş:</span>
                    <span className={textTitle}>{activePatient?.age} Yaşında</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textMuted}>Cinsiyet:</span>
                    <span className={textTitle}>{activePatient?.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textMuted}>Kan Grubu:</span>
                    <span className="text-rose-500 font-extrabold">{activePatient?.bloodType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textMuted}>Kayıt E-posta:</span>
                    <span className={`font-mono ${textTitle}`}>{activePatient?.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/20">
                <span className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest block mb-1">KLİNİK UYARI VE ALERJİ:</span>
                <p className="text-xs text-[#a5b4fc] font-extrabold">{activePatient?.allergies || 'Bulgu Yok'}</p>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="h-12 w-12 bg-indigo-500/10 text-indigo-400 flex items-center justify-center rounded-2xl animate-pulse">
                <User className="h-6 w-6" />
              </div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${textTitle}`}>Aktif Hasta Seçilmedi</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Şu anda aktif tedavi seansında bir hasta bulunmamaktadır.
              </p>
            </div>
          )}
        </div>

        {/* Sağ: Hekim Günlük Çalışma Masası & Klinik Ajanda */}
        <div className={`${bgCard} border rounded-2xl p-6 lg:col-span-8 flex flex-col space-y-6 shadow-sm`}>

          <div className="flex items-center justify-between border-b border-slate-700/20 pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="bg-indigo-500/10 p-2 text-indigo-400 rounded-lg">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>HEKİM GÜNLÜK ÇALIŞMA MASASI</h4>
                <p className={`text-[10px] font-mono ${textMuted}`}>Bugünkü muayene kuyruğu ve hekim pratik görev takip paneli</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Muayene Kuyruğu */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-mono font-black text-indigo-400 uppercase tracking-widest block font-sans">BUGÜNKÜ MUAYENE SEANSLARI</span>
                <span className="text-[9.5px] font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">
                  {(appointmentsList || []).filter(a => a?.status === 'Bekliyor').length} Randevu Bekliyor
                </span>
              </div>

              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {(appointmentsList || []).length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs italic">
                    Bugün için kayıtlı muayene seansı bulunmuyor.
                  </div>
                ) : (
                  (appointmentsList || []).map((app) => {
                    const isCurrentlyActive = activePatient && activePatient.id === app.patientId;

                    return (
                      <div
                        key={app.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${isCurrentlyActive
                          ? 'bg-indigo-500/5 border-indigo-500/30'
                          : isDark
                            ? 'bg-[#060a12]'
                            : 'bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[11px] font-mono font-black text-slate-500 bg-slate-500/10 px-1.5 py-0.5 rounded">
                            {app.time || '10:00'}
                          </span>
                          <div>
                            <h5 className={`text-xs font-black ${textTitle}`}>{app.patientName}</h5>
                            <p className="text-[9px] text-slate-500 font-mono">{app.patientId} • {app.type}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {isCurrentlyActive ? (
                            <span className="text-[9.5px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-ping"></span>
                              Seans Aktif
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPatientId(app.patientId);
                                setActiveMenu('Tedavi & Teşhis Masası');
                                appendLog('Presentation (UI)', 'Klinik Masa Seansı Başlatıldı', `${app.patientName} tedavi koltuğuna alındı ve alt sekmeler aktive edildi.`);
                              }}
                              className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Play className="h-2.5 w-2.5 fill-current" />
                              Tedaviye Al
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Hekim Hatırlatıcı Notları */}
            <div className="space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-mono font-black text-indigo-400 uppercase tracking-widest block font-sans">HEKİM KLİNİK GÖREV AJANDASI</span>
                  <span className="text-[9.5px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-mono">
                    {doctorTasks.filter(t => !t.completed).length} Aktif Görev
                  </span>
                </div>

                {/* Görev Ekleme Formu */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTaskText.trim()) return;
                    const newTask = {
                      id: Math.random().toString(),
                      text: newTaskText.trim(),
                      completed: false
                    };
                    setDoctorTasks([...doctorTasks, newTask]);
                    setNewTaskText('');
                    appendLog('Presentation (UI)', 'Hekim Ajanda Notu Eklendi', `Yeni pratik hatırlatıcı oluşturuldu: "${newTask.text}"`);
                  }}
                  className="flex gap-1.5"
                >
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Yeni hatırlatıcı ekleyin..."
                    className={`flex-1 text-[11px] px-3 py-2 rounded-xl outline-none font-medium transition-all ${bgInput}`}
                  />
                  <button
                    type="submit"
                    className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 px-3 py-2 rounded-xl font-black text-xs transition-colors cursor-pointer"
                  >
                    Ekle
                  </button>
                </form>

                {/* Görev Listesi */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {doctorTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs italic">
                      Hekim ajandası boş. Yeni görev ekleyebilirsiniz!
                    </div>
                  ) : (
                    doctorTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start justify-between p-2.5 rounded-xl border text-[11px] ${task.completed
                          ? 'bg-slate-500/5 border-slate-700/5 opacity-60 text-slate-500'
                          : isDark
                            ? 'bg-[#060a12]/80 border-slate-800'
                            : 'bg-white border-slate-200'
                          }`}
                      >
                        <div className="flex items-start space-x-2 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => {
                              setDoctorTasks(doctorTasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                              appendLog('Presentation (UI)', 'Hekim Ajanda Notu Durumu Güncellendi', `'${task.text}' görevi ${!task.completed ? 'tamamlandı' : 'tamamlanmadı'} olarak işaretlendi.`);
                            }}
                            className="mt-0.5 rounded cursor-pointer accent-indigo-500 w-3.5 h-3.5 shrink-0"
                          />
                          <span className={`font-medium break-all leading-snug ${task.completed ? 'line-through text-slate-500' : textTitle}`}>
                            {task.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDoctorTasks(doctorTasks.filter(t => t.id !== task.id));
                            appendLog('Presentation (UI)', 'Hekim Ajanda Notu Sildi', `Hatırlatıcı kaldırıldı: "${task.text}"`);
                          }}
                          className="text-slate-500 hover:text-rose-500 transition-colors p-0.5 cursor-pointer ml-1 animate-fadeIn"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
