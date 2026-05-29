import React, { useState, useEffect } from 'react';
import SharedDashboard from './SharedDashboard';
import SharedProfile from './SharedProfile';
import Avatar from './Avatar';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Trash2,
  Milestone,
  Shield,
  Calendar,
  Sparkles,
  User,
  Camera,
  Check,
  Plus,
  Lock,
  Search,
  Bell,
  MessageSquare,
  Send,
  UserPlus,
  Image as ImageIcon,
  ClipboardList,
  DollarSign,
  HelpCircle,
  Settings,
  Download,
  Power,
  Play,
  Pause,
  RotateCcw,
  Sparkle,
  Phone,
  Mail,
  UserCheck,
  AlertTriangle,
  FileSpreadsheet,
  Moon,
  Sun,
  ChevronDown,
  X,
  Copy,
  Terminal,
  Clock,
  BriefcaseMedical,
  Inbox,
  UserRoundCheck,
  Menu
} from 'lucide-react';
import { ToothDetails, ToothStatus, TreatmentType } from '../types';
import { useToast } from './ui/ToastContext';

interface DoctorPortalProps {
  onExit: () => void;
  patientName: string;
  updatePatientTeeth: (teethData: ToothDetails[]) => void;
  patientTeeth: ToothDetails[];
  clinicId?: string;
  clinics?: any[];
  mockUsers?: any[];
  onCreateUser?: (name: string, email: string, role: 'doctor' | 'secretary' | 'patient', phone?: string, customPassword?: string) => void;
  onDeleteUser?: (id: string) => void;
  theme?: 'light' | 'dark';
  setTheme?: (theme: 'light' | 'dark') => void;
  currentUser?: any;
  hideSidebar?: boolean;
  forcedActiveMenu?: string;
}

// ----------------------------------------------------------------------
// DATA MODELLERİ (TR)
// ----------------------------------------------------------------------
interface Patient {
  id: string; // TC Kimlik No rolünde benzersiz kimlik
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
  tempPassword?: string;
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

interface PostOpNotification {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  message: string;
  date: string;
  sentBy: string;
  status: 'Gönderildi' | 'Okundu';
}

interface NTierLog {
  id: string;
  time: string;
  layer: 'Presentation (UI)' | 'Business Logic (BLL)' | 'Data Access (DAL)' | 'Stored Procedure (SP)';
  command: string;
  details: string;
}

// Varsayılan Mock Veriler (DAL'ın boş olduğu durumlarda kullanılacak)
const DEFAULT_PATIENTS: Patient[] = [];

const DEFAULT_APPOINTMENTS: Appointment[] = [];

const DEFAULT_NOTIFICATIONS: PostOpNotification[] = [];

// Dişlerin FDI koordinatları
const SHAPE_TEETH_COORDS = [
  // Upper Right (UR 18-11)
  { id: 18, x: 60, y: 155, zone: 'upper-right' as const, name: 'Üst Sağ 3. Büyük Azı (Yirmilik)' },
  { id: 17, x: 65, y: 125, zone: 'upper-right' as const, name: 'Üst Sağ 2. Büyük Azı' },
  { id: 16, x: 75, y: 98, zone: 'upper-right' as const, name: 'Üst Sağ 1. Büyük Azı' },
  { id: 15, x: 90, y: 75, zone: 'upper-right' as const, name: 'Üst Sağ 2. Küçük Azı' },
  { id: 14, x: 110, y: 56, zone: 'upper-right' as const, name: 'Üst Sağ 1. Küçük Azı' },
  { id: 13, x: 132, y: 44, zone: 'upper-right' as const, name: 'Üst Sağ Köpek Dişi' },
  { id: 12, x: 156, y: 38, zone: 'upper-right' as const, name: 'Üst Sağ Yan Kesici' },
  { id: 11, x: 180, y: 36, zone: 'upper-right' as const, name: 'Üst Sağ Orta Kesici' },

  // Upper Left (UL 21-28)
  { id: 21, x: 206, y: 36, zone: 'upper-left' as const, name: 'Üst Sol Orta Kesici' },
  { id: 22, x: 230, y: 38, zone: 'upper-left' as const, name: 'Üst Sol Yan Kesici' },
  { id: 23, x: 254, y: 44, zone: 'upper-left' as const, name: 'Üst Sol Köpek Dişi' },
  { id: 24, x: 276, y: 56, zone: 'upper-left' as const, name: 'Üst Sol 1. Küçük Azı' },
  { id: 25, x: 296, y: 75, zone: 'upper-left' as const, name: 'Üst Sol 2. Küçük Azı' },
  { id: 26, x: 311, y: 98, zone: 'upper-left' as const, name: 'Üst Sol 1. Büyük Azı' },
  { id: 27, x: 321, y: 125, zone: 'upper-left' as const, name: 'Üst Sol 2. Büyük Azı' },
  { id: 28, x: 326, y: 155, zone: 'upper-left' as const, name: 'Üst Sol 3. Büyük Azı (Yirmilik)' },

  // Lower Left (LL 31-38)
  { id: 38, x: 326, y: 225, zone: 'lower-left' as const, name: 'Alt Sol 3. Büyük Azı (Yirmilik)' },
  { id: 37, x: 321, y: 255, zone: 'lower-left' as const, name: 'Alt Sol 2. Büyük Azı' },
  { id: 36, x: 311, y: 282, zone: 'lower-left' as const, name: 'Alt Sol 1. Büyük Azı' },
  { id: 35, x: 296, y: 305, zone: 'lower-left' as const, name: 'Alt Sol 2. Küçük Azı' },
  { id: 34, x: 276, y: 324, zone: 'lower-left' as const, name: 'Alt Sol 1. Küçük Azı' },
  { id: 33, x: 254, y: 336, zone: 'lower-left' as const, name: 'Alt Sol Köpek Dişi' },
  { id: 32, x: 230, y: 342, zone: 'lower-left' as const, name: 'Alt Sol Yan Kesici' },
  { id: 31, x: 206, y: 344, zone: 'lower-left' as const, name: 'Alt Sol Orta Kesici' },

  // Lower Right (LR 41-48)
  { id: 41, x: 180, y: 344, zone: 'lower-right' as const, name: 'Alt Sağ Orta Kesici' },
  { id: 42, x: 156, y: 342, zone: 'lower-right' as const, name: 'Alt Sağ Yan Kesici' },
  { id: 43, x: 132, y: 336, zone: 'lower-right' as const, name: 'Alt Sağ Köpek Dişi' },
  { id: 44, x: 110, y: 324, zone: 'lower-right' as const, name: 'Alt Sağ 1. Küçük Azı' },
  { id: 45, x: 90, y: 305, zone: 'lower-right' as const, name: 'Alt Sağ 2. Küçük Azı' },
  { id: 46, x: 75, y: 282, zone: 'lower-right' as const, name: 'Alt Sağ 1. Büyük Azı' },
  { id: 47, x: 65, y: 255, zone: 'lower-right' as const, name: 'Alt Sağ 2. Büyük Azı' },
  { id: 48, x: 60, y: 225, zone: 'lower-right' as const, name: 'Alt Sağ 3. Büyük Azı (Yirmilik)' },
];

export default function DoctorPortal({
  onExit,
  patientName,
  updatePatientTeeth,
  patientTeeth,
  clinicId,
  clinics,
  mockUsers = [],
  onCreateUser,
  onDeleteUser,
  theme = 'dark',
  setTheme,
  currentUser,
  hideSidebar = false,
  forcedActiveMenu
}: DoctorPortalProps) {

  const isDark = theme === 'dark';
  const toast = useToast();

  // State'ler
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeMenu, setActiveMenu] = useState<string>(forcedActiveMenu || 'Genel Bakış');

  useEffect(() => {
    if (forcedActiveMenu) {
      setActiveMenu(forcedActiveMenu);
    }
  }, [forcedActiveMenu]);
  const [patientsList, setPatientsList] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('dentsai_patients_v2');
    return saved ? JSON.parse(saved) : DEFAULT_PATIENTS;
  });

  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('dentsai_appointments_v2');
    return saved ? JSON.parse(saved) : DEFAULT_APPOINTMENTS;
  });

  const [notificationsList, setNotificationsList] = useState<PostOpNotification[]>(() => {
    const saved = localStorage.getItem('dentsai_notifications_v2');
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  const [doctorTasks, setDoctorTasks] = useState<{ id: string; text: string; completed: boolean }[]>(() => {
    const saved = localStorage.getItem('dentsai_doctor_tasks_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('dentsai_doctor_tasks_v2', JSON.stringify(doctorTasks));
  }, [doctorTasks]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:8000/appointments/');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const mapped: Appointment[] = data.map((app: any) => {
            const patientObj = patientsList.find(p => p.id === app.patient_id);
            const patientName = patientObj ? patientObj.name : 'Kayıtlı Hasta';
            const docObj = mockUsers.find(u => u.id === app.doctor_id);
            const doctorName = docObj ? docObj.name : (doctorProfile.name || 'Hekim');
            return {
              id: app.id,
              patientId: app.patient_id,
              patientName: patientName,
              doctorName: doctorName,
              date: app.appointment_date,
              time: app.appointment_time ? app.appointment_time.substring(0, 5) : '',
              type: app.appointment_type,
              status: app.status || 'Bekliyor'
            };
          });
          setAppointmentsList(mapped);
          localStorage.setItem('dentsai_appointments_v2', JSON.stringify(mapped));
        }
      }
    } catch (err) {
      console.error("Randevular veritabanından yüklenirken hata oluştu:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [patientsList, mockUsers]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        let url = 'http://localhost:8000/patients/';
        const params = new URLSearchParams();
        if (currentUser?.clinicId && currentUser.clinicId !== 'system') {
          params.append('clinic_id', currentUser.clinicId);
        } else if (clinicId && clinicId !== 'system') {
          params.append('clinic_id', clinicId);
        }
        if (currentUser?.role === 'doctor') {
          params.append('doctor_id', currentUser.id);
        }
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const mappedPatients: Patient[] = data.map((p: any) => ({
              id: p.user_id || p.id || '',
              tcNo: p.tc_no || '',
              name: p.name || '',
              phone: p.phone_number || p.phone || '',
              email: p.email || '',
              gender: p.gender || 'Kadın',
              age: p.age || (p.dob ? (new Date().getFullYear() - new Date(p.dob).getFullYear()) : 25),
              dob: p.dob || '',
              bloodType: p.blood_type || '',
              allergies: p.allergies || '',
              treatmentStatus: p.treatment_status || 'Teşhis Aşamasında',
              avatarUrl: p.avatar_url || '',
              recommendedTreatment: p.recommended_treatment || '',
              isActive: true
            }));
            setPatientsList(mappedPatients);
            localStorage.setItem('dentsai_patients_v2', JSON.stringify(mappedPatients));
          } else {
            setPatientsList([]);
            localStorage.setItem('dentsai_patients_v2', JSON.stringify([]));
          }
        }
      } catch (err) {
        console.error("Kayıtlı hastalar veritabanından yüklenirken hata oluştu:", err);
      }
    };
    fetchPatients();
  }, [currentUser, clinicId]);

  const [doctorProfile, setDoctorProfile] = useState(() => {
    const saved = localStorage.getItem('dentsai_doctor_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: currentUser?.name || 'Dr. Samantha Lee',
      email: currentUser?.email || 'samantha@dentsai.com',
      phone: currentUser?.phoneNumber || '0532 999 88 77',
      diplomaNo: 'D-2015-88392',
      specialty: 'Ağız, Diş ve Çene Cerrahisi Uzmanı',
      education: 'Hacettepe Üniversitesi Diş Hekimliği Fakültesi (2012)',
      bio: '10+ yıllık mesleki tecrübesi ile modern dental cerrahi, implantoloji ve estetik diş hekimliği konularında uzmanlaşmıştır. Güncel dijital diş hekimliği teknolojilerini ve AI destekli klinik taramaları aktif olarak kullanmaktadır.',
      avatarUrl: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('dentsai_doctor_profile', JSON.stringify(doctorProfile));
  }, [doctorProfile]);

  useEffect(() => {
    if (!currentUser?.id) return;
    if (currentUser.role === 'doctor' || currentUser.role === 'clinic_admin') {
      const fetchDoctorProfile = async () => {
        try {
          const response = await fetch(`http://localhost:8000/doctors/${currentUser.id}`);
          if (response.ok) {
            const data = await response.json();
            setDoctorProfile({
              name: data.name || currentUser.name,
              email: data.email || currentUser.email,
              phone: data.phone_number || currentUser.phoneNumber || '',
              diplomaNo: data.diploma_no || '',
              specialty: data.specialty || '',
              education: data.education || '',
              bio: data.bio || '',
              avatarUrl: data.avatar_url || ''
            });
          }
        } catch (err) {
          console.error("Doktor profili çekilirken hata:", err);
        }
      };
      fetchDoctorProfile();
    }
  }, [currentUser]);

  useEffect(() => {
    if (doctorProfile.name) {
      setAppointmentsList(prev => 
        prev.map(app => app.doctorName === 'Dr. Samantha Lee' ? { ...app, doctorName: doctorProfile.name } : app)
      );
      setNotificationsList(prev =>
        prev.map(notif => notif.sentBy === 'Dr. Samantha Lee' ? { ...notif, sentBy: doctorProfile.name } : notif)
      );
    }
  }, [doctorProfile.name]);

  const [showProfileSuccess, setShowProfileSuccess] = useState(false);

  const handleProfileFieldChange = (field: string, value: string) => {
    setDoctorProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(() => {
    const saved = localStorage.getItem('dentsai_patients_v2');
    const pList = saved ? JSON.parse(saved) : DEFAULT_PATIENTS;
    return pList[0]?.id || null;
  });

  const [activeWorkspaceSubTab, setActiveWorkspaceSubTab] = useState<string>('Ağız Teşhis Haritası');
  const [inspectedPatient, setInspectedPatient] = useState<Patient | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');

  const activePatient = patientsList.find(p => p.id === selectedPatientId) || patientsList[0] || null;

  // Treatment Timeline state & handlers (Hekim Tarafından Yönetilen Yol Haritası)
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newStageDate, setNewStageDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStageStatus, setNewStageStatus] = useState<'done' | 'active' | 'upcoming'>('upcoming');
  const [newStageNotes, setNewStageNotes] = useState('');

  const handleAddStageToTimeline = () => {
    if (!activePatient) {
      toast.error("Lütfen önce bir hasta seçiniz.");
      return;
    }
    if (!newStageTitle.trim() || !newStageNotes.trim()) {
      toast.error("Lütfen aşama başlığı ve klinik açıklamayı doldurunuz.");
      return;
    }

    const todayDateStr = newStageDate || new Date().toISOString().split('T')[0];

    const newStage = {
      id: 'step_' + Date.now(),
      title: newStageTitle,
      date: todayDateStr,
      status: newStageStatus,
      notes: newStageNotes
    };

    const currentTimeline = activePatient.treatmentTimeline || [
      { id: 't-1', title: 'İlk Muayene ve Röntgen', date: '2026-05-10', status: 'done', notes: 'Genel ağız muayenesi ve panoramik röntgen çekimi tamamlandı.' },
      { id: 't-2', title: 'Derin Diş Taşı Temizliği', date: '2026-05-15', status: 'done', notes: 'Alt ve üst çene tartar temizliği ile hassasiyet kontrolü yapıldı.' },
      { id: 't-3', title: '26 Nolu Diş Kanal Tedavisi', date: '2026-05-25', status: 'active', notes: 'Hekim Samantha Lee tarafından kanal dolgusu ve geçici kapatma yapıldı.' },
      { id: 't-4', title: 'Kuron (Kaplama) Restorasyonu', date: '2026-05-30', status: 'upcoming', notes: 'Kalıcı estetik zirkonyum kaplama ölçüsü alınacak.' }
    ];

    const updatedTimeline = [...currentTimeline, newStage];

    const updated = patientsList.map(p => {
      if (p.id === activePatient.id) {
        return {
          ...p,
          treatmentTimeline: updatedTimeline
        };
      }
      return p;
    });

    setPatientsList(updated);
    localStorage.setItem('dentsai_patients_v2', JSON.stringify(updated));
    appendLog('Data Access (DAL)', 'sp_InsertTimelineStage [SUCCESS]', `Hasta ID: ${activePatient.id} için yeni tedavi aşaması eklendi.`);
    toast.success(`'${newStageTitle}' aşaması, '${activePatient.name}' adlı hastanın tedavi yol haritasına başarıyla eklendi!`);

    setNewStageTitle('');
    setNewStageNotes('');
    setNewStageStatus('upcoming');
  };

  const handleDeleteStageFromTimeline = (id: string) => {
    if (!activePatient) {
      toast.error("Lütfen önce bir hasta seçiniz.");
      return;
    }
    const currentTimeline = activePatient.treatmentTimeline || [
      { id: 't-1', title: 'İlk Muayene ve Röntgen', date: '2026-05-10', status: 'done', notes: 'Genel ağız muayenesi ve panoramik röntgen çekimi tamamlandı.' },
      { id: 't-2', title: 'Derin Diş Taşı Temizliği', date: '2026-05-15', status: 'done', notes: 'Alt ve üst çene tartar temizliği ile hassasiyet kontrolü yapıldı.' },
      { id: 't-3', title: '26 Nolu Diş Kanal Tedavisi', date: '2026-05-25', status: 'active', notes: 'Hekim Samantha Lee tarafından kanal dolgusu ve geçici kapatma yapıldı.' },
      { id: 't-4', title: 'Kuron (Kaplama) Restorasyonu', date: '2026-05-30', status: 'upcoming', notes: 'Kalıcı estetik zirkonyum kaplama ölçüsü alınacak.' }
    ];

    const updatedTimeline = currentTimeline.filter((t: any) => t.id !== id);

    const updated = patientsList.map(p => {
      if (p.id === activePatient.id) {
        return {
          ...p,
          treatmentTimeline: updatedTimeline
        };
      }
      return p;
    });

    setPatientsList(updated);
    localStorage.setItem('dentsai_patients_v2', JSON.stringify(updated));
    appendLog('Data Access (DAL)', 'sp_DeleteTimelineStage [SUCCESS]', `Hasta ID: ${activePatient.id} için tedavi aşaması silindi.`);
    toast.success("Tedavi aşaması yol haritasından başarıyla kaldırıldı!");
  };

  // BLL: Hasta Hesabı Aktifleştirme İşlemi
  const BLL_ActivatePatientAccount = (pId: string) => {
    appendLog('Business Logic (BLL)', 'BL_ActivatePatientAccount()', `Hasta hesap aktivasyonu doğrulanıyor. ID: ${pId}`);
    const updated = patientsList.map(p => {
      if (p.id === pId) {
        return { ...p, isActive: true };
      }
      return p;
    });
    setPatientsList(updated);
    localStorage.setItem('dentsai_patients_v2', JSON.stringify(updated));
    appendLog('Data Access (DAL)', 'sp_ActivatePatientAccount [SUCCESS]', `Hasta ID: ${pId} hesabı başarıyla aktif olarak işaretlendi.`);
  };

  const [nTierLogs, setNTierLogs] = useState<NTierLog[]>([
    {
      id: 'L-1',
      time: new Date().toLocaleTimeString('tr-TR'),
      layer: 'Presentation (UI)',
      command: 'DoctorPortal Yüklendi',
      details: 'Doktor yönetim konsolunun bileşen ağacı ve durum yöneticisi aktif edildi.'
    },
    {
      id: 'L-2',
      time: new Date().toLocaleTimeString('tr-TR'),
      layer: 'Business Logic (BLL)',
      command: 'BL_InitializeDashboard()',
      details: 'Heuristic klinik istatistikleri ve entegre hasta profilleri doğrulandı.'
    },
    {
      id: 'L-3',
      time: new Date().toLocaleTimeString('tr-TR'),
      layer: 'Data Access (DAL)',
      command: 'execute_sp_GetPatients()',
      details: 'Yerel ve bulut veritabanı kütüphanelerinden hasta kayıtları SP üzerinden getirildi.'
    }
  ]);

  // Yeni Log Ekleme Yardımcısı (N-Tier Log Console)
  const appendLog = (layer: NTierLog['layer'], command: string, details: string) => {
    const newLog: NTierLog = {
      id: `L-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      time: new Date().toLocaleTimeString('tr-TR'),
      layer,
      command,
      details
    };
    setNTierLogs(prev => [newLog, ...prev].slice(0, 100)); // En son 100 kaydı tut
  };

  // ----------------------------------------------------------------------
  // N-KATMANLI MİMARİ DATA ACCESS LAYER (DAL) / STORED PROCEDURES
  // ----------------------------------------------------------------------
  const DAL_execute_sp_InsertPatient = (patient: Patient) => {
    appendLog('Data Access (DAL)', 'CALL sp_InsertPatient', `Parametreler: tc_no='${patient.tcNo}', ad_soyad='${patient.name}', e_posta='${patient.email}', tel='${patient.phone}'`);
    const updated = [...patientsList, patient];
    setPatientsList(updated);
    localStorage.setItem('dentsai_patients_v2', JSON.stringify(updated));
    appendLog('Data Access (DAL)', 'sp_InsertPatient [SUCCESS]', `Veritabanında 1 satır değiştirildi. Atanan Benzersiz ID: ${patient.id}`);
    return true;
  };

  const DAL_execute_sp_InsertAppointment = (app: Appointment) => {
    appendLog('Data Access (DAL)', 'CALL sp_InsertAppointment', `Parametreler: patient_id='${app.patientId}', date='${app.date}', time='${app.time}', t_type='${app.type}'`);
    const updated = [...appointmentsList, app];
    setAppointmentsList(updated);
    localStorage.setItem('dentsai_appointments_v2', JSON.stringify(updated));
    appendLog('Data Access (DAL)', 'sp_InsertAppointment [SUCCESS]', `Yeni randevu kaydı başarıyla DAL seviyesinde kaydedildi.`);
    return true;
  };

  const DAL_execute_sp_InsertNotification = (notif: PostOpNotification) => {
    appendLog('Data Access (DAL)', 'CALL sp_InsertNotification', `Parametreler: p_id='${notif.patientId}', title='${notif.title}', msg_len=${notif.message.length}`);
    const updated = [...notificationsList, notif];
    setNotificationsList(updated);
    localStorage.setItem('dentsai_notifications_v2', JSON.stringify(updated));
    appendLog('Data Access (DAL)', 'sp_InsertNotification [SUCCESS]', `Post-Op bildirim kaydı Stored Procedure ile veri tabanına eklendi.`);
    return true;
  };

  // ----------------------------------------------------------------------
  // N-KATMANLI MİMARİ BUSINESS LOGIC LAYER (BLL)
  // ----------------------------------------------------------------------
  const BLL_ValidateAndRegisterPatient = (fields: {
    tcNo: string;
    name: string;
    phone: string;
    email: string;
    dob: string;
    gender: 'Erkek' | 'Kadın';
    bloodType: string;
    allergies: string;
    tempPass: string;
  }) => {
    appendLog('Business Logic (BLL)', 'BL_ValidateAndRegisterPatient()', `Doğrulama başladı. Hasta adı: ${fields.name}. TC: ${fields.tcNo}`);

    // İş Kuralı 1: TC Kimlik No 11 Hane Olmalıdır
    if (!/^\d{11}$/.test(fields.tcNo)) {
      appendLog('Business Logic (BLL)', 'BL_ValidateAndRegisterPatient() [FAIL]', 'İş Kuralı İhlali: TC Kimlik No tam olarak 11 adet rakamdan oluşmalıdır.');
      toast.error('Hata: TC Kimlik No tam olarak 11 haneli rakam olmalıdır!');
      return false;
    }

    // İş Kuralı 2: Aynı TC'ye sahip başka hasta olmamalıdır
    if (patientsList.some(p => p.tcNo === fields.tcNo)) {
      appendLog('Business Logic (BLL)', 'BL_ValidateAndRegisterPatient() [FAIL]', `İş Kuralı İhlali: '${fields.tcNo}' TC numarası zaten kayıtlı.`);
      toast.error('Hata: Bu TC Kimlik numarasına sahip bir hasta sistemde zaten kayıtlı!');
      return false;
    }

    // Yaş Hesaplama (İş kuralı: Tarihsel dönüşüm)
    const birthYear = new Date(fields.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;

    const newId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;

    const newPatient: Patient = {
      id: newId,
      tcNo: fields.tcNo,
      name: fields.name,
      phone: fields.phone || '0555 123 45 67',
      email: fields.email,
      gender: fields.gender,
      age: calculatedAge >= 0 ? calculatedAge : 25,
      dob: fields.dob,
      bloodType: fields.bloodType,
      allergies: fields.allergies || 'Alerji kaydı saptanmadı',
      treatmentStatus: 'Teşhis Aşamasında',
      avatarUrl: '',
      isActive: false,
      tempPassword: fields.tempPass
    };

    // UI'da veya Entegre Auth Modülünde Kullanıcı Olarak Oluştur (Parent Entegrasyon)
    if (onCreateUser) {
      onCreateUser(fields.name, fields.email, 'patient', fields.phone, fields.tempPass);
      appendLog('Business Logic (BLL)', 'Parent.onCreateUser() tetiklendi', `E-posta: ${fields.email}, Rol: patient, Geçici Şifre: ${fields.tempPass}`);
    }

    // DAL katmanını çağırarak SP üzerinden kaydet
    const dalSuccess = DAL_execute_sp_InsertPatient(newPatient);
    if (dalSuccess) {
      setSelectedPatientId(newId);
      return newPatient;
    }
    return false;
  };

  const BLL_ScheduleAppointment = (appData: {
    patientId: string;
    patientName: string;
    date: string;
    time: string;
    type: string;
  }) => {
    appendLog('Business Logic (BLL)', 'BL_ScheduleAppointment()', `Randevu iş kuralları denetleniyor. Tesis müsaitliği doğrulanıyor.`);

    // İş Kuralı: Geçmiş bir tarihe randevu verilemez
    const selectedDate = new Date(appData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      appendLog('Business Logic (BLL)', 'BL_ScheduleAppointment() [FAIL]', 'İş Kuralı İhlali: Geçmiş bir tarihe randevu ataması gerçekleştirilemez.');
      toast.error('Geçmiş tarihlere randevu planlanamaz!');
      return false;
    }

    const newApp: Appointment = {
      id: `APP-${Math.floor(200 + Math.random() * 800)}`,
      patientId: appData.patientId,
      patientName: appData.patientName,
      doctorName: doctorProfile.name || 'Dr. Samantha Lee',
      date: appData.date,
      time: appData.time,
      type: appData.type,
      status: 'Bekliyor'
    };

    return DAL_execute_sp_InsertAppointment(newApp);
  };

  const BLL_DispatchNotification = (title: string, message: string) => {
    if (!activePatient) {
      toast.error("Lütfen önce bir hasta seçiniz!");
      return false;
    }
    appendLog('Business Logic (BLL)', 'BL_DispatchNotification()', `Post-Op bildirim şablonu çözümleniyor. Hasta: ${activePatient.name}`);

    if (!title.trim() || !message.trim()) {
      appendLog('Business Logic (BLL)', 'BL_DispatchNotification() [FAIL]', 'Boş parametre gönderimi reddedildi.');
      toast.error('Lütfen başlık ve mesaj alanını doldurunuz.');
      return false;
    }

    const newNotif: PostOpNotification = {
      id: `NOT-${Math.floor(300 + Math.random() * 700)}`,
      patientId: activePatient.id,
      patientName: activePatient.name,
      title: title,
      message: message,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sentBy: doctorProfile.name,
      status: 'Gönderildi'
    };

    return DAL_execute_sp_InsertNotification(newNotif);
  };

  // ----------------------------------------------------------------------
  // DİĞER UI ETKİLEŞİM STATE VE ÖZELLİKLERİ
  // ----------------------------------------------------------------------
  const currentClinic = clinics?.find(c => c.id === clinicId) || {
    name: 'DişAsistanım Premium',
    themeColor: '#2ed0e1'
  };

  // State'ler - Hasta Ekleme Formu
  const [newPatTC, setNewPatTC] = useState('');
  const [newPatName, setNewPatName] = useState('');
  const [newPatEmail, setNewPatEmail] = useState('');
  const [newPatPhone, setNewPatPhone] = useState('');
  const [newPatGender, setNewPatGender] = useState<'Erkek' | 'Kadın'>('Kadın');
  const [newPatDob, setNewPatDob] = useState('1998-05-15');
  const [newPatBlood, setNewPatBlood] = useState('A Rh+');
  const [newPatAllergies, setNewPatAllergies] = useState('');
  const [credentialsModal, setCredentialsModal] = useState<{
    name: string;
    email: string;
    tc: string;
    pass: string;
  } | null>(null);

  // Randevu Ekleme State'leri
  const [newAppDate, setNewAppDate] = useState('2026-05-26');
  const [newAppTime, setNewAppTime] = useState('14:00');
  const [newAppType, setNewAppType] = useState('Rutin Dental Kontrol & Diş Temizliği');

  // Bildirim / Not Alanı Gönderim State'leri
  const [notifTitle, setNotifTitle] = useState('İşlem Sonrası Öneriler');
  const [notifMessage, setNotifMessage] = useState('Tedavi sonrasında uyuşukluk geçene kadar yaklaşık 2 saat yiyecek ve içecek tüketmeyiniz.');

  // Röntgen / Radyoloji simülasyonu
  const [xrays, setXrays] = useState([
    { id: 'XR-1', date: '2026-05-10', title: 'Panoramik X-Ray Sürümü 1', img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400', notes: 'Tipik kemik kaybı görülmedi, 36 nolu dişte arayüz çürüğü riski saptandı.' },
    { id: 'XR-2', date: '2025-11-12', title: 'Segmental Bite-Wing X-Ray', img: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=400', notes: 'Sol alt posterior bölgede kron restorasyon sınırları normal saptandı.' }
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Ağız Haritası - Seçili Diş
  const [selectedToothId, setSelectedToothId] = useState<number>(36);
  const [activeNotes, setActiveNotes] = useState<string>('');
  const [activeStatus, setActiveStatus] = useState<ToothStatus>('healthy');

  // İşlem Kayıtları
  const [newTreatmentType, setNewTreatmentType] = useState<TreatmentType>('dolgu');
  const [newTreatmentDesc, setNewTreatmentDesc] = useState<string>('');

  // Saniye Kronometre (Hekim Çalışma Süresi)
  const [trackerSeconds, setTrackerSeconds] = useState<number>(3724); // 01:02:04
  const [isTrackerRunning, setIsTrackerRunning] = useState<boolean>(true);

  // AI Hekim Asistanı Sohbet
  const [chatInp, setChatInp] = useState('');
  const [chatLogs, setChatLogs] = useState([
    { sender: 'user', text: "36 nolu diş (Sol Alt Azı Dişi) için yapay zeka analiz skoru nedir?", time: '12:01' },
    { sender: 'ai', text: "36 nolu dişte arayüz demineralizasyonu mevcut. AI Güven Katsayısı: %89. Dolgu veya vernik koruması tavsiye edilir.", time: '12:02' }
  ]);

  // Sync chosen patient with properties if they match name
  useEffect(() => {
    if (patientName) {
      const match = patientsList.find(p => p.name.toLowerCase() === patientName.toLowerCase());
      if (match) {
        setSelectedPatientId(match.id);
        appendLog('Presentation (UI)', 'Bileşen Props Değişimi', `Giriş Parametresi uyarınca aktif hasta '${match.name}' olarak senkronize edildi.`);
      }
    }
  }, [patientName]);

  // Sync selected tooth details
  const selectedTooth = patientTeeth.find(t => t.id === selectedToothId) || {
    id: selectedToothId,
    name: 'Diş Tanımsız',
    zone: 'upper-right' as const,
    status: 'healthy' as const,
    notes: '',
    treatments: []
  };

  useEffect(() => {
    setActiveNotes(selectedTooth.notes || '');
    setActiveStatus(selectedTooth.status);
  }, [selectedToothId]);

  // Stopwatch interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTrackerRunning) {
      interval = setInterval(() => {
        setTrackerSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTrackerRunning]);

  // Panoramic simulation interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            setIsScanning(false);
            appendLog('Business Logic (BLL)', 'BL_XRayAIScanCompleted()', 'Panoramik yapay zeka segmental taraması başarıyla sonlandırıldı.');
            return 100;
          }
          return p + 5;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);

  const formatTrackerTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Form submit handler - Hasta Kayıt
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName.trim()) {
      toast.error('Lütfen ad soyad alanını doldurunuz.');
      return;
    }
    if (!newPatEmail.trim()) {
      toast.error('Lütfen e-posta adresini giriniz.');
      return;
    }

    // Generate unique copyable temporary password
    const generatedPassword = 'DIS-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const avatarUrl = '';

    setRegisterLoading(true);

    // Format dob to YYYY-MM-DD explicitly
    let formattedDob = newPatDob || '';
    if (formattedDob) {
      const dateParts = formattedDob.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (dateParts) {
        const [_, year, month, day] = dateParts;
        formattedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        const trParts = formattedDob.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
        if (trParts) {
          const [_, day, month, year] = trParts;
          formattedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } else {
          const d = new Date(formattedDob);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayStr = String(d.getDate()).padStart(2, '0');
            formattedDob = `${y}-${m}-${dayStr}`;
          }
        }
      }
    }

    try {
      const response = await fetch('http://localhost:8000/patients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newPatEmail,
          password: generatedPassword,
          name: newPatName,
          phone_number: newPatPhone || null,
          clinic_id: (currentUser?.clinicId && currentUser.clinicId !== 'system') ? currentUser.clinicId : (clinicId || 'CLN-101'),
          tc_no: newPatTC,
          gender: newPatGender,
          dob: formattedDob,
          blood_type: newPatBlood || null,
          allergies: newPatAllergies || null,
          avatar_url: avatarUrl,
          recommended_treatment: null,
          primary_dentist_id: currentUser?.role === 'doctor' ? currentUser.id : null,
        }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error("Yanıt JSON olarak ayrıştırılamadı:", jsonErr);
      }

      if (!response.ok) {
        let errorMsg = 'Hasta kaydedilirken veritabanı veya iş kuralı hatası oluştu.';
        if (data && data.detail) {
          if (Array.isArray(data.detail)) {
            // FastAPI Pydantic validation errors (422)
            errorMsg = data.detail.map((errItem: any) => {
              const field = errItem.loc ? errItem.loc.filter((l: any) => l !== 'body').join('.') : '';
              return `${field ? '[' + field + '] ' : ''}${errItem.msg || errItem.message || JSON.stringify(errItem)}`;
            }).join('\n');
          } else if (typeof data.detail === 'string') {
            errorMsg = data.detail;
          } else if (typeof data.detail === 'object') {
            errorMsg = JSON.stringify(data.detail);
          }
        } else if (response.statusText) {
          errorMsg = `İstek hatası: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      // Sync state locally so the new patient displays in UI lists immediately
      const result = BLL_ValidateAndRegisterPatient({
        tcNo: newPatTC,
        name: newPatName,
        phone: newPatPhone,
        email: newPatEmail,
        dob: formattedDob,
        gender: newPatGender,
        bloodType: newPatBlood,
        allergies: newPatAllergies,
        tempPass: generatedPassword
      });

      if (result) {
        // Show credentials popup so user can copy temporary login data
        setCredentialsModal({
          name: result.name,
          email: result.email,
          tc: result.tcNo,
          pass: generatedPassword
        });
      }

      toast.success('Hasta kaydı başarıyla veritabanına ve sisteme kaydedildi!');

      // Clear input fields
      setNewPatTC('');
      setNewPatName('');
      setNewPatEmail('');
      setNewPatPhone('');
      setNewPatAllergies('');

    } catch (err: any) {
      console.error(err);
      toast.error(`Hata: ${err.message}`);
    } finally {
      setRegisterLoading(false);
    }
  };

  // Form submit handler - Randevu Ekleme
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      toast.error("Lütfen önce bir hasta seçiniz!");
      return;
    }

    const selectedDate = new Date(newAppDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error('Geçmiş tarihlere randevu planlanamaz!');
      return;
    }

    const newId = `APP-${Math.floor(200 + Math.random() * 800)}`;
    const doctorId = currentUser?.id || 'usr-3';

    try {
      const response = await fetch('http://localhost:8000/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: newId,
          patient_id: activePatient.id,
          doctor_id: doctorId,
          appointment_date: newAppDate,
          appointment_time: newAppTime,
          appointment_type: newAppType,
          status: 'Bekliyor'
        })
      });

      if (response.ok) {
        toast.success(`Başarılı: Sayın ${activePatient.name} için randevu planlandı!`);
        await fetchAppointments();
      } else {
        const errData = await response.json();
        toast.error(`Randevu kaydedilemedi: ${JSON.stringify(errData.detail || errData)}`);
      }
    } catch (err) {
      console.error('Randevu kaydetme hatası:', err);
      toast.error('Randevu veritabanına kaydedilirken hata oluştu.');
    }
  };

  // Dispatch Notification
  const handleSendNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      toast.error("Lütfen önce bir hasta seçiniz!");
      return;
    }
    const success = BLL_DispatchNotification(notifTitle, notifMessage);
    if (success) {
      toast.success(`Bildirim başarıyla '${activePatient.name}' adlı hastamıza iletildi!`);
      setNotifTitle('İşlem Sonrası Öneriler');
      setNotifMessage('');
    }
  };

  // XML / X-Ray simulation analysis
  const handleTriggerAnalysis = () => {
    appendLog('Presentation (UI)', 'AI Analiz Butonu', 'X-Ray segmental anomalileri tespiti için yapay zeka taraması tetiklendi.');
    setIsScanning(true);
    setScanProgress(0);
  };

  // Save Tooth Status Updates
  const handleSaveToothNotes = () => {
    appendLog('Business Logic (BLL)', 'BL_UpdateToothClinicalDetails()', `Diş #${selectedToothId} klinik not güncellemesi.`);

    const updated = patientTeeth.map(tooth => {
      if (tooth.id === selectedToothId) {
        return {
          ...tooth,
          notes: activeNotes,
          status: activeStatus
        };
      }
      return tooth;
    });

    updatePatientTeeth(updated);
    appendLog('Data Access (DAL)', 'sp_UpdateToothStatus [SUCCESS]', `Diş #${selectedToothId} durum değeri = '${activeStatus}' olarak değiştirildi.`);
    toast.success(`Diş #${selectedToothId} klinik tanısı ve notu başarıyla güncellendi!`);
  };

  // Save Operation Treatment Record (İşlem kaydı ekleme)
  const handleAddTreatmentRecord = () => {
    if (!newTreatmentDesc.trim()) {
      toast.error("Lütfen yapılacak müdahale için bir klinik açıklama girin.");
      return;
    }

    appendLog('Business Logic (BLL)', 'BL_AddToothTreatmentRecord()', `Diş #${selectedToothId} için '${newTreatmentType}' protokolü kaydı başlatılıyor.`);

    const todayDateStr = new Date().toISOString().split('T')[0];

    const updated = patientTeeth.map(tooth => {
      if (tooth.id === selectedToothId) {
        const tList = tooth.treatments || [];
        return {
          ...tooth,
          status: 'completed' as const, // Yapılınca otomatik tamamlandıya çeker
          treatments: [
            ...tList,
            {
              type: newTreatmentType,
              date: todayDateStr,
              description: newTreatmentDesc
            }
          ]
        };
      }
      return tooth;
    });

    updatePatientTeeth(updated);
    setNewTreatmentDesc('');
    appendLog('Data Access (DAL)', 'sp_AddTreatmentRecord [SUCCESS]', `Diş #${selectedToothId} işlem geçmişine yeni kayıt eklendi. Durum='completed'`);
    toast.success(`Müdahale kaydı başarıyla eklendi ve Diş #${selectedToothId} durumu 'Tamamlanmış Tedavi' olarak güncellendi.`);
  };

  // AI Chat Assistant Send
  const handleSendChatOption = () => {
    if (!chatInp.trim()) return;
    const userMsg = chatInp;
    setChatLogs(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString('tr-TR').substring(0, 5) }]);
    setChatInp('');

    appendLog('Presentation (UI)', 'AI Chat Gönderildi', `Soru: "${userMsg}"`);

    setTimeout(() => {
      let aiResponse = "Dental AI Co-Pilot: Röntgen verileri ve klinik geçmiş parametrelerini analiz ettim. Bu vaka için sterilize kanal tedavisi ve post-op dezenfeksiyon solüsyonu kullanılması optimal başarı şansı sağlayacaktır.";
      if (userMsg.toLowerCase().includes('36')) {
        aiResponse = "36 Nolu Diş Analiz Raporu: Distal yüzeyde pre-kavitasyon aşamasında (%12 demineralizasyon) sınır çürüğü mevcuttur. Estetik kompozit restorasyon yapılması uygundur. Yapay zeka tavsiye güven değeri: %93.";
      } else if (userMsg.toLowerCase().includes('tc') || userMsg.toLowerCase().includes('hasta')) {
        aiResponse = activePatient
          ? `Hastamız '${activePatient.name}' (${activePatient.age} yaş, ${activePatient.bloodType} Kan). Kronik / Alerjik Bulgusu: ${activePatient.allergies}. Radyografik profili stabil gözükmektedir.`
          : 'Sistemde kayıtlı aktif bir hasta bulunmamaktadır.';
      }
      setChatLogs(prev => [...prev, { sender: 'ai', text: aiResponse, time: new Date().toLocaleTimeString('tr-TR').substring(0, 5) }]);
      appendLog('Business Logic (BLL)', 'BL_ConsultDentalAssistant()', 'AI asistan akıllı çıkarım motoru yanıt üretti.');
    }, 850);
  };

  // Theme support stylings
  const bgMain = isDark ? 'bg-[#090d16] text-[#a5b4fc]' : 'bg-[#f8fafc] text-slate-755';
  const bgCard = isDark ? 'bg-[#0e1626] border-[#1e293b]' : 'bg-white border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] rounded-2xl transition-all duration-300 text-slate-700';
  const bgSidebar = isDark ? 'bg-[#0e1626] border-[#162032]' : 'bg-white border-slate-100/90 shadow-[4px_0_24px_rgba(15,23,42,0.02)]';
  const textTitle = isDark ? 'text-white' : 'text-slate-900 font-extrabold';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500 font-semibold';
  const borderLine = isDark ? 'border-[#1e293b]' : 'border-slate-100/80';
  const bgInput = isDark ? 'bg-[#090d16] border-[#223049] text-white focus:border-indigo-505' : 'bg-slate-50 border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300';
  const bgSelect = isDark ? 'bg-[#182335] text-white border-[#2c3d59]' : 'bg-slate-50 text-slate-900 border-slate-200 focus:ring-2 focus:ring-indigo-500/10';

  const renderTeTeMasasiHeader = () => {
    if (!activePatient) return null;
    return (
      <div className={`${bgCard} border rounded-2xl p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5 shadow-sm mb-6 animate-fadeIn`}>
        {/* Sol Kısmı - Aktif Seçili Hasta Künyesi (Active Patient Badge) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b xl:border-b-0 pb-4 xl:pb-0 border-slate-700/10 xl:border-r xl:pr-5 shrink-0">

          <div className="relative shrink-0 flex justify-center sm:justify-start">
            <Avatar
              url={activePatient.avatarUrl}
              name={activePatient.name}
              className="h-11 w-11 rounded-xl border-2 border-indigo-500 shadow-md animate-pulse"
              iconClassName="h-6 w-6"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-100 animate-ping"></span>
            </span>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className={`text-sm font-black tracking-tight ${textTitle}`}>{activePatient.name}</span>
              <span className="inline-block self-center sm:self-auto text-[9.5px] bg-[#2ed0e1]/10 text-cyan-405 text-cyan-500 border border-cyan-500/20 px-1.5 py-0.5 rounded font-mono font-bold leading-normal">
                {activePatient.id}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10.5px]">
              <span className={textMuted}>{activePatient.gender} • {activePatient.age} Yaş</span>
              <span className="text-slate-500 font-mono hidden sm:inline">|</span>
              <span className="text-rose-450 text-rose-500 font-extrabold bg-rose-500/10 px-1.5 py-0.5 rounded font-mono border border-rose-500/20">{activePatient.bloodType}</span>
              <span className="text-slate-500 font-mono hidden sm:inline">|</span>
              <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 truncate max-w-[200px]" title={activePatient.allergies}>
                ⚠️ {activePatient.allergies}
              </span>
            </div>
          </div>
        </div>

        {/* Sağ Kısım - Alt Sekme Buton Seçicileri */}
        <div className="flex-1 flex flex-wrap items-center justify-center xl:justify-end gap-1 bg-slate-950/20 xl:bg-transparent p-1 xl:p-0 rounded-xl xl:rounded-none border xl:border-0 border-slate-700/10">
          {[
            { key: 'Ağız Teşhis Haritası', label: 'Diş Haritası', icon: Sparkles },
            { key: 'Klinik İşlem Kaydı', label: 'İşlem Kaydı', icon: ClipboardList },
            { key: 'Tedavi Süreci Yol Haritası', label: 'Tedavi Yol Haritası', icon: Milestone },
            { key: 'Röntgen & X-Ray', label: 'Röntgen & X-Ray', icon: ImageIcon },
            { key: 'Hasta Bildirimi (Post-Op)', label: 'Post-Op Bildirim', icon: MessageSquare },
            { key: 'Yapay Zeka Asistanı', label: 'AI Asistanı', icon: Shield },
          ].map((tab) => {
            const SubIcon = tab.icon;
            const isSubSelected = activeWorkspaceSubTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveWorkspaceSubTab(tab.key);
                  appendLog('Presentation (UI)', `Teşhis Masası Alt Sekmesi: ${tab.key}`, `'${tab.key}' görünümüne geçiş yapıldı.`);
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${isSubSelected
                  ? 'bg-indigo-500 text-slate-950 shadow-md font-black'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
              >
                <SubIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`${hideSidebar ? 'h-full w-full' : 'h-screen overflow-hidden'} ${bgMain} flex flex-col font-sans select-none antialiased selection:bg-indigo-500/20 selection:text-indigo-300 transition-colors duration-200`}>

      {/* 1. ÜST HEADER BAR (Hekim Profil Bilgileri / Tema Seçimi / Randevu Özetleri) */}
      {!hideSidebar && (
      <header className={`h-[72px] ${bgSidebar} px-6 flex items-center justify-between border-b ${borderLine} sticky top-0 z-40 shrink-0 transition-all duration-200 shadow-sm`}>

        {/* Klinik Logo ve Bilgisi */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer ${isDark
              ? 'bg-[#121c2c] hover:bg-[#1e2f46] text-indigo-300 border-[#1f3048]'
              : 'bg-slate-50 hover:bg-slate-100 text-indigo-600 border-slate-200/80 shadow-sm'
              }`}
            title="Menüyü Aç/Kapa"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="bg-gradient-to-tr from-indigo-500 to-sky-400 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/15 hover:scale-105 transition-transform">
            <BriefcaseMedical className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-black tracking-widest uppercase ${textTitle}`}>DisAsistanım AI</span>
            <span className="text-[9px] font-bold text-indigo-500 tracking-wider font-mono">DOKTOR KLİNİK PANELİ v4.0</span>
          </div>
        </div>

        {/* Çalışma Süresi & Aktif Hasta Göstergeleri */}
        <div className="hidden md:flex items-center space-x-4 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
          <div className="flex items-center space-x-1.5 text-indigo-400">
            <Clock className="h-4 w-4 animate-spin-slow text-indigo-500" />
            <span className="text-xs font-black font-mono leading-none">{formatTrackerTime(trackerSeconds)}</span>
          </div>
          <span className="text-slate-500 text-xs font-bold font-mono">|</span>
          <div className="flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] text-emerald-500 font-extrabold font-mono uppercase">HEKİM SEANSI AKTİF</span>
          </div>
        </div>

        {/* Aksiyon Sağ Araç Çubuğu */}
        <div className="flex items-center space-x-3">

          {/* TEMA DEĞİŞTİRME BUTONU (AKTİFLEŞTİRİLDİ) */}
          <button
            onClick={() => setTheme?.(isDark ? 'light' : 'dark')}
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${isDark
              ? 'bg-[#121c2c] hover:bg-[#18273d] text-amber-400 border-[#1f3048]'
              : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 shadow-sm'
              }`}
            title={isDark ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
          >
            {isDark ? (
              <Sun className="h-4 w-4 animate-spin text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* Hızlı Bildirim Zili */}
          <div
            className={`relative p-2.5 rounded-xl border cursor-pointer transition-all ${isDark ? 'bg-[#121c2c] hover:bg-[#1e2f46] text-indigo-300 border-[#1f3048]' : 'bg-slate-50 hover:bg-slate-105 text-indigo-600 border-slate-200'}`}
            onClick={() => {
              appendLog('Presentation (UI)', 'Bildirim Zili Tıklandı', 'Kritik alarm tablosu gözden geçiriliyor.');
              toast.info("Klinik Alarm Sistemi: Sistem bağlantısı stabil, yeni acil çağrı mevcut değildir.");
            }}
          >
            <Bell className="h-4 w-4 text-indigo-500" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span>
          </div>

          {/* Hekim Kimliği */}
          <div className="flex items-center space-x-2.5 border-l border-slate-600/20 pl-3">
            <Avatar
              url={doctorProfile.avatarUrl}
              name={doctorProfile.name}
              className="h-8 w-8 rounded-xl border-2 border-indigo-500 shadow-md"
              iconClassName="h-4 w-4"
            />
            <div className="hidden sm:block text-left">
              <p className={`text-xs font-black leading-none ${textTitle}`}>{doctorProfile.name}</p>
              <p className="text-[9px] text-indigo-500 font-bold font-mono tracking-wider mt-0.5 uppercase">KAYITLI HEKİM</p>
            </div>
          </div>

        </div>

      </header>
      )}

      {/* 2. ANA LOGIC BODY (Sol Panel Menüsü ve Sağ Çoklu Tab Görünümleri) */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* MOBİL BACKDROP OVERLAY */}
        {!hideSidebar && (
          <>
            <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-950/40 z-40 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* SOL PANEL (Bölüm Seçimleri) */}
        <aside className={`fixed inset-y-0 left-0 lg:relative z-50 lg:z-auto w-[245px] ${bgSidebar} flex flex-col justify-between shrink-0 transition-transform lg:translate-x-0 duration-300 border-r h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:flex'}`}>

          <div className="p-4 space-y-5">

            {/* Mobil Menü Kapatma Butonu */}
            <div className="flex lg:hidden items-center justify-between border-b pb-2.5 border-slate-700/10 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gezinti Menüsü</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`p-1.5 rounded-lg border ${isDark ? 'bg-[#152033] border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-205 text-slate-700'} cursor-pointer`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Klinik Seçimi */}
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-[#152033] border-[#1e2e4b]' : 'bg-slate-50 border-slate-200'} border`}>
              <span className="text-[9px] font-mono font-black text-indigo-500 tracking-wider uppercase block">AKTİF KLİNİK ADI</span>
              <p className={`text-xs font-black truncate mt-1 ${textTitle}`}>{currentClinic.name}</p>
            </div>

            {/* Bölüm Linkleri (Pages / Tabs) */}
            <div className="space-y-1">
              {[
                { label: 'Genel Bakış', icon: Activity },
                { label: 'Hasta Kayıt & Listesi', icon: UserRoundCheck, badge: (patientsList || []).length.toString() },
                { label: 'Tedavi & Teşhis Masası', icon: BriefcaseMedical },
                { label: 'Randevu Defteri', icon: Calendar, badge: (appointmentsList || []).filter(a => a?.status === 'Bekliyor').length.toString() },
                { label: 'Profilim', icon: User },
              ].map((menu) => {
                const Icon = menu.icon;
                const isSelected = activeMenu === menu.label;
                return (
                  <button
                    key={menu.label}
                    onClick={() => {
                      setActiveMenu(menu.label);
                      setSidebarOpen(false);
                      appendLog('Presentation (UI)', `Sol Menü Tıklandı: ${menu.label}`, `Tab '${menu.label}' görünümüne geçiş yapıldı.`);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected
                      ? 'bg-gradient-to-r from-indigo-500/15 to-transparent text-indigo-400 border-l-[3.5px] border-indigo-500 font-black'
                      : isDark
                        ? 'text-[#6e85a5] hover:text-white hover:bg-[#121c2c]'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span>{menu.label}</span>
                    </div>
                    {menu.badge && (
                      <span className="text-[9px] bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 px-1.5 py-0.2 rounded font-mono font-bold leading-none">{menu.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Sol Alt Sabit Aksiyonlar */}
          <div className={`p-4 border-t ${borderLine} space-y-2`}>

            <button
              onClick={() => {
                const dump = {
                  patients: patientsList,
                  appointments: appointmentsList,
                  notifications: notificationsList,
                  teethLogs: patientTeeth
                };
                const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `klinik_n_katman_yedek_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                appendLog('Presentation (UI)', 'Sistem Veri Yedeği İndirildi', 'Veritabanı dökümü JSON biçiminde dışa aktarıldı.');
              }}
              className={`w-full py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${isDark
                ? 'bg-[#101b2b] hover:bg-indigo-500 hover:text-slate-950 text-indigo-400 border-[#1c304f]'
                : 'bg-slate-50 hover:bg-indigo-500 hover:text-white text-slate-700 border-slate-200'
                }`}
            >
              <Download className="h-3.5 w-3.5" />
              Veritabanı Klasörünü Yedekle
            </button>

            <button
              onClick={onExit}
              className="w-full bg-rose-500/15 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/30 py-2.5 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Power className="h-3.5 w-3.5 font-bold" />
              Arayüzden Çıkış Yap
            </button>
          </div>

        </aside>
          </>
        )}

        {/* SAĞ ÇAPRAZ WORKSPACE (Kullanıcı Tarafından Seçilen Menünün Ekranı) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* GEÇİCİ BİLGİ VE ŞİFRE GÖSTERİM ALANI (TEMPORARY CREDENTIALS POPUP - "geçici şifre e-posta bilgileri alanı eklemeyi unutma") */}
          <AnimatePresence>
            {credentialsModal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-5 space-y-3 shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <UserCheck className="h-5 w-5 animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-wider">Müşteri Tanımlandı: Giriş Bilgileri Üretildi</span>
                  </div>
                  <button
                    onClick={() => setCredentialsModal(null)}
                    className="text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className={`text-xs ${textMuted}`}>
                  Yeni hasta hesabı veri tabanına Stored Procedure aracılığıyla başarıyla işlenmiştir. Hastanın ilk girişi için geçici erişim anahtarı aşağıdadır:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#0d1522] border border-emerald-900/30 p-3.5 rounded-xl text-xs font-semibold">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">AD SOYAD</span>
                    <span className="text-white font-black">{credentialsModal.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">TC NO (Giriş No)</span>
                    <span className="text-white font-mono select-all font-bold">{credentialsModal.tc}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block font-mono">E-POSTA</span>
                    <span className="text-cyan-400 font-mono select-all font-bold">{credentialsModal.email}</span>
                  </div>
                  <div className="bg-amber-500/15 border border-amber-500/30 p-2.5 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-amber-500 text-[9px] block font-black font-mono">GEÇİCİ ŞİFRE</span>
                      <span className="text-white font-mono font-black tracking-widest">{credentialsModal.pass}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`Giriş Bilgileri:\nT.C: ${credentialsModal.tc}\nE-posta: ${credentialsModal.email}\nŞifre: ${credentialsModal.pass}`);
                        toast.success("Giriş bilgileri panoya kopyalandı!");
                      }}
                      className="text-amber-400 hover:text-amber-200 p-1 bg-amber-500/10 rounded"
                      title="Kopyala"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HASTA DETAYLI PROFİL İNCELEME MODALİ ("hasta profillerinin yanında profili incele butonuyla hastanın tüm bilgilerinin olduğu ekran açılmalı.") */}
          <AnimatePresence>
            {inspectedPatient && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
                onClick={() => setInspectedPatient(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className={`${bgCard} w-full max-w-2xl border rounded-2xl p-6 space-y-5 shadow-2xl relative`}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/20 pb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        url={inspectedPatient.avatarUrl}
                        name={inspectedPatient.name}
                        className="h-14 w-14 rounded-xl border-2 border-indigo-500 shadow-md"
                        iconClassName="h-8 w-8"
                      />
                      <div>
                        <h3 className={`text-base font-black ${textTitle}`}>{inspectedPatient.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold bg-[#2ed0e1]/10 px-2.5 py-0.5 rounded-full">{inspectedPatient.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inspectedPatient.isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-500'
                            }`}>
                            {inspectedPatient.isActive ? 'Hesap Aktif' : 'Aktifleştirilmesi Bekleniyor'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setInspectedPatient(null)}
                      className="text-slate-500 hover:text-rose-500 transition-colors bg-slate-800/20 p-2 rounded-full cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Body Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Kişisel & İletişim Bilgileri */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-indigo-400 font-mono tracking-widest uppercase mb-1">KİŞİSEL & İLETİŞİM VERİLERİ</h4>
                      <div className="space-y-2 text-xs font-semibold">
                        <div className={`p-2.5 rounded-xl flex justify-between ${isDark ? 'bg-[#0f192b]/60' : 'bg-slate-50 border'}`}>
                          <span className={textMuted}>T.C. Kimlik No:</span>
                          <span className={`font-mono ${textTitle}`}>{inspectedPatient.tcNo || '00000000000'}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl flex justify-between ${isDark ? 'bg-[#0f192b]/60' : 'bg-slate-50 border'}`}>
                          <span className={textMuted}>Telefon No:</span>
                          <span className={`font-mono ${textTitle}`}>{inspectedPatient.phone}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl flex justify-between ${isDark ? 'bg-[#0f192b]/60' : 'bg-slate-50 border'}`}>
                          <span className={textMuted}>E-posta Adresi:</span>
                          <span className={`font-mono ${textTitle}`}>{inspectedPatient.email}</span>
                        </div>
                        <div className={`p-2.5 rounded-xl flex justify-between ${isDark ? 'bg-[#0f192b]/60' : 'bg-slate-50 border'}`}>
                          <span className={textMuted}>Yaş & Doğum Tarihi:</span>
                          <span className={textTitle}>{inspectedPatient.age} Yaş ({inspectedPatient.dob})</span>
                        </div>
                        <div className={`p-2.5 rounded-xl flex justify-between ${isDark ? 'bg-[#0f192b]/60' : 'bg-slate-50 border'}`}>
                          <span className={textMuted}>Cinsiyet & Kan:</span>
                          <span className={textTitle}>{inspectedPatient.gender} • <strong className="text-rose-500">{inspectedPatient.bloodType}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Klinik & Sağlık Bilgileri */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-rose-500 font-mono tracking-widest uppercase mb-1">KLİNİK DETAYLARI & BULGULAR</h4>
                      <div className="space-y-2 text-xs font-semibold">
                        <div className="bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
                          <span className="text-[10px] font-mono font-black text-rose-400 block tracking-widest uppercase mb-1">ALERJİ & KRONİK SORUNLAR:</span>
                          <p className="text-rose-400 font-extrabold leading-relaxed">{inspectedPatient.allergies || 'Saptanmış klinik alerji kaydı bulunmamaktadır.'}</p>
                        </div>
                        <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl">
                          <span className="text-[10px] font-mono font-black text-indigo-400 block tracking-widest uppercase mb-1">ÖNERİLEN KLİNİK TEDAVİLER:</span>
                          <p className="text-[#a5b4fc] font-medium leading-relaxed">{inspectedPatient.recommendedTreatment || 'Bilinmiyor / Tedavi tezi tamamlandı.'}</p>
                        </div>
                        <div className={`p-2.5 rounded-xl flex justify-between ${isDark ? 'bg-[#0f192b]/60' : 'bg-slate-50 border'}`}>
                          <span className={textMuted}>Genel Tedavi Durumu:</span>
                          <span className="text-indigo-400 font-bold">{inspectedPatient.treatmentStatus}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Geçici Erişim Anahtarı Görünümü (Aktifleşene kadar devam eder) */}
                  {!inspectedPatient.isActive && (
                    <div className="bg-amber-500/5 border border-amber-550/20 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-black text-amber-500 tracking-widest uppercase block">HESAP AKTİF DEĞİL - GEÇİCİ ERİŞİM ANAHTARI</span>
                        <button
                          onClick={() => {
                            BLL_ActivatePatientAccount(inspectedPatient.id);
                            setInspectedPatient(prev => prev ? { ...prev, isActive: true } : null);
                          }}
                          className="bg-emerald-555 bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-3 py-1 rounded font-black text-[10px] transition-all cursor-pointer"
                        >
                          Hesabı Şimdi Aktifleştir
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded border border-slate-800 text-xs font-mono">
                        <span className="text-slate-400">Üretilen Geçici Şifre:</span>
                        <span className="text-amber-400 font-black tracking-widest">{inspectedPatient.tempPassword || 'DIS-YENIKAYIT'}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="border-t border-slate-700/20 pt-4 flex gap-3 justify-end leading-none font-semibold">
                    <button
                      onClick={() => setInspectedPatient(null)}
                      className="px-4 py-2.5 rounded-xl text-xs font-black text-slate-400 hover:text-white transition-all border border-slate-700/40 hover:border-slate-600 cursor-pointer"
                    >
                      Kapat
                    </button>
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: GENEL BAKIŞ DASHBOARD */}
          {activeMenu === 'Genel Bakış' && (
            <SharedDashboard
              isDark={isDark}
              bgCard={bgCard}
              textTitle={textTitle}
              textMuted={textMuted}
              bgInput={bgInput}
              patientsList={patientsList}
              appointmentsList={appointmentsList}
              doctorTasks={doctorTasks}
              setDoctorTasks={setDoctorTasks}
              newTaskText={newTaskText}
              setNewTaskText={setNewTaskText}
              trackerSeconds={trackerSeconds}
              isTrackerRunning={isTrackerRunning}
              setIsTrackerRunning={setIsTrackerRunning}
              formatTrackerTime={formatTrackerTime}
              setSelectedPatientId={setSelectedPatientId}
              setActiveMenu={setActiveMenu}
              appendLog={appendLog}
              activePatient={activePatient}
            />
          )}

          {/* TAB 2: HASTA KAYIT & LİSTESİ ("hasta ekleme, sistemde kayıtlı hastalar") */}
          {activeMenu === 'Hasta Kayıt & Listesi' && (
            <div className="space-y-6 animate-fadeIn">

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sol: Yeni Hasta Ekleme Formu */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-5 space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3">
                    <h3 className={`text-xs font-black tracking-widest uppercase flex items-center gap-2 ${textTitle}`}>
                      <UserPlus className="h-4 w-4 text-indigo-500" />
                      YENİ HASTA KAYIT PROTOKOLÜ
                    </h3>
                    <p className={`text-[10px] font-mono ${textMuted}`}>BL katmanı doğrulamaları ve otomatik geçici şifre ile ekleme</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>TC Kimlik Numarası <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        maxLength={11}
                        required
                        value={newPatTC}
                        onChange={e => setNewPatTC(e.target.value.replace(/\D/g, ''))}
                        className={`w-full text-xs font-semibold p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                        placeholder="11 haneli kimlik no"
                      />
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Ad Soyadı <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={newPatName}
                        onChange={e => setNewPatName(e.target.value)}
                        className={`w-full text-xs font-semibold p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                        placeholder="Ad soyad"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Telefon No</label>
                        <input
                          type="tel"
                          value={newPatPhone}
                          onChange={e => setNewPatPhone(e.target.value)}
                          className={`w-full text-xs font-semibold p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                          placeholder="Telefon no"
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>E-posta <span className="text-rose-500">*</span></label>
                        <input
                          type="email"
                          required
                          value={newPatEmail}
                          onChange={e => setNewPatEmail(e.target.value)}
                          className={`w-full text-xs font-semibold p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                          placeholder="E-posta adresi"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Cinsiyet</label>
                        <select
                          value={newPatGender}
                          onChange={e => setNewPatGender(e.target.value as 'Erkek' | 'Kadın')}
                          className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgSelect}`}
                        >
                          <option value="Kadın">Kadın</option>
                          <option value="Erkek">Erkek</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Doğum Tarihi</label>
                        <input
                          type="date"
                          value={newPatDob}
                          onChange={e => setNewPatDob(e.target.value)}
                          className={`w-full text-xs font-bold p-2.5 rounded-xl focus:outline-none ${bgInput}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Kan Grubu</label>
                        <select
                          value={newPatBlood}
                          onChange={e => setNewPatBlood(e.target.value)}
                          className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgSelect}`}
                        >
                          <option value="A Rh+">A Rh+</option>
                          <option value="A Rh-">A Rh-</option>
                          <option value="B Rh+">B Rh+</option>
                          <option value="B Rh-">B Rh-</option>
                          <option value="AB Rh+">AB Rh+</option>
                          <option value="AB Rh-">AB Rh-</option>
                          <option value="0 Rh+">0 Rh+</option>
                          <option value="0 Rh-">0 Rh-</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Alerji / Kronik Hastalıklar</label>
                      <input
                        type="text"
                        value={newPatAllergies}
                        onChange={e => setNewPatAllergies(e.target.value)}
                        className={`w-full text-xs font-semibold p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                        placeholder="Örn: Penisilin Alerjisi"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={registerLoading}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-800 disabled:cursor-not-allowed text-slate-950 text-xs font-black py-3 rounded-xl cursor-pointer shadow-lg transition-all mt-4 flex items-center justify-center gap-2"
                    >
                      {registerLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Kayıt Yapılıyor...
                        </>
                      ) : (
                        'Müşteri Verilerini İşle ve Şifre Üret'
                      )}
                    </button>

                  </form>

                </div>

                {/* Sağ: Sistemde Kayıtlı Hasta Listesi */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-7 flex flex-col space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>SİSTEMDE KAYITLI HASTA LİSTESİ</h3>
                      <p className={`text-[10px] font-mono ${textMuted}`}>Kayıtlı hastaların kimlik bilgileri, yaşları, kan grupları ve hesap durumları</p>
                    </div>
                    <span className="text-[10.5px] bg-indigo-500/10 text-indigo-500 font-extrabold px-3 py-1 rounded-lg">
                      {(patientsList || []).length} Toplam Hasta
                    </span>
                  </div>

                  {/* Tablo Arayüzü */}
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-755 text-[10px] font-mono text-slate-500 tracking-wider">
                          <th className="py-2.5">AD SOYAD</th>
                          <th className="py-2.5">TC NO</th>
                          <th className="py-2.5">KAN GRUBU</th>
                          <th className="py-2.5">HESAP DURUMU</th>
                          <th className="py-2.5 text-right">İŞLEMLER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(patientsList || []).map((p) => {
                          const isSessionActive = p.id === selectedPatientId;
                          return (
                            <tr
                              key={p.id}
                              className={`border-b ${borderLine} text-xs font-semibold transition-colors ${isSessionActive
                                ? 'bg-indigo-500/10 text-[#a5b4fc]'
                                : isDark ? 'hover:bg-[#121c2c] text-slate-350' : 'hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                              <td className="py-3 flex items-center space-x-2.5">
                                <Avatar
                                  url={p.avatarUrl}
                                  name={p.name}
                                  className="h-7 w-7 rounded-lg border border-slate-700/20"
                                  iconClassName="h-3.5 w-3.5"
                                />
                                <div>
                                  <span className={isSessionActive ? 'font-black' : ''}>{p.name}</span>
                                  <span className="block text-[9px] text-slate-500 font-medium">{p.age} Yaş, {p.gender}</span>
                                </div>
                              </td>
                              <td className="py-3 font-mono">{p.tcNo || '00000000000'}</td>
                              <td className="py-3 text-rose-500 font-black">{p.bloodType}</td>
                              <td className="py-3">
                                {p.isActive ? (
                                  <span className="text-[9.5px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    Aktif Hesap
                                  </span>
                                ) : (
                                  <div className="flex flex-col space-y-1 items-start">
                                    <span className="text-[9px] px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-500 border border-amber-550/20">
                                      Beklemede
                                    </span>
                                    {p.tempPassword && (
                                      <span className="text-[9px] font-mono bg-slate-800 text-amber-400 border border-slate-700 px-1 rounded flex items-center gap-1">
                                        Şifre: {p.tempPassword}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => BLL_ActivatePatientAccount(p.id)}
                                      className="text-[9.5px] text-emerald-500 hover:underline font-black"
                                    >
                                      ✓ Aktifleştir
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 text-right space-x-1.5">
                                <button
                                  onClick={() => {
                                    setInspectedPatient(p);
                                    appendLog('Presentation (UI)', 'Profil İnceleme Bilgisi', `'${p.name}' adlı hastanın tam profili açıldı.`);
                                  }}
                                  className={`text-[9.5px] font-black px-2 py-1.5 rounded-lg border cursor-pointer hover:bg-slate-800/20 ${isDark ? 'text-cyan-400 border-cyan-500/20' : 'text-cyan-600 border-slate-200'
                                    }`}
                                >
                                  Profili İncele
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPatientId(p.id);
                                    appendLog('Presentation (UI)', 'Hasta Seçildi', `Aktif tedavi seansı için '${p.name}' seçildi.`);
                                  }}
                                  className={`text-[9.5px] font-black px-2 py-1.5 rounded-lg border cursor-pointer ${isSessionActive
                                    ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                                    : 'bg-indigo-500 text-slate-950 border-transparent hover:bg-indigo-600'
                                    }`}
                                >
                                  {isSessionActive ? 'Seçili' : 'Tedaviye Al'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: TEDAVİ & TEŞHİS MASASI - AKTİF HASTA OLMAMA DURUMU */}
          {activeMenu === 'Tedavi & Teşhis Masası' && !activePatient && (
            <div className="space-y-6 animate-fadeIn">
              <div className={`${bgCard} border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4`}>
                <div className="h-16 w-16 bg-rose-500/10 text-rose-500 flex items-center justify-center rounded-2xl animate-bounce">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h4 className={`text-base font-black uppercase tracking-wider ${textTitle}`}>Aktif Tedavi Seansı Açık Değil</h4>
                  <p className={`text-xs max-w-md mx-auto mt-2 ${textMuted}`}>
                    Yapay zeka ile analiz, röntgen tetkikleri ve detaylı diş operasyonları gerçekleştirebilmek için lütfen önce
                    <strong> 'Hasta Kayıt & Listesi'</strong> tabından bir hasta seçip <strong>"Tedaviye Al"</strong> butonuna tıklayınız.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMenu('Hasta Kayıt & Listesi')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Hasta Listesine Git
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: AĞIZ TEŞHİS HARİTASI ("hastanın mevcut diş durumu(ağız görseli ile hangi dişte ne var görünecek)") */}
          {activeMenu === 'Tedavi & Teşhis Masası' && activePatient && activeWorkspaceSubTab === 'Ağız Teşhis Haritası' && (
            <div className="space-y-6 animate-fadeIn">
              {renderTeTeMasasiHeader()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Sol: İnteraktif Çene Anatomisi Görseli (32 Diş) */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-7 flex flex-col items-center space-y-4`}>

                  <div className="w-full border-b border-slate-700/20 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>İNTERAKTİF DIŞ SAĞLIĞI & TEŞHİS HARİTASI (FDI)</h3>
                      <p className={`text-[10px] font-mono ${textMuted}`}>Klinik dişlere tıklayarak lezyon, çürük ve tedavi durumunu tanımlayın</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 font-mono">AKTİF: {activePatient.name}</span>
                  </div>

                  <div className={`relative w-[340px] h-[340px] rounded-full flex items-center justify-center border ${borderLine} ${isDark ? 'bg-[#060a12]' : 'bg-slate-50'}`}>

                    {/* Üst / Alt Çene Bölgeleri Yazıları */}
                    <div className="absolute top-10 text-center pointer-events-none">
                      <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase block">ÜST PARS (MAXILLA)</span>
                    </div>

                    <div className="absolute bottom-10 text-center pointer-events-none">
                      <span className="text-[8px] font-black text-slate-500 tracking-widest uppercase block">ALT PARS (MANDIBULA)</span>
                    </div>

                    {/* Çene Bölücü Grid Çizgileri */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                      <div className="w-full h-[1px] border-t border-dashed border-indigo-400"></div>
                      <div className="h-full w-[1px] border-l border-dashed border-indigo-400 absolute"></div>
                    </div>

                    {/* Diş Elemanlarının Anatomik Seçimi */}
                    {SHAPE_TEETH_COORDS.map((tc) => {
                      const toothInfo = patientTeeth.find(t => t.id === tc.id) || { status: 'healthy' };
                      const isFocused = selectedToothId === tc.id;

                      let toothColor = 'bg-emerald-500 text-slate-950 border-emerald-400';
                      if (toothInfo.status === 'risk') {
                        toothColor = 'bg-rose-500 text-white border-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse';
                      } else if (toothInfo.status === 'treatment') {
                        toothColor = 'bg-amber-500 text-slate-950 border-amber-300';
                      } else if (toothInfo.status === 'completed') {
                        toothColor = 'bg-indigo-500 text-white border-indigo-300';
                      }

                      return (
                        <button
                          key={tc.id}
                          onClick={() => {
                            setSelectedToothId(tc.id);
                            appendLog('Presentation (UI)', 'Diş Seçildi', `Ağız haritasından Diş #${tc.id} (${tc.name}) seçildi.`);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${tc.x}px`,
                            top: `${tc.y}px`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center text-[10px] font-black font-mono transition-all cursor-pointer ${toothColor} ${isFocused ? 'ring-4 ring-indigo-500 scale-120 z-10' : 'hover:scale-110'
                            }`}
                          title={`${tc.id} - ${tc.name}`}
                        >
                          {tc.id}
                        </button>
                      );
                    })}

                  </div>

                  {/* Renk Lejantı */}
                  <div className="w-full grid grid-cols-4 gap-2 text-[10px] font-bold text-center border-t border-slate-700/20 pt-3">
                    <div className="flex items-center justify-center space-x-1">
                      <span className="h-2.5 w-2.5 rounded bg-emerald-500 block"></span>
                      <span className={textMuted}>Sorunsuz Diş</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="h-2.5 w-2.5 rounded bg-rose-500 block animate-pulse"></span>
                      <span className={textMuted}>Kritik Lezyon</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="h-2.5 w-2.5 rounded bg-amber-500 block"></span>
                      <span className={textMuted}>Tedavi Devam</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="h-2.5 w-2.5 rounded bg-indigo-500 block"></span>
                      <span className={textMuted}>Tamamlandı</span>
                    </div>
                  </div>

                </div>

                {/* Sağ: Seçili Diş Teşhis ve Klinik Güncelleme Paneli */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-5 space-y-5`}>

                  <div className="border-b border-slate-700/20 pb-3">
                    <span className="text-[10px] font-mono font-black text-indigo-400 block tracking-widest uppercase">DETAY VE DIAGNOSTİK</span>
                    <h3 className={`text-xs font-black truncate mt-1 ${textTitle}`}>Seçili: Diş #{selectedToothId}</h3>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold mt-0.5">{selectedTooth.name || 'Tanım Alınamadı'}</p>
                  </div>

                  <div className="space-y-4 font-semibold">

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1.5`}>Klinik Teşhis Durumu</label>
                      <select
                        value={activeStatus}
                        onChange={e => setActiveStatus(e.target.value as ToothStatus)}
                        className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgSelect}`}
                      >
                        <option value="healthy">Sağlıklı / Sorunsuz</option>
                        <option value="risk">Kritik Yapay Zeka Riski (Anomali saptandı)</option>
                        <option value="treatment">Tedavi Aşamasında (Protokol yürütülüyor)</option>
                        <option value="completed">Tedavi Edilmiş / Dolgulu / Yapay Diş</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Klinik Hekim Muayene Notu</label>
                      <textarea
                        rows={3}
                        value={activeNotes}
                        onChange={e => setActiveNotes(e.target.value)}
                        className={`w-full text-xs p-3 rounded-xl focus:outline-none ${bgInput}`}
                        placeholder="Örn: Distal bölgede mine harabiyeti mevcuttur. Radyografik bulgu desteklendi."
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSaveToothNotes}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-xs font-black py-3 rounded-xl cursor-pointer"
                    >
                      Diş Klinik Notunu Kaydet
                    </button>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 4: KLİNİK İŞLEM KAYDI ("hastaya ait işlem kayıtları, işlem geçmişi") */}
          {activeMenu === 'Tedavi & Teşhis Masası' && activePatient && activeWorkspaceSubTab === 'Klinik İşlem Kaydı' && (
            <div className="space-y-6 animate-fadeIn">
              {renderTeTeMasasiHeader()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sol: Yeni Müdahale / İşlem Kaydı Oluşturucu */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-5 space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3">
                    <h3 className={`text-xs font-black tracking-widest uppercase text-indigo-400 ${textTitle}`}>YENİ OPERASYON / İŞLEM KAYDI</h3>
                    <p className={`text-[10px] font-mono ${textMuted}`}>Hastalara anlık klinik tedavi protokolü girmek için alanı doldurun</p>
                  </div>

                  <div className="space-y-4 font-semibold">

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Operasyon Yapılacak Diş</label>
                      <select
                        value={selectedToothId}
                        onChange={e => setSelectedToothId(Number(e.target.value))}
                        className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgSelect}`}
                      >
                        {SHAPE_TEETH_COORDS.map((t) => (
                          <option key={t.id} value={t.id}>Diş #{t.id} - {t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Tedavi / Müdahale Türü</label>
                      <select
                        value={newTreatmentType}
                        onChange={e => setNewTreatmentType(e.target.value as TreatmentType)}
                        className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgSelect}`}
                      >
                        <option value="muayene">Rutin Klinik Muayene</option>
                        <option value="dolgu">Estetik Kompozit Dolgu</option>
                        <option value="kanal">Endodontik Kanal Tedavisi</option>
                        <option value="temizlik">Detertraj (Diş Taşı Temizliği)</option>
                        <option value="cekme">Cerrahi Diş Çekimi / Gömülü Diş</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Uygulanan Klinik Detay / Recete Açıklaması</label>
                      <textarea
                        rows={4}
                        value={newTreatmentDesc}
                        onChange={e => setNewTreatmentDesc(e.target.value)}
                        className={`w-full text-xs p-3 rounded-xl focus:outline-none ${bgInput}`}
                        placeholder="Örn: 36 nolu dişe dual-cure kompozit dolgu ile anatomik form verildi. Oklüzyon rehberliği yapıldı."
                      ></textarea>
                    </div>

                    <button
                      onClick={handleAddTreatmentRecord}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 text-xs font-black py-3 rounded-xl cursor-pointer shadow"
                    >
                      Müdahale Kaydı Girişi Yap ve Tamamla
                    </button>

                  </div>

                </div>

                {/* Sağ: İlgili Hastanın İşlem Geçmişi (Tedavi Logları) */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-7 flex flex-col space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>KRONOLOJİK İŞLEM GEÇMİŞİ LOGU</h3>
                      <p className={`text-[10px] font-mono ${textMuted}`}>Seçilen hastanın önceki diş tedavilerine ait geçmiş veri kütüphanesi</p>
                    </div>
                    <span className="text-[10.5px] text-indigo-400 font-extrabold font-mono">
                      Hasta: {activePatient.name}
                    </span>
                  </div>

                  {/* Detaylı Müdahale Listesi */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1">

                    {/* patientTeeth üzerindeki tüm treatments dizilerini birleştirip gösterelim */}
                    {(() => {
                      const allTreatments: Array<{ toothId: number; type: TreatmentType; date: string; description: string }> = [];
                      patientTeeth.forEach(tooth => {
                        if (tooth.treatments && tooth.treatments.length > 0) {
                          tooth.treatments.forEach(tr => {
                            allTreatments.push({
                              toothId: tooth.id,
                              type: tr.type,
                              date: tr.date,
                              description: tr.description
                            });
                          });
                        }
                      });

                      if (allTreatments.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12 space-y-2">
                            <BriefcaseMedical className="h-8 w-8 opacity-40" />
                            <p className="italic font-bold text-xs">Bu hastamız için henüz bir klinik müdahale / operasyon logu girilmemiştir.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {allTreatments.sort((a, b) => b.date.localeCompare(a.date)).map((tr, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border leading-relaxed font-semibold transition-all ${isDark ? 'bg-[#0f192b]/60 border-indigo-500/10 hover:border-indigo-500/20' : 'bg-slate-50 border-slate-205'}`}>
                              <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-700/10">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded px-2 py-0.5">Diş #{tr.toothId}</span>
                                  <span className="text-[10px] font-mono uppercase text-indigo-400 font-black">{tr.type}</span>
                                </div>
                                <span className="text-[10px] text-slate-550 font-mono font-bold">{tr.date}</span>
                              </div>
                              <p className={`text-xs ${isDark ? 'text-slate-350' : 'text-slate-600'} font-medium`}>{tr.description}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 5: HASTA RÖNTGEN BİGRAFİ BİLGİLERİ (Radyoloji) */}
          {activeMenu === 'Tedavi & Teşhis Masası' && activePatient && activeWorkspaceSubTab === 'Röntgen & X-Ray' && (
            <div className="space-y-6 animate-fadeIn">
              {renderTeTeMasasiHeader()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Sol: Panoramik Röntgen Tarayıcı Modülü */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-8 space-y-5`}>

                  <div className="border-b border-slate-700/20 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>DENTAL PANORAMİK RÖNTGEN ANALİZÖRÜ (X-RAY)</h3>
                      <p className={`text-[10px] font-mono ${textMuted}`}>Segmental yapay zeka tanıma algoritmalarıyla radyolojik tarama simülasyonu</p>
                    </div>
                    <button
                      onClick={handleTriggerAnalysis}
                      disabled={isScanning}
                      className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isScanning ? `${scanProgress}% AI Tarıyor...` : 'AI Taraması Başlat'}
                    </button>
                  </div>

                  {/* Röntgen Görsel Alanı */}
                  <div className="relative rounded-2xl bg-black overflow-hidden border border-slate-800 flex justify-center items-center min-h-[260px]">
                    <img
                      src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=900"
                      alt="Hekim Röntgen Örneği"
                      className={`max-h-[300px] w-full object-cover transition-all selection:bg-transparent ${isScanning ? 'opacity-40 grayscale-80' : 'opacity-70 contrast-125'}`}
                    />

                    {/* Laser scanning bar line */}
                    {isScanning && (
                      <div
                        style={{ left: `${scanProgress}%` }}
                        className="absolute inset-y-0 w-1 bg-indigo-400 shadow-[0_0_15px_#6366f1] transition-all"
                      />
                    )}

                    {/* Tespit Edilen Anomaliler (Hotspots) */}
                    {!isScanning && (
                      <>
                        <div className="absolute top-[48%] left-[32%] bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded shadow-lg animate-pulse font-mono">
                          36 Nolu Diş : Arayüz Demineralizasyonu (%12)
                        </div>
                        <div className="absolute top-[35%] left-[65%] bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow-lg animate-pulse font-mono">
                          14 Nolu Diş : Peri-implantit Riski
                        </div>
                      </>
                    )}

                  </div>

                </div>

                {/* Sağ: Röntgen Kayıtları & Röntgen Detayı */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-4 space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-2">
                    <span className="text-[10px] font-mono font-black text-indigo-400 block tracking-widest uppercase">RADYOLOJİ RECM İNDEKS</span>
                    <h3 className={`text-xs font-black truncate mt-1 ${textTitle}`}>HASTAYA AİT RÖNTGEN ARŞİVİ</h3>
                  </div>

                  <div className="space-y-3 font-semibold">
                    {xrays.map((xr) => (
                      <div
                        key={xr.id}
                        className={`p-3.5 rounded-xl border space-y-2 transition-all cursor-pointer ${isDark ? 'bg-[#101b2c] border-indigo-500/10 hover:border-indigo-400/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        onClick={() => {
                          appendLog('Presentation (UI)', `Röntgen İnceleme: ${xr.title}`, 'X-Ray görüntü detayları ve arşivi aktif edildi.');
                          toast.info(`Seçilen Röntgen: ${xr.title}\nTarih: ${xr.date}\nRadyolog Notu: ${xr.notes}`);
                        }}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className={textTitle}>{xr.title}</span>
                          <span className="text-[9.5px] text-slate-500 font-mono">{xr.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate leading-relaxed">{xr.notes}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sahte X-Ray yükleme aksiyonu */}
                  <div className="pt-3 border-t border-slate-700/20">
                    <button
                      onClick={() => {
                        appendLog('Presentation (UI)', 'Röntgen Yükleme', 'Bilgisayardan yeni .dicom / radiography dosyası seçildi.');
                        toast.info("X-Ray Dosya Yükleyici: Yerel bilgisayardan .DICOM uzantılı radyoloji dosyası seçin");
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${isDark ? 'bg-[#182335] text-indigo-400 border-indigo-550/30 hover:bg-[#1f2d44]' : 'bg-white hover:bg-slate-50 text-indigo-600 border-slate-205'
                        }`}
                    >
                      <Camera className="h-4 w-4 text-indigo-500" />
                      Yeni Röntgen (.DICOM) Dosyası Seç
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 6: RANDEVU TAKVİMİ ("randevular") */}
          {activeMenu === 'Randevu Defteri' && (
            <div className="space-y-6 animate-fadeIn">

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sol: Planlayıcı Formu */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-5 space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3">
                    <h3 className={`text-xs font-black tracking-widest uppercase flex items-center gap-2 ${textTitle}`}>
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      YENİ RANDEVU PROGRAMLAYICI
                    </h3>
                    <p className={`text-[10px] font-mono ${textMuted}`}>BLL iş kuralları ile müsaitlik doğrulama modülü</p>
                  </div>

                  <form onSubmit={handleScheduleSubmit} className="space-y-4 leading-relaxed font-semibold">

                    <div>
                      <span className="text-[10px] text-slate-550 font-black uppercase tracking-wider block mb-1">Seçili Hasta Bilgisi</span>
                      {activePatient ? (
                        <div className={`p-3 rounded-xl flex items-center space-x-2.5 font-extrabold ${isDark ? 'bg-[#060a12]' : 'bg-slate-50 border'}`}>
                          <Avatar
                            url={activePatient.avatarUrl}
                            name={activePatient.name}
                            className="h-8 w-8 rounded-lg border border-slate-700/20"
                            iconClassName="h-4 w-4"
                          />
                          <div>
                            <p className={`text-xs ${textTitle}`}>{activePatient.name}</p>
                            <p className="text-[10px] text-slate-500">{activePatient.phone}</p>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-3 rounded-xl flex items-center space-x-2.5 font-extrabold ${isDark ? 'bg-[#060a12]' : 'bg-slate-50 border'} text-rose-500`}>
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-xs">Lütfen listeden bir hasta seçiniz!</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Randevu Tarihi</label>
                        <input
                          type="date"
                          required
                          value={newAppDate}
                          onChange={e => setNewAppDate(e.target.value)}
                          className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgInput}`}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Randevu Saati</label>
                        <input
                          type="time"
                          required
                          value={newAppTime}
                          onChange={e => setNewAppTime(e.target.value)}
                          className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgInput}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Randevu Açıklaması / Tedavi Alt Türü</label>
                      <input
                        type="text"
                        required
                        value={newAppType}
                        onChange={e => setNewAppType(e.target.value)}
                        className={`w-full text-xs font-semibold p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                        placeholder="Örn: 14 Nolu dişe implant restorasyonu muayenesi"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-xs py-3 rounded-xl cursor-pointer shadow transition-all"
                    >
                      Klinik Randevusunu Programla
                    </button>

                  </form>

                </div>

                {/* Sağ: Randevu Takvimi Listesi */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-7 flex flex-col space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>KLİNİK RANDEVU PLAN DEFTERİ</h3>
                      <p className={`text-[10px] font-mono ${textMuted}`}>Hekimin güncel muayene seans çizelgesi</p>
                    </div>
                    <span className="text-[10.5px] bg-[#12281a] text-emerald-400 font-extrabold px-3 py-1 rounded-lg">
                      {appointmentsList.length} Toplam Randevu
                    </span>
                  </div>

                  {/* Randevu Tablosu */}
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-750 text-[10px] font-mono text-slate-500 tracking-wider">
                          <th className="py-2.5">HASTA</th>
                          <th className="py-2.5">TARİH</th>
                          <th className="py-2.5">SAAT</th>
                          <th className="py-2.5">İŞLEM TÜRÜ</th>
                          <th className="py-2.5">DURUM</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 italic text-xs">
                              Henüz randevu bulunmuyor.
                            </td>
                          </tr>
                        ) : (
                          appointmentsList.map((app) => (
                            <tr
                              key={app.id}
                              className={`border-b ${borderLine} text-xs font-semibold leading-relaxed ${isDark ? 'hover:bg-[#121c2c] text-slate-350' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              <td className="py-3 font-bold">{app.patientName}</td>
                              <td className="py-3 font-mono">{app.date}</td>
                              <td className="py-3 font-mono">{app.time}</td>
                              <td className="py-3">{app.type}</td>
                              <td className="py-3">
                                <span className={`text-[9.5px] px-2.5 py-1 rounded font-black ${app.status === 'Bekliyor'
                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-550/20'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-555/20'
                                  }`}>
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 7: POST-OP BİLDİRİM GÖNDERİMİ ("işlem sonrası hastaya bildirim göndereceği not alanı") */}
          {activeMenu === 'Tedavi & Teşhis Masası' && activePatient && activeWorkspaceSubTab === 'Hasta Bildirimi (Post-Op)' && (
            <div className="space-y-6 animate-fadeIn">
              {renderTeTeMasasiHeader()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sol: Mesaj Oluşturma / Gönderme Formu */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-5 space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3">
                    <h3 className={`text-xs font-black tracking-widest uppercase text-indigo-400 flex items-center gap-2 ${textTitle}`}>
                      <Send className="h-4 w-4" />
                      TEDAVİ SONRASI HASTA UYARI NOTU / BİLDİRİM PANALİ
                    </h3>
                    <p className={`text-[10px] font-mono ${textMuted}`}>Hastanın ekranına veya mobil cihazına anlık post-op bildirim gönderme alanı</p>
                  </div>

                  {/* Hazır İlaç / Post-op Şablonları */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block font-mono">Hazır Şablonlar (Hızlı Çözüm)</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-black">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifTitle('Cerrahi Çekim Sonrası Öneriler');
                          setNotifMessage('Diş çekimi yapılan yerdeki tamponu 30 dakika sıkıca ısırınız. 2 saat boyunca hiçbir şey yemeyiniz. Tükürmekten ve ağzınızı çalkalamaktan kesinlikle kaçınınız.');
                          appendLog('Presentation (UI)', 'Şablon Seçildi: Cerrahi Çekim', 'Cerrahi operasyon sonrası mesaj şablonu yüklendi.');
                        }}
                        className={`py-2 px-1.5 rounded-lg border text-center transition-all ${isDark ? 'bg-[#182335] border-indigo-500/10 hover:border-indigo-500/30' : 'bg-slate-100 border-slate-200'}`}
                      >
                        🦷 Cerrahi Çekim Önerisi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotifTitle('Kanal Tedavisi Sonrası Koruma Notu');
                          setNotifMessage('Kanal tedavisi sonrasında dişte çiğnemede hafif hassasiyet normaldir. 48 saat aşırı sert ve yapışkan kabuklu gıdalarla bu bölgeyi çiğnemeyiniz. Geçici dolguya zarar vermeyiniz.');
                          appendLog('Presentation (UI)', 'Şablon Seçildi: Kanal Tedavisi', 'Kanal tedavisi sonrası mesaj şablonu yüklendi.');
                        }}
                        className={`py-2 px-1.5 rounded-lg border text-center transition-all ${isDark ? 'bg-[#182335] border-indigo-500/10 hover:border-indigo-500/30' : 'bg-slate-100 border-slate-200'}`}
                      >
                        ⚡ Kanal Tedavisi Koruma
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSendNotificationSubmit} className="space-y-4 font-semibold leading-relaxed">

                    <div>
                      <span className="text-[10px] text-slate-550 font-black uppercase tracking-wider block mb-1">Gönderilecek Alıcı</span>
                      <div className={`p-3 rounded-xl flex items-center space-x-2.5 font-extrabold ${isDark ? 'bg-[#060a12]' : 'bg-slate-50 border'}`}>
                        <Avatar
                          url={activePatient.avatarUrl}
                          name={activePatient.name}
                          className="h-8 w-8 rounded-lg border border-slate-700/20"
                          iconClassName="h-4 w-4"
                        />
                        <div>
                          <p className={`text-xs ${textTitle}`}>{activePatient.name}</p>
                          <p className="text-[10px] text-indigo-400 font-mono">T.C: {activePatient.tcNo}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Bildirim / Not Başlığı</label>
                      <input
                        type="text"
                        required
                        value={notifTitle}
                        onChange={e => setNotifTitle(e.target.value)}
                        className={`w-full text-xs font-semibold p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                        placeholder="Örn: Operasyon Sonrası Dikkat Edilmesi Gerekenler"
                      />
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Tedavi Sonrası Evde Bakım Açıklaması / Not Alanı</label>
                      <textarea
                        rows={4}
                        required
                        value={notifMessage}
                        onChange={e => setNotifMessage(e.target.value)}
                        className={`w-full text-xs p-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/20 ${bgInput}`}
                        placeholder="Örn: Yapılan dolgu sonrasında sert gıda tüketmeyiniz..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black text-xs py-3 rounded-xl cursor-pointer shadow transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Tedavi Bildirimini Gönder
                    </button>

                  </form>

                </div>

                {/* Sağ: Gönderilmiş Bildirimler Listesi */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-7 flex flex-col space-y-4`}>

                  <div className="border-b border-slate-700/20 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>GÖNDERİLMİŞ BİLDİRİM VE KLİNİK TALİMAT ARŞİVİ</h3>
                      <p className={`text-[10px] font-mono ${textMuted}`}>Hastaların ekranlarında anlık beliren radyoloji ve klinik işlem notları</p>
                    </div>
                    <span className="text-[10.5px] text-indigo-400 font-extrabold font-mono">
                      {notificationsList.length} İleti
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-1">
                    {notificationsList.filter(n => n.patientId === activePatient.id).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                        <Inbox className="h-8 w-8 opacity-40 mb-2" />
                        <p className="italic font-bold text-xs">Bu hastamız için henüz bir post-op uyarı bildirimi gönderilmemiştir.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notificationsList.filter(n => n.patientId === activePatient.id).map((notif) => (
                          <div key={notif.id} className={`p-4 rounded-xl border leading-relaxed font-semibold transition-all ${isDark ? 'bg-[#0f192b]/60 border-indigo-500/10' : 'bg-slate-50 border-slate-205'}`}>
                            <div className="flex justify-between items-center border-b pb-2 mb-2 border-slate-700/10">
                              <span className={`text-[11px] font-black ${textTitle}`}>{notif.title}</span>
                              <span className="text-[9.5px] text-slate-550 font-mono">{notif.date}</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{notif.message}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                              <span>Gönderen: {notif.sentBy}</span>
                              <span className="text-emerald-500 font-extrabold">✓ {notif.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB: TEDAVİ SÜRECİ YOL HARİTASI ("hekim tarafından yönetilen tedavi aşamaları") */}
          {activeMenu === 'Tedavi & Teşhis Masası' && activePatient && activeWorkspaceSubTab === 'Tedavi Süreci Yol Haritası' && (
            <div className="space-y-6 animate-fadeIn">
              {renderTeTeMasasiHeader()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sol: Yeni Aşama Ekleme Formu */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-5 space-y-4`}>
                  <div className="border-b border-slate-700/20 pb-3">
                    <h3 className={`text-xs font-black tracking-widest uppercase text-indigo-400 flex items-center gap-2 ${textTitle}`}>
                      YOL HARİTASINA YENİ AŞAMA EKLE
                    </h3>
                    <p className={`text-[10px] font-mono ${textMuted}`}>Hastanın takip edeceği tedavi aşamasını takvime ekleyin</p>
                  </div>

                  <div className="space-y-4 font-semibold text-xs text-slate-300">
                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Aşama Başlığı / Tedavi Adı</label>
                      <input
                        type="text"
                        value={newStageTitle}
                        onChange={e => setNewStageTitle(e.target.value)}
                        className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgInput}`}
                        placeholder="Örn: 26 Nolu Diş Kanal Tedavisi"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>İşlem Tarihi</label>
                        <input
                          type="date"
                          value={newStageDate}
                          onChange={e => setNewStageDate(e.target.value)}
                          className={`w-full text-xs p-3 rounded-xl focus:outline-none ${bgInput}`}
                        />
                      </div>

                      <div>
                        <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Aşama Durumu</label>
                        <select
                          value={newStageStatus}
                          onChange={e => setNewStageStatus(e.target.value as any)}
                          className={`w-full text-xs font-bold p-3 rounded-xl focus:outline-none ${bgSelect}`}
                        >
                          <option value="done">YAPILDI (Done)</option>
                          <option value="active">ETKİN (Active)</option>
                          <option value="upcoming">GELECEK PLAN (Upcoming)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`text-[10px] font-black uppercase ${textTitle} block mb-1`}>Klinik Açıklama / Reçete Detayı</label>
                      <textarea
                        rows={3}
                        value={newStageNotes}
                        onChange={e => setNewStageNotes(e.target.value)}
                        className={`w-full text-xs p-3 rounded-xl focus:outline-none ${bgInput}`}
                        placeholder="Aşamaya ait hekim klinik notunu ve hasta uyarılarını giriniz..."
                      />
                    </div>

                    <button
                      onClick={handleAddStageToTimeline}
                      className="w-full bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black py-3 rounded-xl cursor-pointer text-xs"
                    >
                      Aşamayı Yol Haritasına Ekle
                    </button>
                  </div>
                </div>

                {/* Sağ: İlgili Hastanın Mevcut Yol Haritası (Timeline) */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-7 flex flex-col space-y-4`}>
                  <div className="border-b border-slate-700/20 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className={`text-xs font-black tracking-widest uppercase ${textTitle}`}>MEVCUT TEDAVİ YOL HARİTASI</h3>
                      <p className={`text-[10px] font-mono ${textMuted}`}>Hastanın ekranında anlık yayınlanan kronolojik tedavi planı</p>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-405 font-mono">
                      Hasta: {activePatient.name}
                    </span>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
                    {(() => {
                      const timeline = activePatient.treatmentTimeline || [
                        { id: 't-1', title: 'İlk Muayene ve Röntgen', date: '2026-05-10', status: 'done', notes: 'Genel ağız muayenesi ve panoramik röntgen çekimi tamamlandı.' },
                        { id: 't-2', title: 'Derin Diş Taşı Temizliği', date: '2026-05-15', status: 'done', notes: 'Alt ve üst çene tartar temizliği ile hassasiyet kontrolü yapıldı.' },
                        { id: 't-3', title: '26 Nolu Diş Kanal Tedavisi', date: '2026-05-25', status: 'active', notes: 'Hekim Samantha Lee tarafından kanal dolgusu ve geçici kapatma yapıldı.' },
                        { id: 't-4', title: 'Kuron (Kaplama) Restorasyonu', date: '2026-05-30', status: 'upcoming', notes: 'Kalıcı estetik zirkonyum kaplama ölçüsü alınacak.' }
                      ];

                      return (
                        <div className="space-y-3">
                          {timeline.map((stage: any, idx: number) => (
                            <div key={stage.id || idx} className={`p-4 rounded-xl border leading-relaxed font-semibold transition-all relative ${isDark ? 'bg-[#0f192b]/60 border-indigo-500/10' : 'bg-slate-50 border-slate-200'
                              }`}>

                              <button
                                onClick={() => handleDeleteStageFromTimeline(stage.id)}
                                className="absolute top-4 right-4 text-rose-500 hover:text-rose-600 cursor-pointer"
                                title="Aşamayı Kaldır"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                              <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-700/10">
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{stage.date}</span>
                                  <span className={`text-[9px] font-black uppercase text-white px-2 py-0.5 rounded ${stage.status === 'done' ? 'bg-emerald-500' :
                                    stage.status === 'active' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-500'
                                    }`}>
                                    {stage.status === 'done' ? 'Yapıldı' : stage.status === 'active' ? 'Etkin' : 'Gelecek'}
                                  </span>
                                </div>
                              </div>
                              <h4 className="text-sm font-black mb-1 text-indigo-400">{stage.title}</h4>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium`}>{stage.notes}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 8: YAPAY ZEKA KLİNİK CO-PILOT ("hekim için ai asistan") */}
          {activeMenu === 'Tedavi & Teşhis Masası' && activePatient && activeWorkspaceSubTab === 'Yapay Zeka Asistanı' && (
            <div className="space-y-6 animate-fadeIn">
              {renderTeTeMasasiHeader()}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Sol: Co-Pilot Sohbet Arayüzü */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-8 flex flex-col h-[480px] justify-between`}>

                  <div className="border-b border-slate-700/20 pb-3 flex items-center space-x-3 text-indigo-400">
                    <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
                      <Sparkles className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-widest uppercase text-white">INTELLIGENT DENTAL CO-PILOT (AI)</h3>
                      <p className="text-[10px] text-slate-500 font-mono">Klinik radyoloji tanıma, segmentasyon ve reçete akıllı asistanı</p>
                    </div>
                  </div>

                  {/* Sohbet Logları */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 my-3 rounded-xl bg-slate-950/40 border border-slate-800">
                    {chatLogs.map((log, idx) => (
                      <div key={idx} className={`flex ${log.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-xs font-semibold leading-relaxed ${log.sender === 'user'
                          ? 'bg-indigo-500 text-slate-950 rounded-tr-none'
                          : 'bg-slate-800/80 border border-indigo-500/10 text-slate-200 rounded-tl-none'
                          }`}>
                          <p>{log.text}</p>
                          <span className="text-[9px] text-slate-500 font-mono block text-right mt-1.5">{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Soru Giriş Alanı */}
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="text"
                      value={chatInp}
                      onChange={e => setChatInp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChatOption()}
                      className={`flex-1 text-xs font-semibold p-3 rounded-xl focus:outline-none ${bgInput}`}
                      placeholder="Heim asistanına klinik soru veya vaka kodu yönlendirin..."
                    />
                    <button
                      onClick={handleSendChatOption}
                      className="bg-indigo-500 hover:bg-indigo-600 text-slate-950 p-3 rounded-xl font-black transition-all cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>

                </div>

                {/* Sağ: Önerilen Akıllı Sorular / Hekim Hazır Promptları */}
                <div className={`${bgCard} border rounded-2xl p-5 lg:col-span-4 space-y-4`}>

                  <div className="border-b border-slate-705/20 pb-2">
                    <span className="text-[10px] font-mono font-black text-indigo-400 block tracking-widest uppercase">AKILLI REFERANSLAR</span>
                    <h3 className={`text-xs font-black truncate mt-1 ${textTitle}`}>HAZIR KLİNİK PROMPTLAR</h3>
                  </div>

                  <div className="space-y-2.5 text-xs font-bold leading-relaxed">
                    {[
                      { query: "36 nolu diş (Alt Sol) için risk analizi yap", icon: '🦷' },
                      { query: "Aktif hastanın genel alerji ve klinik geçmişini getir", icon: '📋' },
                      { query: "Peri-implantitis enfeksiyon riski için antibiyotik kılavuzları nelerdir?", icon: '🩹' },
                      { query: "Radyolojide saptanan segmental anormalliklerin riskini derecelendir", icon: '🩻' }
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setChatInp(p.query);
                          appendLog('Presentation (UI)', 'Hazır Prompt Tıklandı', `Prompt: "${p.query}"`);
                        }}
                        className={`w-full p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all text-[11px] ${isDark ? 'bg-[#101b2c] border-indigo-500/10 hover:border-indigo-400/30' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm'
                          }`}
                      >
                        <span className="text-sm">{p.icon}</span>
                        <span className="text-slate-350 hover:text-indigo-450">{p.query}</span>
                      </button>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 5: PROFİLİM */}
          {activeMenu === 'Profilim' && (
            <SharedProfile
              doctorProfile={doctorProfile}
              handleProfileFieldChange={handleProfileFieldChange}
              currentUser={currentUser}
              clinicId={clinicId}
              showProfileSuccess={showProfileSuccess}
              setShowProfileSuccess={setShowProfileSuccess}
              appendLog={appendLog}
              bgCard={bgCard}
              textTitle={textTitle}
              textMuted={textMuted}
              bgInput={bgInput}
              currentClinic={currentClinic}
              isDark={isDark}
              setDoctorProfile={setDoctorProfile}
              patientsList={patientsList}
              appointmentsList={appointmentsList}
              doctorTasks={doctorTasks}
            />
          )}

          {/* TELEMETRİ / BULUT BAĞLANTISI TABAN FOOTER */}
          {!hideSidebar && (
            <footer className={`h-9 ${bgSidebar} px-6 flex items-center justify-between text-[10px] text-slate-520 shrink-0 font-mono border-t ${borderLine} transition-colors duration-200`}>
            <div className="flex items-center space-x-3 font-semibold">
              <span className="flex items-center gap-1.5 font-bold text-indigo-500">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 block animate-pulse"></span>
                TÜRKİYE DENTAL E-SAĞLIK / DENTS-AI TELEMETRİ BULUT BAĞLANTISI ETKİN
              </span>
              <span>•</span>
              <span>DİŞASİSTANIM v4.0</span>
            </div>
            <div>
              <span className="font-semibold">© 2026 Dents AI • DişAsistanım Premium Entegrasyon</span>
            </div>
          </footer>
          )}

        </main>

      </div>

    </div>
  );
}
