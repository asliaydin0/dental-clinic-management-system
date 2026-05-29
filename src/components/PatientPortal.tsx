import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Calendar,
  Clock,
  Sparkles,
  Camera,
  Upload,
  CheckCircle,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageSquare,
  Bell,
  Award,
  Bot,
  Send,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  User,
  LogOut,
  MapPin,
  Check,
  RotateCcw,
  AlertCircle,
  Sun,
  Moon,
  Phone,
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { ToothDetails, BrushingLog, AnalysisFile, ToothStatus, TreatmentType } from '../types';
import { BRUSHING_STEPS } from '../data';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PatientPortalProps {
  onExit: () => void;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  currentUser: any;
}

interface TreatmentStage {
  id: string;
  title: string;
  date: string;
  status: 'done' | 'active' | 'upcoming';
  notes: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface CustomToast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

import { useToast } from './ui/ToastContext';

export default function PatientPortal({
  onExit,
  theme,
  setTheme,
  currentUser
}: PatientPortalProps) {
  const isDark = theme === 'dark';
  const toast = useToast();

  // Patient specific states
  const [teeth, setTeeth] = useState<ToothDetails[]>([]);
  const [brushingLogs, setBrushingLogs] = useState<BrushingLog[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisFile[]>([]);
  const [upcomingApp, setUpcomingApp] = useState<any>(null);

  // Brushing Timer States
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic for brushing
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTimerActive(false);
            finishBrushingSession();
            return 0;
          }
          if (soundEnabled && prev % 15 === 0) {
            console.log("Sector finished beep!");
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, soundEnabled]);

  // Handle sector steps progression
  useEffect(() => {
    const elapsed = 120 - timeLeft;
    const step = Math.min(Math.floor(elapsed / 15), BRUSHING_STEPS.length - 1);
    setCurrentStepIndex(step >= 0 ? step : 0);
  }, [timeLeft]);

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(120);
    setCurrentStepIndex(0);
  };

  const finishBrushingSession = () => {
    const newLog = {
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      duration: 120,
      completed: true,
      score: Math.floor(Math.random() * 15) + 85 // high rating for completion
    };
    saveBrushingLogToBackend(newLog);
    toast.success("Tebrikler! 2 Dakikalık Diş Fırçalama Seansını Başarıyla Tamamladınız.");
    setTimeLeft(120);
    setCurrentStepIndex(0);
  };

  const deleteBrushingLog = async (id: string) => {
    // Delete log locally or through API if needed. Let's just filter it locally or send delete request
    setBrushingLogs(prev => prev.filter(l => l.id !== id));
  };

  // Synchronized Medical Record (Initialized to null)
  const [patientRecord, setPatientRecord] = useState<any>(null);

  const userName = patientRecord?.name || currentUser?.name || '';

  // Navigation tabs (cohesive 5-tab model to include brushing)
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'analysis' | 'brushing' | 'profile'>('home');
  const [toasts, setToasts] = useState<CustomToast[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  // Profile Edit Fields States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(patientRecord?.name || '');
  const [editPhone, setEditPhone] = useState(patientRecord?.phone || '');
  const [editEmail, setEditEmail] = useState(patientRecord?.email || '');
  const [editDob, setEditDob] = useState(patientRecord?.dob || '');
  const [editBloodType, setEditBloodType] = useState(patientRecord?.bloodType || '');
  const [editAllergies, setEditAllergies] = useState(patientRecord?.allergies || '');

  // Brushing Habit Creator States
  const [showBrushingForm, setShowBrushingForm] = useState(false);
  const [newBrushDuration, setNewBrushDuration] = useState(120); // seconds (2 min)
  const [newBrushPeriod, setNewBrushPeriod] = useState<'Sabah' | 'Öğlen' | 'Akşam' | 'Gece'>('Sabah');
  const [flossUsed, setFlossUsed] = useState(true);
  const [tongueBrushed, setTongueBrushed] = useState(true);

  // Sync edit states on patientRecord loaded/updated
  useEffect(() => {
    if (patientRecord) {
      setEditName(patientRecord.name || '');
      setEditPhone(patientRecord.phone || '');
      setEditEmail(patientRecord.email || '');
      setEditDob(patientRecord.dob || '');
      setEditBloodType(patientRecord.bloodType || '');
      setEditAllergies(patientRecord.allergies || '');
    }
  }, [patientRecord]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newToast: CustomToast = {
      id: 'toast_' + Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4000);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      triggerToast("Lütfen geçerli bir isim giriniz.", "warning");
      return;
    }

    try {
      const payload = {
        name: editName,
        email: editEmail,
        phone_number: editPhone || null,
        tc_no: patientRecord?.tcNo || '',
        gender: patientRecord?.gender || 'Kadın',
        dob: editDob,
        blood_type: editBloodType || null,
        allergies: editAllergies || null,
        avatar_url: patientRecord?.avatarUrl || null,
        recommended_treatment: patientRecord?.recommendedTreatment || null,
        primary_dentist_id: patientRecord?.primaryDentistId || null,
        treatment_status: patientRecord?.treatmentStatus || 'Tedavide'
      };

      const response = await fetch(`http://localhost:8000/patients/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        const errMsg = errData.detail || "Profil güncellenirken bir hata oluştu.";
        triggerToast(errMsg, "warning");
        return;
      }

      await fetchPatientData();
      setIsEditing(false);
      triggerToast("Profil kartınız başarıyla güncellendi!", "success");
    } catch (err) {
      console.error("Profil güncellenemedi:", err);
      triggerToast("Bağlantı hatası oluştu.", "warning");
    }
  };

  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchBrushingLogs = async () => {
    try {
      const response = await fetch(`http://localhost:8000/brushing_logs/${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        const mappedLogs = data.map((l: any) => ({
          id: l.id,
          date: l.log_date,
          time: l.log_time,
          duration: l.duration_seconds,
          completed: l.completed,
          score: l.score
        }));
        setBrushingLogs(mappedLogs);
      }
    } catch (err) {
      console.error("Fırçalama günlükleri çekilemedi:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8000/patients/${currentUser.id}/notifications`);
      if (response.ok) {
        const data = await response.json();
        const mappedNotifs = data.map((n: any) => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          date: n.notification_date,
          sentBy: 'Hekiminiz',
          status: n.status
        }));
        setNotifications(mappedNotifs);
        setUnreadCount(mappedNotifs.filter((n: any) => n.status === 'Gönderildi').length);
      }
    } catch (err) {
      console.error("Bildirimler çekilemedi:", err);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await fetch(`http://localhost:8000/patients/${currentUser.id}/analyses`);
      if (response.ok) {
        const data = await response.json();
        const mappedAnalyses = data.map((a: any) => ({
          id: a.id,
          imageUrl: a.image_url,
          date: a.analysis_date,
          status: a.status,
          score: a.score,
          plaqueIndex: Number(a.plaque_index),
          cavitiesCount: a.cavities_count,
          recommendations: a.recommendations || []
        }));
        setAnalyses(mappedAnalyses);
      }
    } catch (err) {
      console.error("Analiz dosyaları çekilemedi:", err);
    }
  };

  const fetchPatientData = async () => {
    try {
      // 1. Fetch patient record
      const patientRes = await fetch(`http://localhost:8000/patients/${currentUser.id}`);
      if (!patientRes.ok) return;
      const patientData = await patientRes.json();

      // Get doctor name from the JOIN parameter
      let doctorName = patientData.primary_dentist_name || 'Dr. Samantha Lee';

      // 2. Fetch clinics to map clinic name
      let clinicName = 'DentsAI Elite Clinic';
      try {
        const clinicsRes = await fetch('http://localhost:8000/clinics/');
        if (clinicsRes.ok) {
          const clinics = await clinicsRes.json();
          const clinicObj = clinics.find((c: any) => c.id === currentUser.clinicId);
          if (clinicObj) clinicName = clinicObj.name;
        }
      } catch (err) {
        console.error("Klinik verileri çekilemedi:", err);
      }

      // 3. Fetch treatments and teeth status from DB
      let teethData: ToothDetails[] = [];
      try {
        const treatmentsRes = await fetch(`http://localhost:8000/tooth_treatments/${currentUser.id}`);
        const teethRes = await fetch(`http://localhost:8000/patients/${currentUser.id}/teeth`);
        
        if (treatmentsRes.ok && teethRes.ok) {
          const treatments = await treatmentsRes.json();
          const dbTeeth = await teethRes.json();
          
          teethData = DentalTeethCoords.map(tc => {
            let zone: 'upper-right' | 'upper-left' | 'lower-left' | 'lower-right' = 'upper-right';
            if (tc.id >= 11 && tc.id <= 18) zone = 'upper-right';
            else if (tc.id >= 21 && tc.id <= 28) zone = 'upper-left';
            else if (tc.id >= 31 && tc.id <= 38) zone = 'lower-left';
            else if (tc.id >= 41 && tc.id <= 48) zone = 'lower-right';

            const dbTooth = dbTeeth.find((t: any) => t.tooth_num === tc.id);
            const status = dbTooth ? dbTooth.status : 'healthy';
            const notes = dbTooth ? dbTooth.notes : '';

            const toothTreatments = treatments.filter((tr: any) => tr.tooth_num === tc.id);
            return {
              id: tc.id,
              name: tc.name,
              zone,
              status,
              notes,
              treatments: toothTreatments.map((tr: any) => ({
                type: tr.treatment_type,
                date: tr.treatment_date,
                description: tr.description || ''
              }))
            };
          });
          setTeeth(teethData);
        }
      } catch (err) {
        console.error("Tedavi veya diş verileri çekilemedi:", err);
      }

      // 4. Fetch treatment stages from DB
      let dbTimeline: any[] = [];
      try {
        const stagesRes = await fetch(`http://localhost:8000/patients/${currentUser.id}/treatment_stages`);
        if (stagesRes.ok) {
          const stages = await stagesRes.json();
          dbTimeline = stages.map((s: any) => ({
            id: 'stage-' + s.id,
            title: s.title,
            date: s.stage_date,
            status: s.status,
            notes: s.notes
          }));
        }
      } catch (err) {
        console.error("Tedavi aşamaları çekilemedi:", err);
      }

      // 5. Fetch upcoming appointment from DB
      try {
        const upcomingRes = await fetch(`http://localhost:8000/patients/${currentUser.id}/upcoming_appointment`);
        if (upcomingRes.ok) {
          const upcomingAppDetail = await upcomingRes.json();
          setUpcomingApp(upcomingAppDetail);
        } else {
          setUpcomingApp(null);
        }
      } catch (err) {
        console.error("Sıradaki randevu çekilemedi:", err);
        setUpcomingApp(null);
      }

      const mergedTimeline = dbTimeline.sort((a, b) => a.date.localeCompare(b.date));

      setPatientRecord({
        id: patientData.user_id,
        tcNo: patientData.tc_no,
        name: patientData.name,
        phone: patientData.phone_number,
        email: patientData.email,
        gender: patientData.gender,
        dob: patientData.dob,
        bloodType: patientData.blood_type,
        allergies: patientData.allergies,
        treatmentStatus: patientData.treatment_status,
        recommendedTreatment: patientData.recommended_treatment,
        avatarUrl: patientData.avatar_url,
        primaryDentist: doctorName,
        primaryDentistId: patientData.primary_dentist_id,
        clinicName: clinicName,
        treatmentTimeline: mergedTimeline,
        unhealthyToothCount: patientData.unhealthy_tooth_count || 0,
        averageBrushingScore: patientData.average_brushing_score || 0
      });
    } catch (err) {
      console.error("Hasta detayları çekilemedi:", err);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchPatientData();
      fetchBrushingLogs();
      fetchAnalyses();
    }
  }, [currentUser]);

  const saveBrushingLogToBackend = async (log: any) => {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      let period: 'Sabah' | 'Öğlen' | 'Akşam' | 'Gece' = 'Sabah';
      if (currentHour >= 6 && currentHour < 12) period = 'Sabah';
      else if (currentHour >= 12 && currentHour < 17) period = 'Öğlen';
      else if (currentHour >= 17 && currentHour < 22) period = 'Akşam';
      else period = 'Gece';

      const response = await fetch('http://localhost:8000/brushing_logs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient_id: currentUser.id,
          log_date: log.date,
          log_time: log.time.length === 5 ? `${log.time}:00` : log.time,
          duration_seconds: log.duration,
          completed: log.completed,
          score: log.score,
          period: log.period || period,
          floss_used: log.floss_used || false,
          tongue_brushed: log.tongue_brushed || false
        })
      });
      if (response.ok) {
        triggerToast("Diş fırçalama seansınız günlüğünüze eklendi!", "success");
        fetchBrushingLogs();
        fetchPatientData();
      } else {
        triggerToast("Seans kaydedilemedi. Sunucu hatası.", "warning");
      }
    } catch (err) {
      console.error("Fırçalama kaydı kaydedilemedi:", err);
      triggerToast("Bağlantı hatası.", "warning");
    }
  };

  // Doctor Notifications (Post-operative care rules / warning notes)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser?.id) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleMarkAllAsRead = () => {
    const updatedNotifsList = notifications.map(n => ({ ...n, status: 'Okundu' }));
    setNotifications(updatedNotifsList);
    setUnreadCount(0);
    triggerToast("Hekim bilgilendirme notları okundu olarak işaretlendi.", 'success');
  };

  // AI Chat Bot
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patientRecord && chatMessages.length === 0) {
      setChatMessages([
        {
          id: 'm-1',
          sender: 'bot',
          text: `Merhaba Sayın ${patientRecord.name}! Ben klinik yapay zeka asistanınız. Diş hekiminiz ${patientRecord.primaryDentist} ile gerçekleştirdiğiniz son tedavi seansınız, ağız içi röntgen bulgularınız veya hassasiyet semptomlarınız hakkındaki sorularınızı bana anlık iletebilirsiniz.`,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [patientRecord, chatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChatMessage = (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    if (!textToSend) setChatInput('');

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setBotTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const promptLower = messageText.toLowerCase();
      const docName = patientRecord?.primaryDentist || 'Dr. Samantha Lee';

      if (promptLower.includes('ağrı') || promptLower.includes('sızlama') || promptLower.includes('ağrıyor') || promptLower.includes('hassas')) {
        botResponse = `Kanal tedavisi sonrasındaki ilk 3 gün hafif sızlamalar, çiğnemede hassasiyet ve zonklamayan ağrılar tıbbi açıdan normaldir. Vücudun iyileşme tepkisidir. Ancak zonklayan, uykudan uyandıran sürekli bir ağrı oluşursa ${docName} ile iletişime geçmenizi öneririm.`;
      } else if (promptLower.includes('röntgen') || promptLower.includes('film') || promptLower.includes('x-ray')) {
        botResponse = `Sistemde kayıtlı aktif panoramik röntgeniniz mevcuttur. Yapay zeka modülü, seçili dişinizdeki kanal dolgusunda sızıntı olmadığını doğrulamıştır. Arayüz fırçalamanın artırılması tavsiye edilmektedir.`;
      } else if (promptLower.includes('fırçalama') || promptLower.includes('temizlik') || promptLower.includes('macun')) {
        botResponse = `Geçici dolgunuzun zarar görmemesi için dişlerinizi fırçalarken dairesel ve yumuşak darbeler kullanın. Florürlü diş macunu kullanmanız mine bütünlüğünü korumaya ve hassasiyeti azaltmaya yardımcı olacaktır.`;
      } else if (promptLower.includes('kaplama') || promptLower.includes('zirkonyum') || promptLower.includes('kron')) {
        botResponse = `Kanal tedaviniz başarıyla tamamlandığı için planlanan seansınızda estetik zirkonyum kaplama ölçünüz alınacaktır. O zamana dek geçici dolgulu dişe aşırı yük bindirecek kuru yemiş veya yapışkan gıdalardan kaçınınız.`;
      } else {
        botResponse = `Klinik geçmişinizi incelediğimde, ${docName} gözetiminde olan tedavinizin başarıyla sürdüğünü görüyorum. Geçici dolgunuzun sert ve yapışkan yiyeceklerle temas etmemesine dikkat ediniz. Başka yardımcı olabileceğim bir konu var mıdır?`;
      }

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
      setBotTyping(false);
    }, 1200);
  };

  // AI Visual Scanning States
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosticsImage, setDiagnosticsImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected tooth on Interactive Map (FDI 32 Teeth System)
  const [selectedToothId, setSelectedToothId] = useState<number | null>(26); // default to 26 which is under active treatment
  const selectedToothInfo = teeth.find(t => t.id === selectedToothId) || null;

  const getToothSVGPath = (id: number, isUpper: boolean) => {
    const digit = id % 10;
    if (digit >= 6) {
      return isUpper
        ? "M 6,5 C 6,2 10,2 17,2 C 24,2 28,2 28,5 C 31,10 32,20 30,36 C 28,42 22,44 17,44 C 12,44 6,42 4,36 C 2,20 3,10 6,5 Z"
        : "M 6,43 C 6,46 10,46 17,46 C 24,46 28,46 28,43 C 31,38 32,28 30,12 C 28,6 22,4 17,4 C 12,4 6,6 4,12 C 2,28 3,38 6,43 Z";
    }
    if (digit === 4 || digit === 5) {
      return isUpper
        ? "M 7,6 C 9,3 15,3 15,3 C 15,3 21,3 23,6 C 25,12 26,22 24,36 C 22,41 18,43 15,43 C 12,43 8,41 6,36 C 4,22 5,12 7,6 Z"
        : "M 7,42 C 9,45 15,45 15,45 C 15,45 21,45 23,42 C 25,36 26,26 24,12 C 22,7 18,5 15,5 C 12,5 8,7 6,12 C 4,26 5,36 7,42 Z";
    }
    if (digit === 3) {
      return isUpper
        ? "M 13,2 C 18,2 23,10 23,18 C 23,28 21,36 19,42 C 18,44 13,45 13,45 C 13,45 8,44 7,42 C 5,36 3,28 3,18 C 3,10 8,2 13,2 Z"
        : "M 13,46 C 18,46 23,38 23,30 C 23,20 21,12 19,6 C 18,4 13,3 13,3 C 13,3 8,4 7,6 C 5,12 3,20 3,30 C 3,38 8,46 13,46 Z";
    }
    return isUpper
      ? "M 6,5 L 20,5 C 22,8 21,24 19,38 C 19,40 16,41 13,41 C 10,41 7,40 7,38 C 5,24 4,8 6,5 Z"
      : "M 6,43 L 20,43 C 22,40 21,24 19,10 C 19,8 16,7 13,7 C 10,7 7,8 7,10 C 5,24 4,40 6,43 Z";
  };

  const renderPatientTooth = (id: number, isUpper: boolean) => {
    const toothInfo = teeth.find(t => t.id === id) || { status: 'healthy' as ToothStatus, name: 'Tanımsız', notes: '' };
    const isSelected = selectedToothId === id;
    const digit = id % 10;
    
    let w = 20;
    let h = 44;
    if (digit >= 6) { w = 32; h = 48; }
    else if (digit === 4 || digit === 5) { w = 26; h = 46; }
    else if (digit === 3) { w = 22; h = 46; }

    let fillClass = 'fill-emerald-500';
    let animateClass = '';
    if (toothInfo.status === 'risk') {
      fillClass = 'fill-rose-500';
      animateClass = 'animate-pulse';
    } else if (toothInfo.status === 'treatment') {
      fillClass = 'fill-amber-500';
    } else if (toothInfo.status === 'completed') {
      fillClass = 'fill-indigo-500';
    }

    const path = getToothSVGPath(id, isUpper);

    return (
      <div key={id} className="flex flex-col items-center space-y-1">
        {isUpper && (
          <span className={`text-[9px] font-mono font-black ${isSelected ? 'text-indigo-500 font-extrabold dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
            {id}
          </span>
        )}
        <button
          onClick={() => {
            setSelectedToothId(id);
            triggerToast(`Diş #${id} seçildi, işlem geçmişi yükleniyor...`, "success");
          }}
          className={`relative focus:outline-none transition-all duration-200 cursor-pointer ${isSelected ? 'scale-115 z-10' : 'hover:scale-108 hover:z-10'}`}
          title={`Diş #${id} - ${toothInfo.name || 'Tanımsız'}`}
          style={{ width: `${w}px`, height: `${h}px` }}
        >
          <svg
            viewBox={`0 0 ${w + 8} ${h + 8}`}
            className="w-full h-full animate-fadeIn"
            style={{ overflow: 'visible' }}
          >
            <path
              d={path}
              className={`${fillClass} ${animateClass} transition-all duration-300`}
              stroke={isSelected ? 'var(--color-clinic-accent, #6366f1)' : (isDark ? '#334155' : '#cbd5e1')}
              strokeWidth={isSelected ? 3 : 1.5}
              style={isSelected ? { filter: 'drop-shadow(0 0 6px var(--color-clinic-accent, #6366f1))' } : undefined}
            />
            {digit >= 4 && (
              <path
                d={`M ${w/2},${h/3} L ${w/2},${2*h/3}`}
                stroke={isDark ? '#1e293b' : '#94a3b8'}
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={0.6}
              />
            )}
          </svg>
        </button>
        {!isUpper && (
          <span className={`text-[9px] font-mono font-black ${isSelected ? 'text-indigo-500 font-extrabold dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
            {id}
          </span>
        )}
      </div>
    );
  };

  // FDI Coordinates for anatomical teeth matrix rendering
  const DentalTeethCoords = [
    // Maxilla (Üst Çene) - 18'den 11'e, 21'den 28'e
    { id: 18, name: "Üst Sağ Yirmilik", x: 40, y: 70, zone: 'upper-right' },
    { id: 17, name: "Üst Sağ 2. Azı", x: 67, y: 58, zone: 'upper-right' },
    { id: 16, name: "Üst Sağ 1. Azı", x: 96, y: 48, zone: 'upper-right' },
    { id: 15, name: "Üst Sağ 2. Küçük Azı", x: 125, y: 40, zone: 'upper-right' },
    { id: 14, name: "Üst Sağ 1. Küçük Azı", x: 155, y: 35, zone: 'upper-right' },
    { id: 13, name: "Üst Sağ Köpek Dişi", x: 185, y: 32, zone: 'upper-right' },
    { id: 12, name: "Üst Sağ Yan Kesici", x: 214, y: 30, zone: 'upper-right' },
    { id: 11, name: "Üst Sağ Orta Kesici", x: 243, y: 30, zone: 'upper-right' },

    { id: 21, name: "Üst Sol Orta Kesici", x: 277, y: 30, zone: 'upper-left' },
    { id: 22, name: "Üst Sol Yan Kesici", x: 306, y: 30, zone: 'upper-left' },
    { id: 23, name: "Üst Sol Köpek Dişi", x: 335, y: 32, zone: 'upper-left' },
    { id: 24, name: "Üst Sol 1. Küçük Azı", x: 365, y: 35, zone: 'upper-left' },
    { id: 25, name: "Üst Sol 2. Küçük Azı", x: 395, y: 40, zone: 'upper-left' },
    { id: 26, name: "Üst Sol 1. Azı (Kanal/Dolgu)", x: 424, y: 48, zone: 'upper-left' },
    { id: 27, name: "Üst Sol 2. Azı", x: 453, y: 58, zone: 'upper-left' },
    { id: 28, name: "Üst Sol Yirmilik", x: 480, y: 70, zone: 'upper-left' },

    // Mandibula (Alt Çene) - 48'den 41'e, 31'den 38'e
    { id: 48, name: "Alt Sağ Yirmilik", x: 40, y: 150, zone: 'lower-right' },
    { id: 47, name: "Alt Sağ 2. Azı", x: 67, y: 162, zone: 'lower-right' },
    { id: 46, name: "Alt Sağ 1. Azı", x: 96, y: 172, zone: 'lower-right' },
    { id: 45, name: "Alt Sağ 2. Küçük Azı", x: 125, y: 180, zone: 'lower-right' },
    { id: 44, name: "Alt Sağ 1. Küçük Azı", x: 155, y: 185, zone: 'lower-right' },
    { id: 43, name: "Alt Sağ Köpek Dişi", x: 185, y: 188, zone: 'lower-right' },
    { id: 42, name: "Alt Sağ Yan Kesici", x: 214, y: 190, zone: 'lower-right' },
    { id: 41, name: "Alt Sağ Orta Kesici", x: 243, y: 190, zone: 'lower-right' },

    { id: 31, name: "Alt Sol Orta Kesici", x: 277, y: 190, zone: 'lower-left' },
    { id: 32, name: "Alt Sol Yan Kesici", x: 306, y: 190, zone: 'lower-left' },
    { id: 33, name: "Alt Sol Köpek Dişi", x: 335, y: 188, zone: 'lower-left' },
    { id: 34, name: "Alt Sol 1. Küçük Azı", x: 365, y: 185, zone: 'lower-left' },
    { id: 35, name: "Alt Sol 2. Küçük Azı", x: 395, y: 180, zone: 'lower-left' },
    { id: 36, name: "Alt Sol 1. Azı", x: 424, y: 172, zone: 'lower-left' },
    { id: 37, name: "Alt Sol 2. Azı", x: 453, y: 162, zone: 'lower-left' },
    { id: 38, name: "Alt Sol Yirmilik", x: 480, y: 150, zone: 'lower-left' },
  ];

  // Stats calculation
  const timelineStages: TreatmentStage[] = patientRecord?.treatmentTimeline || [];
  const completedStagesList = timelineStages.filter(s => s.status === 'done');
  const activeStage = timelineStages.find(s => s.status === 'active');
  const progressPercent = timelineStages.length > 0
    ? Math.round((completedStagesList.length / timelineStages.length) * 100)
    : 75;

  // File analysis handler
  const triggerImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          startDiagnosticScan(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startDiagnosticScan = (imgUrl: string) => {
    setDiagnosticsImage(imgUrl);
    setAnalyzing(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const pIndex = Math.floor(Math.random() * 8) + 5;
      const cCount = Math.random() > 0.5 ? 1 : 0;
      const scoreValue = Math.max(78, 100 - pIndex - (cCount * 6));

      const newAnalysis: AnalysisFile = {
        id: 'analysis_' + Date.now(),
        imageUrl: imgUrl,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        score: Math.round(scoreValue),
        plaqueIndex: pIndex,
        cavitiesCount: cCount,
        recommendations: [
          `Lokal Plaque Katsayısı: %${pIndex} (Oldukça temiz, güvenli aralıkta)`,
          cCount > 0
            ? "Molar oklüzal bölgede başlangıç seviyesi hafif mineralizasyon kaybı."
            : "Yeni veya aktif derin çürük oluşumu saptanmamıştır.",
          "Alt ön kesici dişlerin iç yüzeylerinde fırçalama süresini biraz daha uzatmanız önerilir."
        ]
      };

      setAnalyses(prev => [newAnalysis, ...prev]);
      setAnalysisResult(newAnalysis);
      setAnalyzing(false);
      triggerToast("Yapay zeka analiz raporu başarıyla hazırlandı!", 'success');
    }, 2500);
  };

  const runDemoScan = () => {
    const demoUrl = "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400";
    startDiagnosticScan(demoUrl);
  };

  // Cohesive styling variables to match Doctor and Admin portals perfectly
  const bgMain = isDark ? 'bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-700';
  const bgCard = isDark ? 'bg-[#0e1626] border-[#1e293b]' : 'bg-white border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)] rounded-2xl transition-all duration-300';
  const textTitle = isDark ? 'text-white' : 'text-slate-900 font-extrabold';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500 font-semibold';
  const borderLine = isDark ? 'border-[#1e293b]' : 'border-slate-100/80';
  const bgInput = isDark ? 'bg-[#090d16] border-[#223049] text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200/80 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all duration-300';

  // Gather dental history / treatments of all teeth
  const allTeethTreatments = teeth
    .flatMap(t => t.treatments.map(tr => ({
      toothId: t.id,
      toothName: t.name,
      ...tr
    })))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Dynamic stats & selections
  const unhealthyCount = patientRecord?.unhealthyToothCount ?? 0;
  const dentalHealthScore = Math.round(((32 - unhealthyCount) / 32) * 100);

  let healthScoreLabel = 'Mükemmel';
  if (dentalHealthScore < 60) healthScoreLabel = 'Takip Gerekli';
  else if (dentalHealthScore < 70) healthScoreLabel = 'Orta';
  else if (dentalHealthScore < 80) healthScoreLabel = 'İyi';
  else if (dentalHealthScore < 90) healthScoreLabel = 'Harika';



  const latestNotification = notifications.length > 0 ? notifications[0] : null;

  if (!patientRecord) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgMain}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-550 border-indigo-500 mx-auto"></div>
          <p className="text-xs font-semibold text-slate-400">Hasta Bilgileri Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${bgMain} transition-colors duration-200 antialiased relative`}>

      {/* Decorative Blur Ambient Elements */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Interactive Floating Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`p-4 rounded-xl shadow-2xl flex items-start gap-3 border ${toast.type === 'success' ? 'bg-[#0e1626]/95 text-emerald-400 border-emerald-500/40' :
                toast.type === 'warning' ? 'bg-[#0e1626]/95 text-amber-500 border-amber-500/40' :
                  'bg-[#0e1626]/95 text-indigo-400 border-indigo-500/40'
                } backdrop-blur-md`}
              id={toast.id}
            >
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold leading-relaxed text-slate-200">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* PROFESSIONAL NAVBAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${isDark ? 'bg-[#090d16]/90 border-slate-900/80' : 'bg-white/90 border-slate-150'} transition-all shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">

          <div onClick={() => setActiveTab('home')} className="flex items-center space-x-3 cursor-pointer group">
            <div className="bg-gradient-to-tr from-indigo-500 to-sky-400 p-2 rounded-xl text-white shadow shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-black tracking-wider uppercase ${textTitle}`}>DentsAI</span>
              <span className="text-[10px] text-slate-400 leading-none">Interaktif Hasta Portalı</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'home', label: 'HASTA ÖZETİ', icon: Activity },
              { id: 'map', label: 'DİŞ HARİTAM', icon: ClipboardList },
              { id: 'analysis', label: 'AI TEŞHİS', icon: Bot },
              { id: 'brushing', label: 'FIRÇALAMA REHBERİ', icon: Clock },
              { id: 'profile', label: 'PROFiLiM', icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer relative ${isSelected
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                  id={`nav-tab-${tab.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Area Controls */}
          <div className="flex items-center space-x-3">

            {/* Physicians Post-Op Messages Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className={`p-2.5 rounded-xl border transition-all relative cursor-pointer ${isDark ? 'bg-[#0e1626] border-[#1e293b] text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 shadow-sm'
                  }`}
                title="Hekim Bildirimleri"
                id="btn-nav-notifications"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 h-4.5 w-4.5 rounded-full text-[9px] font-extrabold text-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotificationsDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotificationsDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      className={`absolute right-0 mt-3 w-80 rounded-2xl border shadow-2xl z-40 p-4 ${isDark ? 'bg-[#0e1626] border-[#1e293b] text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      id="notifications-dropdown"
                    >
                      <div className="flex items-center justify-between border-b pb-2 mb-2.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-indigo-500" />
                          Hekim Bildirimleri
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer"
                          >
                            Okundu İşaretle
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 rounded-xl text-[11px] border leading-relaxed ${notif.status === 'Gönderildi'
                                ? 'bg-indigo-500/10 border-indigo-500/35'
                                : isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                                }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-extrabold text-xs text-indigo-450 text-indigo-500">{notif.title}</span>
                                <span className="text-[9px] text-slate-500 font-mono">{notif.date.split(' ')[0]}</span>
                              </div>
                              <p className="text-slate-400 text-[10.5px] leading-relaxed">{notif.message}</p>
                              <span className="text-[9.5px] text-teal-500 block mt-1 font-bold">Doktor: {notif.sentBy}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-4 text-xs text-slate-500">Yeni bildirim bulunmuyor.</p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isDark ? 'bg-[#0e1626] border-[#1e293b] text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-700 hover:text-indigo-600 shadow-sm'
                }`}
              title="Açık/Koyu Tema Değiştir"
              id="theme-toggle"
            >
              {isDark ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
            </button>

            {/* Secure Exit button */}
            <button
              onClick={onExit}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${isDark
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 hover:bg-rose-500/20'
                : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'
                }`}
              id="exit-button"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Güvenli Çıkış</span>
            </button>

          </div>
        </div>
      </header>

      {/* DETAILED ACTIVE COMPONENT VIEWS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">

          {/* TAB 1: ANA SAYFA & TEDAVİ SÜRECİM */}
          {activeTab === 'home' && (
            <motion.div
              key="panel-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Patient Welcome Header Card */}
              <div className={`${bgCard} border p-6 flex flex-col md:flex-row items-center justify-between gap-6`}>
                <div className="flex items-center space-x-5">
                  <div className="h-14 w-14 bg-gradient-to-tr from-indigo-500 to-teal-400 text-white font-black rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
                    {userName ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SA'}
                  </div>
                  <div className="space-y-1 text-center md:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
                      <h1 className={`text-xl font-bold ${textTitle}`}>Hoş Geldiniz, {userName}</h1>
                      <span className="text-[9.5px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider self-center">
                        Hasta No: #{patientRecord?.id}
                      </span>
                    </div>
                    <p className={`text-xs ${textMuted}`}>
                      Aktif Tedavi Görülen Klinik: <span className="text-indigo-400 font-bold">{patientRecord?.clinicName || 'DentsAI Elite Clinic'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('analysis')}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    id="welcome-ai-room"
                  >
                    <Bot className="h-4 w-4" />
                    <span>Yapay Zeka Analiz Odası</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('map')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    id="welcome-map"
                  >
                    <ClipboardList className="h-4 w-4 text-indigo-500" />
                    <span>Diş Durumlarım</span>
                  </button>
                </div>
              </div>

              {/* Bilgilendirici Genel Durum ve Ağız Sağlığı Özeti (Bento Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* WIDGET 1: Genel Diş Sağlık Durumu */}
                <div className={`${bgCard} border p-5 flex flex-col justify-between space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      ÇENE SAĞLIK SKORU
                    </span>
                    <Activity className="h-4.5 w-4.5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>%{dentalHealthScore}</span>
                      <span className="text-xs text-emerald-500 font-bold">{healthScoreLabel}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style={{ width: `${dentalHealthScore}%` }}></div>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    AI röntgen analiziniz ve tedavi süreçlerinize göre hesaplanan ağırlık skoru.
                  </p>
                </div>

                {/* WIDGET 2: FDI Diş Yapısı Dağılımı */}
                <div
                  onClick={() => setActiveTab('map')}
                  className={`${bgCard} border p-5 flex flex-col justify-between space-y-3 cursor-pointer group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      DİŞ SAĞLIĞI ANALİZİ
                    </span>
                    <ClipboardList className="h-4.5 w-4.5 text-emerald-500 group-hover:scale-115 transition-transform" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mt-1">
                    <div className="p-1 px-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <span className="text-base font-extrabold text-emerald-500 block">{teeth.filter(t => t.status === 'healthy').length}</span>
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">Sağlam</span>
                    </div>
                    <div className="p-1 px-2 bg-rose-500/10 rounded-lg border border-rose-500/20 animate-pulse">
                      <span className="text-base font-extrabold text-rose-500 block">
                        {patientRecord?.unhealthyToothCount !== undefined && patientRecord?.unhealthyToothCount !== null
                          ? patientRecord.unhealthyToothCount
                          : teeth.filter(t => t.status === 'risk' || t.status === 'treatment').length}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">Riskli</span>
                    </div>
                    <div className="p-1 px-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <span className="text-base font-extrabold text-amber-500 block">{teeth.filter(t => t.status === 'treatment').length}</span>
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">Tedavi</span>
                    </div>
                    <div className="p-1 px-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                      <span className="text-base font-extrabold text-indigo-400 block">{teeth.filter(t => t.status === 'completed').length}</span>
                      <span className="text-[9px] text-slate-400 block font-bold leading-none">Bitmiş</span>
                    </div>
                  </div>
                  <p className="text-[9.5px] text-indigo-400 font-semibold text-center hover:underline self-center mt-1">
                    FDI detay şemasını gör &rarr;
                  </p>
                </div>

                {/* WIDGET 3: Fırçalama Disiplini Karnesi */}
                <div className={`${bgCard} border p-5 flex flex-col justify-between space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      FIRÇALAMA ALIŞKANLIĞI
                    </span>
                    <Award className="h-4.5 w-4.5 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {patientRecord?.averageBrushingScore !== undefined && patientRecord?.averageBrushingScore !== null && patientRecord?.averageBrushingScore > 0
                          ? Math.round(patientRecord.averageBrushingScore)
                          : (brushingLogs.length > 0
                            ? Math.round(brushingLogs.reduce((acc, curr) => acc + curr.score, 0) / brushingLogs.length)
                            : 85)}
                        /100
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">Ortalama</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-semibold">
                      <span>Kayıtlar: {brushingLogs.length} Seans</span>
                      <span>Orta. Süre: {
                        brushingLogs.length > 0
                          ? Math.round(brushingLogs.reduce((acc, curr) => acc + curr.duration, 0) / brushingLogs.length)
                          : 120
                      }sn</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-slate-400 leading-normal">
                    Fırçalama sıklığı ve süresinin ağız hijyen puanı üzerindeki etkisi mükemmel.
                  </p>
                </div>

                {/* WIDGET 4: Gelecek Klinik Planı / Randevu */}
                <div className={`${bgCard} border p-5 flex flex-col justify-between space-y-4`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      SIRADAKİ RANDEVU
                    </span>
                    <Calendar className="h-4.5 w-4.5 text-rose-500" />
                  </div>
                  {upcomingApp ? (
                    <>
                      <div>
                        <div className="space-y-0.5">
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} block truncate`}>
                            {upcomingApp.appointment_type}
                          </span>
                          <span className="text-rose-500 font-mono text-[11px] block font-extrabold flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 inline" /> {upcomingApp.appointment_date} @ {upcomingApp.appointment_time}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        {patientRecord?.primaryDentist || 'Hekiminiz'} ile {patientRecord?.clinicName || 'Klinik Şubesinde'} randevunuz planlanmıştır.
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
                      <AlertCircle className="h-8 w-8 text-slate-400 dark:text-slate-600" />
                      <span className={`text-xs font-bold ${isDark ? 'text-slate-450' : 'text-slate-550 text-slate-500'}`}>
                        Yaklaşan randevunuz bulunmuyor
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* DEVAM EDEN TEDAVİ DURUMU & İNTERAKTİF YOL HARİTASI */}
              {(patientRecord?.treatmentStatus === 'Tedavide' || patientRecord?.isActive) && (
                <div className={`${bgCard} border p-6 transition-all duration-300 ${showRoadmap ? 'space-y-6 ring-1 ring-indigo-500/20' : 'space-y-0 hover:border-indigo-500/40 hover:border-indigo-500/30'}`}>

                  {/* Collapsed/Expanded Toggle Trigger Header */}
                  <div
                    onClick={() => setShowRoadmap(!showRoadmap)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none group"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider block w-fit">
                          DEVAM EDEN TEDAVİ
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold font-mono">
                          {patientRecord?.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm sm:text-base font-bold ${textTitle} group-hover:text-indigo-400 transition-colors`}>
                          {patientRecord?.recommendedTreatment || 'Kanal Tedavisi Restorasyonu & Takip'}
                        </h3>
                      </div>

                      {!showRoadmap && (
                        <p className={`text-[11.5px] ${textMuted} tracking-tight font-medium`}>
                          Tedavi seyrini, tamamlanan aşamaları ve yol haritası aşamalarını görmek için <span className="text-indigo-400 font-bold hover:underline">tıklayarak detayları açın</span>.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      {/* Compact Progress gauge */}
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-400">
                          <Award className="h-4 w-4 text-emerald-500" />
                          <span>Tedavi İlerlemesi: %{progressPercent}</span>
                        </div>
                        <div className="w-28 sm:w-36 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-indigo-500 to-emerald-450 h-full rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                        {showRoadmap ? (
                          <ChevronUp className="h-4 w-4 text-indigo-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Roadmap Timeline section */}
                  {showRoadmap && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-6 pt-5 border-t border-slate-500/10"
                    >
                      {/* Interactive breakdown panel of: what is done, current stage, and upcoming steps */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pb-2">

                        {/* Box 1: ŞU ANA KADAR NELER YAPILDI */}
                        <div className="p-4 bg-[#2cbd85]/5 dark:bg-[#2cbd85]/10 rounded-xl border border-emerald-500/15">
                          <span className="text-[10px] text-[#2cbd85] font-bold block tracking-widest uppercase mb-1.5 font-mono">
                            TAMAMLANAN İŞLEMLER
                          </span>
                          <span className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'} block`}>
                            {timelineStages.filter(s => s.status === 'done').length} Adım Gerçekleşti
                          </span>
                          <p className={`text-[11px] ${textMuted} leading-normal mt-1`}>
                            Klinik teşhisleri, temizlik ve ilk anestezi seansları başarıyla onaylandı.
                          </p>
                        </div>

                        {/* Box 2: EN SON/AKTİF HANGİ AŞAMADA */}
                        <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/15">
                          <span className="text-[10px] text-amber-500 font-bold block tracking-widest uppercase mb-1.5 font-mono">
                            ŞU ANKİ AKTİF AŞAMA
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-amber-500 block truncate">
                            {timelineStages.find(s => s.status === 'active')?.title || 'Devam Eden Seans'}
                          </span>
                          <p className={`text-[11px] ${textMuted} leading-normal mt-1`}>
                            {timelineStages.find(s => s.status === 'active')?.notes || 'Geçici dolgu muayenesi.'}
                          </p>
                        </div>

                        {/* Box 3: GELECEK SIRADAKİ ADIM */}
                        <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-xl border border-indigo-500/15">
                          <span className="text-[10px] text-indigo-400 font-bold block tracking-widest uppercase mb-1.5 font-mono">
                            SIRADAKİ ADIM / RANDEVU
                          </span>
                          <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} block truncate`}>
                            {timelineStages.find(s => s.status === 'upcoming')?.title || 'Kalıcı Kuron Restorasyonu'}
                          </span>
                          <p className={`text-[11px] ${textMuted} leading-normal mt-1`}>
                            Kaplama ölçüsü alınacak estetik porselen zirkonyum kaplama aşaması.
                          </p>
                        </div>

                      </div>

                      {/* Timeline flow */}
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200 dark:before:bg-slate-800">
                        {timelineStages.map((stage, idx) => {
                          let circleStyle = '';
                          let titleStyle = '';

                          if (stage.status === 'done') {
                            circleStyle = 'bg-emerald-500 text-white ring-4 ring-emerald-500/15';
                            titleStyle = 'text-emerald-500 font-bold';
                          } else if (stage.status === 'active') {
                            circleStyle = 'bg-amber-500 text-[#090d16] ring-4 ring-amber-500/20 font-black scale-105 animate-pulse';
                            titleStyle = 'text-amber-500 font-bold';
                          } else {
                            circleStyle = 'bg-slate-350 dark:bg-slate-800 text-slate-400';
                            titleStyle = 'text-slate-400';
                          }

                          return (
                            <div key={stage.id} className="relative flex items-start gap-4">
                              {/* Dot */}
                              <div className={`absolute -left-[23px] h-4.5 w-4.5 rounded-full flex items-center justify-center font-mono text-[9px] font-bold mt-1 z-10 ${circleStyle}`}>
                                {stage.status === 'done' ? <Check className="h-2.5 w-2.5" /> : null}
                              </div>

                              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-start bg-slate-50/40 dark:bg-slate-900/15 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-450 text-slate-400 font-mono block uppercase py-0.5">
                                  {stage.date}
                                </span>
                                <div className="md:col-span-3 space-y-1">
                                  <h4 className={`text-xs ${titleStyle} tracking-tight`}>{stage.title}</h4>
                                  <p className={`text-[11.5px] leading-relaxed ${textMuted}`}>
                                    {stage.notes}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </motion.div>
                  )}

                </div>
              )}

              {/* GÜNLÜK DİŞ BAKIMI & İNTERAKTİF GEÇMİŞ TAKİPÇİSİ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Brushing Log Form */}
                <div className={`${bgCard} border p-6 lg:col-span-5 flex flex-col justify-between space-y-4`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b pb-2.5 border-slate-500/10">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <h3 className={`text-sm font-bold ${textTitle}`}>Diş Fırçalama Günlüğü</h3>
                      </div>
                      <span className="text-[9.5px] bg-[#2cbd85]/10 text-[#2cbd85] border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        HEDEF: GÜNDE 2 DEFA
                      </span>
                    </div>

                    <p className={`text-xs ${textMuted} leading-relaxed`}>
                      Günde en az iki kere 2'şer dakika fırçalayarak hekiminizin önerdiği florür desteğini diş minenize uygulayın ve anlık durumunuza kaydedin.
                    </p>

                    {/* Quick overview of today's habit */}
                    <div className="grid grid-cols-2 gap-3 text-xs py-1">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${brushingLogs.some(l => l.date === new Date().toISOString().split('T')[0]) ? 'bg-emerald-500' : 'bg-slate-400 animate-pulse'}`} />
                        <div>
                          <span className="text-[9px] text-slate-400 block leading-none font-bold uppercase">BUGÜN</span>
                          <span className="font-extrabold mt-1 block text-slate-700 dark:text-slate-100">
                            {brushingLogs.filter(l => l.date === new Date().toISOString().split('T')[0]).length > 0
                              ? `${brushingLogs.filter(l => l.date === new Date().toISOString().split('T')[0]).length} Defa`
                              : "Kayıt Yok"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/60 flex items-center gap-2.5">
                        <Award className="h-5 w-5 text-amber-500" />
                        <div>
                          <span className="text-[9px] text-slate-400 block leading-none font-bold uppercase">AKTİF SERİ</span>
                          <span className="font-extrabold mt-1 block text-slate-700 dark:text-slate-100">4 Gün</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle form button */}
                    {!showBrushingForm ? (
                      <button
                        onClick={() => setShowBrushingForm(true)}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                        id="btn-show-brushform"
                      >
                        <Clock className="h-4 w-4" />
                        <span>Yeni Fırçalama Kaydı Ekle</span>
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 mt-2 text-xs"
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-indigo-500/10">
                          <span className="font-bold text-indigo-400 text-xs">Hijyen Detaylarını Girin</span>
                          <button
                            onClick={() => setShowBrushingForm(false)}
                            className="text-slate-400 hover:text-white font-bold text-[11px] cursor-pointer"
                          >
                            Kapat
                          </button>
                        </div>

                        {/* Duration Slider Choice */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-400">Fırçalama Süresi:</span>
                            <span className="text-indigo-400 font-mono font-bold">{Math.floor(newBrushDuration / 60)} dk ({newBrushDuration} sn)</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="300"
                            step="10"
                            value={newBrushDuration}
                            onChange={e => setNewBrushDuration(Number(e.target.value))}
                            className="w-full accent-indigo-500 bg-slate-200 dark:bg-slate-700 h-1 rounded-lg cursor-pointer"
                          />
                        </div>

                        {/* Period Choices */}
                        <div className="grid grid-cols-4 gap-1.5 font-bold">
                          {(['Sabah', 'Öğlen', 'Akşam', 'Gece'] as const).map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setNewBrushPeriod(p)}
                              className={`py-1.5 rounded-lg text-[10px] text-center border transition-all cursor-pointer ${newBrushPeriod === p
                                ? 'bg-indigo-500 text-white border-indigo-500'
                                : 'bg-transparent border-slate-700 hover:bg-slate-900 text-slate-400'
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>

                        {/* Checkboxes */}
                        <div className="space-y-2 pt-1 font-semibold text-slate-400">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flossUsed}
                              onChange={e => setFlossUsed(e.target.checked)}
                              className="accent-indigo-500 rounded"
                            />
                            <span>Diş İpi / Arayüz Fırçası Kullandım</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tongueBrushed}
                              onChange={e => setTongueBrushed(e.target.checked)}
                              className="accent-indigo-500 rounded"
                            />
                            <span>Dil ve Yanak Hijyeni Sağladım</span>
                          </label>
                        </div>
                        <button
                          onClick={() => {
                            const calculatedScore = Math.min(100, Math.round((newBrushDuration / 120) * 75) + (flossUsed ? 15 : 0) + (tongueBrushed ? 10 : 0));
                            const newLog = {
                              date: new Date().toISOString().split('T')[0],
                              time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                              duration: newBrushDuration,
                              completed: true,
                              score: calculatedScore,
                              period: newBrushPeriod,
                              floss_used: flossUsed,
                              tongue_brushed: tongueBrushed
                            };
                            saveBrushingLogToBackend(newLog);
                            setShowBrushingForm(false);
                          }}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2 rounded-lg text-xs transition-all cursor-pointer inline-block"
                        >
                          Fırçalamayı Kaydet
                        </button>
                      </motion.div>
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[10.5px] text-slate-400 leading-relaxed">
                    Düzgün dairesel darbeler ve 120 saniyenin üzerindeki temizlik, diş etlerindeki hassasiyeti dindirerek diş eti çekilmesini durdurur.
                  </div>
                </div>

                {/* Brushing Log Lists */}
                <div className={`${bgCard} border p-6 lg:col-span-7 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2.5 border-slate-500/10">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-[#2cbd85]/10 text-emerald-400 rounded-xl">
                          <Activity className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className={`text-sm font-bold ${textTitle}`}>Fırçalama Analiz Çizelgem</h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Son Seanslar</span>
                    </div>

                    {brushingLogs.length > 0 && (
                      <div className="h-32 w-full pt-1.5 pb-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[...brushingLogs].reverse()} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={9} />
                            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                            <Tooltip contentStyle={isDark ? { backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '10px' } : { fontSize: '10px' }} />
                            <Line type="monotone" dataKey="score" name="Skor" stroke="var(--color-clinic-accent, #6366f1)" strokeWidth={2.5} activeDot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {brushingLogs.length > 0 ? (
                        brushingLogs.slice(0, 5).map((log, index) => (
                          <div
                            key={log.id || index}
                            className="p-3 bg-slate-50/75 dark:bg-slate-950/45 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg font-bold font-mono">
                                0{index + 1}
                              </div>
                              <div className="space-y-0.5">
                                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'} block`}>
                                  Ağız Bakım Rutini
                                </span>
                                <span className="text-[10px] text-slate-500 block font-mono font-semibold">
                                  {log.date} @ {log.time || '10:15'} — Süre: {Math.floor(log.duration / 60)}dk {log.duration % 60}sn
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[9px] text-slate-500 block">Skor</span>
                              <span className={`font-bold font-mono text-xs block ${log.score >= 85 ? 'text-emerald-450 text-emerald-400' :
                                log.score >= 70 ? 'text-amber-500' : 'text-rose-500'
                                }`}>
                                {log.score} / 100
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-10 text-xs text-slate-500 font-medium italic">Kayıtlı ağız bakım seansı bulunmuyor. Sol taraftan kayıt ekleyebilirsiniz.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10.5px] border-t border-slate-500/5 pt-3 mt-2 font-semibold text-slate-450">
                    <span className="text-indigo-455 text-indigo-400">Senkronize Günlük fırçalama durumları.</span>
                    <button
                      onClick={() => {
                        const demoLogs = [
                          { date: '2026-05-24', time: '22:15', duration: 150, completed: true, score: 95, period: 'Gece' as const, floss_used: true, tongue_brushed: true },
                          { date: '2026-05-24', time: '08:10', duration: 120, completed: true, score: 85, period: 'Sabah' as const, floss_used: false, tongue_brushed: true },
                          { date: '2026-05-23', time: '22:30', duration: 180, completed: true, score: 100, period: 'Gece' as const, floss_used: true, tongue_brushed: true },
                          { date: '2026-05-23', time: '08:45', duration: 90, completed: true, score: 65, period: 'Sabah' as const, floss_used: false, tongue_brushed: false }
                        ];
                        Promise.all(demoLogs.map(log =>
                          fetch('http://localhost:8000/brushing_logs/', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              patient_id: currentUser.id,
                              log_date: log.date,
                              log_time: `${log.time}:00`,
                              duration_seconds: log.duration,
                              completed: log.completed,
                              score: log.score,
                              period: log.period,
                              floss_used: log.floss_used,
                              tongue_brushed: log.tongue_brushed
                            })
                          })
                        )).then(() => {
                          triggerToast("Örnek fırçalama verileri veritabanına kaydedildi.", "info");
                          fetchBrushingLogs();
                        }).catch(err => {
                          console.error(err);
                          triggerToast("Örnek veriler yüklenemedi.", "warning");
                        });
                      }}
                      className="text-indigo-500 hover:underline cursor-pointer"
                    >
                      Örnek Veri Yükle
                    </button>
                  </div>
                </div>

              </div>

              {/* INTEGRATED DOCTOR RECIPE WARNING & RADIOGRAPHIC ARCHIVE */}
              <div className="grid md:grid-cols-3 gap-6">

                {/* Dentist post-op message card */}
                <div className={`${bgCard} border p-6 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                        <Heart className="h-5 w-5" />
                      </div>
                      <h3 className={`text-sm font-bold ${textTitle}`}>Aktif Hekim Mesajı</h3>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-xl text-xs leading-relaxed text-slate-650 dark:text-slate-350 italic">
                      <p className="font-semibold leading-relaxed font-sans">
                        {latestNotification
                          ? `"${latestNotification.message}"`
                          : "Hekiminizden henüz yeni bir mesaj bulunmuyor."
                        }
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-500/10 pt-4 mt-4 flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-indigo-400 font-medium">— {patientRecord?.primaryDentist || 'Dr. Samantha Lee'}</span>
                    <button
                      onClick={() => {
                        setShowNotificationsDropdown(true);
                        triggerToast("Hekim bilgilendirme bildirim arşivi açıldı.", 'info');
                      }}
                      className="text-indigo-500 hover:underline cursor-pointer"
                    >
                      Tümünü Gör
                    </button>
                  </div>
                </div>

                {/* Hekim Bakım Önerileri Card */}
                <div className={`${bgCard} border p-6 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <h3 className={`text-sm font-bold ${textTitle}`}>Hekim Bakım Önerileri</h3>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-xl text-xs leading-relaxed text-slate-655 dark:text-slate-350">
                      <p className="font-semibold font-sans">
                        {patientRecord?.recommendedTreatment || "Özel bir bakım önerisi girilmemiştir."}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-500/10 pt-4 mt-4 text-[10.5px] font-bold text-slate-400">
                    Sorumlu hekiminizin size özel tavsiyeleri
                  </div>
                </div>

                {/* Radiology highlight card */}
                <div className={`${bgCard} border p-6 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <Activity className="h-5 w-5 text-indigo-400" />
                      </div>
                      <h3 className={`text-sm font-bold ${textTitle}`}>Röntgen & Muayene Arşivi</h3>
                    </div>

                    {analyses.length > 0 ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 rounded-xl flex flex-col gap-2 shadow-inner text-xs">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-700 dark:text-slate-200 block truncate">Panoramik Röntgen (AI)</span>
                            <span className="text-[10px] text-slate-400 block font-mono font-bold">
                              Tarih: {analyses[0].date}
                            </span>
                          </div>
                          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                            Skor: {analyses[0].score}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-450 border-t border-slate-200/20 pt-1.5 mt-1 font-bold">
                          <span>Plak Katsayısı: %{analyses[0].plaqueIndex}</span>
                          <span>Çürük Sayısı: {analyses[0].cavitiesCount}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center text-xs text-slate-500 py-6">
                        Yüklenmiş bir röntgen filmi bulunmuyor.
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-500/10 pt-4 mt-4 text-[10.5px]">
                    <span className="text-emerald-500 font-bold">
                      {analyses.length > 0 ? `Sistemde ${analyses.length} Röntgen Var` : 'Kayıt Yok'}
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab('analysis');
                        triggerToast("Yapay Zeka Röntgen Analiz bölümüne yönlendirildi.", 'info');
                      }}
                      className="text-indigo-500 font-bold hover:underline cursor-pointer"
                    >
                      AI İncele
                    </button>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 2: DİŞ HARİTAM & İŞLEM GEÇMİŞİ */}
          {activeTab === 'map' && (
            <motion.div
              key="panel-map"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className={`text-lg font-bold ${textTitle}`}>Dental Diş Haritam ve Klinik İşlemlerim</h2>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  32 FDI şemamız üzerinde dişlerinizin durumunu tıklayarak görün. Klinik müdahaleler ve dişe özel tedavi geçmişi birbiriyle entegre şekilde burada listelenir.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* 32 FDI Dental Map Canvas */}
                <div className={`${bgCard} border p-6 lg:col-span-8 flex flex-col justify-between relative overflow-hidden min-h-[400px]`}>
                  <div className="flex items-center justify-between border-b pb-2 mb-3 border-slate-500/10">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider">ANATOMİK ÇENE ŞEMASI (FDI)</span>
                    <span className="text-[9.5px] bg-[#2cbd85]/10 text-[#2cbd85] border border-emerald-501/20 rounded px-2 py-0.5 font-bold uppercase">
                      İKİ BOYUTLU DETAY GÖRÜNÜMÜ
                    </span>
                  </div>

                  {/* Teeth Coordinate Matrix System wrapper */}
                  <div className="w-full flex flex-col items-center py-4 select-none">
                    <div className="w-full overflow-x-auto pb-4 pt-2">
                      <div className="min-w-[620px] flex flex-col items-center space-y-6">
                        
                        {/* Upper Row (Maxilla) */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex justify-between w-full px-6 text-[10px] font-extrabold text-slate-400 tracking-wider">
                            <span>ÜST ÇENE (MAXILLA) — SAĞ</span>
                            <span>ÜST ÇENE (MAXILLA) — SOL</span>
                          </div>
                          <div className="flex items-center space-x-1 relative border border-slate-200/40 dark:border-slate-800/40 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                            {/* Left side (18 - 11) */}
                            <div className="flex items-end space-x-1.5">
                              {[18, 17, 16, 15, 14, 13, 12, 11].map(id => renderPatientTooth(id, true))}
                            </div>
                            
                            {/* Midline divider */}
                            <div className="w-[2px] h-20 border-l-2 border-dashed border-indigo-500/30 mx-3 self-center"></div>
                            
                            {/* Right side (21 - 28) */}
                            <div className="flex items-end space-x-1.5">
                              {[21, 22, 23, 24, 25, 26, 27, 28].map(id => renderPatientTooth(id, true))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Lower Row (Mandibula) */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-1 relative border border-slate-200/40 dark:border-slate-800/40 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                            {/* Left side (48 - 41) */}
                            <div className="flex items-start space-x-1.5">
                              {[48, 47, 46, 45, 44, 43, 42, 41].map(id => renderPatientTooth(id, false))}
                            </div>
                            
                            {/* Midline divider */}
                            <div className="w-[2px] h-20 border-l-2 border-dashed border-indigo-500/30 mx-3 self-center"></div>
                            
                            {/* Right side (31 - 38) */}
                            <div className="flex items-start space-x-1.5">
                              {[31, 32, 33, 34, 35, 36, 37, 38].map(id => renderPatientTooth(id, false))}
                            </div>
                          </div>
                          <div className="flex justify-between w-full px-6 text-[10px] font-extrabold text-slate-400 tracking-wider">
                            <span>ALT ÇENE (MANDIBULA) — SAĞ</span>
                            <span>ALT ÇENE (MANDIBULA) — SOL</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Medical status tags */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-bold pt-4 border-t border-slate-500/10">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded block" />
                      <span className={textMuted}>Sağlam Diş</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-3 h-3 bg-rose-500 rounded block animate-pulse" />
                      <span className={textMuted}>İzlem & Risk Altında</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-3 h-3 bg-amber-500 rounded block" />
                      <span className={textMuted}>Aktif Tedavi</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-3 h-3 bg-indigo-500 rounded block" />
                      <span className={textMuted}>Tamamlanan İşlem</span>
                    </div>
                  </div>

                </div>

                {/* Selected Tooth Detail / Treatment Chronology */}
                <div className="lg:col-span-4">
                  <div className={`${bgCard} border p-6 space-y-4 min-h-[400px] flex flex-col justify-between`}>

                    {selectedToothInfo ? (
                      <div className="space-y-4">
                        <div className="border-b pb-2.5 border-slate-500/10">
                          <span className="text-[9px] font-bold text-indigo-400 block uppercase tracking-wider">DİŞ MUAYENE BİLGİ KARTIM</span>
                          <h3 className={`text-base font-bold ${textTitle} mt-0.5`}>Diş No: #{selectedToothId} — {selectedToothInfo.name}</h3>

                          <span className={`inline-block text-[9.5px] font-bold uppercase tracking-wide mt-1.5 px-2 py-0.5 rounded ${selectedToothInfo.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                            selectedToothInfo.status === 'risk' ? 'bg-rose-500/10 text-rose-500 animate-pulse' :
                              selectedToothInfo.status === 'treatment' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/15 text-indigo-400'
                            }`}>
                            Durum: {
                              selectedToothInfo.status === 'healthy' ? 'Normal / Sağlıklı' :
                                selectedToothInfo.status === 'risk' ? 'Takip ve Risk Altında' :
                                  selectedToothInfo.status === 'treatment' ? 'Dolgu / Kanal Seansı' : 'Tedavi Tamamlandı'
                            }
                          </span>
                        </div>

                        {selectedToothInfo.notes && (
                          <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                            <span className="font-bold text-amber-500 block text-[9px] uppercase tracking-wider mb-1">Hekim Teşhis ve İzlem Notu:</span>
                            {selectedToothInfo.notes}
                          </div>
                        )}

                        {/* Individual tooth treatment histories - Timeline style */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DİŞ İŞLEM ZAMAN TÜNELİ</h4>
                          {selectedToothInfo.treatments.length > 0 ? (
                            <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 ml-2 py-1 space-y-4">
                              {selectedToothInfo.treatments.map((tr, idx) => (
                                <div key={idx} className="relative">
                                  {/* Timeline bullet */}
                                  <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#0e1626]" />
                                  
                                  <div className="text-xs">
                                    <div className="flex flex-wrap items-center justify-between gap-1 font-bold">
                                      <span className="text-indigo-400 uppercase tracking-wider text-[10.5px]">{tr.type}</span>
                                      <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-full">{tr.date}</span>
                                    </div>
                                    {tr.description && (
                                      <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-[10.5px] font-semibold">{tr.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/60 text-center">
                              <p className="text-[11px] text-slate-550 dark:text-slate-500 italic">
                                Bu diş üzerinde henüz kayıtlı bir operasyon veya tedavi bulunmamaktadır.
                              </p>
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      <p className="text-center py-12 text-xs text-slate-500 font-medium">Hepsini görmek için soldaki çene şemasından bir diş numarası seçin.</p>
                    )}

                    <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-550/15 border-indigo-500/15 text-[10px] leading-relaxed text-indigo-400 font-semibold mt-4">
                      <span>Anatomik diş yapısı FDI numaralandırma kurallarına uygun olarak simüle edilmektedir.</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* CHRONOLOGICAL CLINICAL LOGS */}
              <div className={`${bgCard} border p-6`}>
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-500/10">
                  <h3 className={`text-sm font-bold ${textTitle}`}>Tüm Klinik İşlemler ve Müdahale Geçmişim</h3>
                  <span className="text-[10.5px] text-slate-400 font-bold">Klinikte Gerçekleştirilen Toplam Operasyon: {allTeethTreatments.length}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead>
                      <tr className="border-b border-slate-500/10 text-slate-400 font-bold">
                        <th className="py-2.5">Tarih</th>
                        <th className="py-2.5">FDI Diş No</th>
                        <th className="py-2.5">Uygulanan İşlem</th>
                        <th className="py-2.5">Açıklama</th>
                        <th className="py-2.5">Uygulayan Doktor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-500/5">
                      {allTeethTreatments.length > 0 ? (
                        allTeethTreatments.map((tr, index) => (
                          <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="py-3 font-mono text-[10.5px] text-slate-400 font-bold">{tr.date}</td>
                            <td className="py-3">
                              <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold font-mono text-[11px]">
                                #{tr.toothId} — {tr.toothName}
                              </span>
                            </td>
                            <td className="py-3 font-extrabold text-indigo-400 uppercase tracking-wide">{tr.type}</td>
                            <td className="py-3 font-medium text-slate-600 dark:text-slate-350 leading-relaxed text-[11px]">{tr.description}</td>
                            <td className="py-3 font-bold text-teal-400">{patientRecord?.primaryDentist || 'Uygulayan Hekim'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 italic text-xs">
                            Kayıtlı herhangi bir klinik işlem veya tedavi geçmişi bulunmamaktadır.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 3: YAPAY ZEKA TEŞHİS & CHAT */}
          {activeTab === 'analysis' && (
            <motion.div
              key="panel-analysis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className={`text-lg font-bold ${textTitle}`}>Yapay Zeka Ağız Teşhisi & Sohbet Asistanı</h2>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Ağız içi veya röntgen fotoğraflarınızı yükleyerek anlık analiz raporu oluşturabilir, ya da yapay zeka co-pilotumuza dental sorular yöneltebilirsiniz.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                {/* Visual Radiology Scanner */}
                <div className={`${bgCard} border p-6 lg:col-span-6 flex flex-col justify-between`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2 border-slate-500/10">
                      <h3 className={`text-xs font-bold ${textTitle} flex items-center gap-1.5 uppercase tracking-wider`}>
                        <Camera className="h-4.5 w-4.5 text-indigo-400" />
                        GÖRSEL RÖNTGEN ANALİZİ
                      </h3>
                      <span className="text-[10px] font-bold text-indigo-400">Yapay Zeka Segmentasyon</span>
                    </div>

                    {/* Scanner Simulation Card Container */}
                    <div
                      onClick={triggerImageUpload}
                      className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden group min-h-[200px] ${isDark ? 'bg-slate-950/40 border-slate-800 hover:border-indigo-500/70' : 'bg-slate-50/60 border-slate-200 hover:border-indigo-400 shadow-inner'
                        }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {analyzing ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={diagnosticsImage || "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400"}
                              alt="Scan In Progress"
                              className="h-28 w-auto object-cover rounded-lg opacity-30 blur-[1px]"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400" />
                            </div>
                            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-teal-400 opacity-95 animate-bounce" />
                          </div>
                          <div>
                            <p className="text-xs font-bold animate-pulse text-indigo-400">Radyografi Segmentleniyor...</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Yapay zeka mineral kaybını tarıyor.</p>
                          </div>
                        </div>
                      ) : diagnosticsImage ? (
                        <div className="space-y-3 w-full flex flex-col items-center">
                          <img
                            src={diagnosticsImage}
                            alt="Scan Complete"
                            className="h-28 w-auto object-cover rounded-lg border border-slate-800 shadow-md"
                            referrerPolicy="no-referrer"
                          />
                          <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 leading-none">
                            <CheckCircle className="h-4 w-4" /> Radyografi Yapay Zekayla İncelendi
                          </p>
                          <button
                            onClick={(e) => { e.stopPropagation(); startDiagnosticScan(diagnosticsImage); }}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] cursor-pointer inline-block shadow"
                          >
                            Taramayı Yenile
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 py-2">
                          <div className="bg-indigo-500/10 text-indigo-400 p-3 rounded-full w-fit mx-auto ring-4 ring-indigo-500/5 group-hover:scale-105 transition-transform">
                            <Upload className="h-5 w-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Röntgen Dosyası veya Ağız Fotoğrafı Yükleyin</p>
                            <p className="text-[10px] text-slate-500">DICOM, JPEG, PNG formatları desteklenir</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5">
                      <span className="text-[10px] text-slate-450 text-slate-500 font-medium">Hekim Simülasyon Şablonu:</span>
                      <button
                        onClick={runDemoScan}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-650 dark:text-indigo-400 text-[10px] font-bold py-1.5 px-3.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-indigo-500/10 cursor-pointer"
                        id="btn-rundemoscan"
                      >
                        Örnek Röntgeni Taramayı Başlat
                      </button>
                    </div>

                    {/* Scanner Output Details */}
                    {analysisResult && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3.5 animate-scaleUp">
                        <div className="flex items-center justify-between pb-2 border-b border-indigo-500/10">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Genel Diş Sağlığı Oranı</span>
                            <span className="text-lg font-black text-emerald-400">{analysisResult.score}/100</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-500 block">Demineralizasyon Katsayısı</span>
                            <span className="text-xs font-bold text-teal-400 font-mono">% {analysisResult.plaqueIndex || 12}</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider">BULGULAR & TAVSİYELER</h4>
                          <ul className="text-[11px] text-slate-500 dark:text-slate-350 space-y-1 pl-4 list-disc leading-normal font-medium">
                            {analysisResult.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`mt-4 p-3.5 rounded-xl text-[10.5px] leading-relaxed flex items-start gap-2 border ${isDark ? 'bg-slate-950/40 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                    <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>Önemli Uyarı: Görsel segmentasyon modülümüz sadece yardımcı plak oranı tespiti içindir. Hekim muayenesi ve kararı mutlak esastır.</span>
                  </div>
                </div>

                {/* AI Chat Copilot Box */}
                <div className={`${bgCard} border p-6 flex flex-col justify-between h-[500px] lg:col-span-6`}>
                  <div className="flex items-center justify-between border-b pb-2.5 mb-3 border-slate-500/10">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Bot className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider">KLİNİK AI CO-PILOT</h4>
                        <span className="text-[9px] text-[#2cbd85] font-bold flex items-center gap-1 mt-0.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
                          Yapay Zeka Destek Ünitesi Aktif
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat message loops */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${msg.sender === 'user'
                          ? 'bg-indigo-500 text-white ml-auto'
                          : isDark ? 'bg-slate-950/60 text-slate-300 border border-slate-850' : 'bg-slate-100 text-slate-800'
                          }`}
                      >
                        <p className="font-medium">{msg.text}</p>
                        <span className="text-[8px] opacity-75 block text-right font-mono mt-1 leading-none">{msg.time}</span>
                      </div>
                    ))}
                    {botTyping && (
                      <div className="flex gap-1.5 items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_100ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_200ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[bounce_1s_infinite_300ms]" />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick-reply button choices */}
                  <div className="flex gap-2 py-2 overflow-x-auto shrink-0 border-t border-slate-500/5 mt-2">
                    {[
                      { text: "Kanal tedavisinden sonra sızlama?", label: "Diş Sızlaması" },
                      { text: "Röntgen filmime göre durumum?", label: "Röntgen Durumu" },
                      { text: "Zirkonyum kaplama ölçüsü ne zaman?", label: "Zirkonyum Ölçü" }
                    ].map((btn, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendChatMessage(btn.text)}
                        className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 hover:bg-indigo-500/20 transition-all shrink-0 cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Interactive Text Input Control */}
                  <div className="pt-2 border-t border-slate-500/10 flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="Uygulanan dolgu, fırçalama sıklığı veya semptomları sorun..."
                      className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none ${bgInput}`}
                      id="chat-input-field"
                    />
                    <button
                      onClick={() => handleSendChatMessage()}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center shrink-0"
                      id="btn-chat-send"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: PROFiLiM & KLiNiK BİLGİLERİM (Ayrı bir profilim sayfası oluşturulması) */}
          {activeTab === 'profile' && (
            <motion.div
              key="panel-profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className={`text-lg font-bold ${textTitle}`}>Profil Kartım & Klinik Muayene Bilgilerim</h2>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  DentsAI sisteminde adınıza kayıtlı kişisel sağlık kimliğiniz, klinik bilgileri ve Dr. Samantha Lee gözetimindeki tedavi parametreleriniz.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Personal Information Cards */}
                <div className={`${bgCard} border p-6 lg:col-span-7 space-y-5`}>
                  <div className="flex items-center justify-between border-b pb-2.5 border-slate-500/10">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-indigo-500" />
                      <h3 className={`text-sm font-bold ${textTitle}`}>TIBBİ SAĞLIK KİMLİĞİM</h3>
                    </div>
                    <button
                      onClick={() => {
                        if (isEditing) {
                          // reset to original
                          setEditName(patientRecord?.name || '');
                          setEditPhone(patientRecord?.phone || '');
                          setEditEmail(patientRecord?.email || '');
                          setEditDob(patientRecord?.dob || '');
                          setEditBloodType(patientRecord?.bloodType || '');
                          setEditAllergies(patientRecord?.allergies || '');
                        }
                        setIsEditing(!isEditing);
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${isEditing
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
                        }`}
                      id="btn-toggle-edit-profile"
                    >
                      {isEditing ? "Değişiklikleri İptal Et" : "Bilgilerimi Düzenle"}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">HASTA T.C. NO (Değiştirilemez)</span>
                        <span className="text-slate-400 dark:text-slate-500 font-mono font-bold">{patientRecord?.tcNo || '48291038291'}</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <label className="text-[10px] text-indigo-400 font-bold block mb-1">HASTA TAM ADI</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className={`w-full text-xs p-1.5 rounded-lg border outline-none ${bgInput}`}
                          placeholder="Ad Soyad"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <label className="text-[10px] text-indigo-400 font-bold block mb-1">DOĞUM TARİHİ</label>
                        <input
                          type="date"
                          value={editDob}
                          onChange={e => setEditDob(e.target.value)}
                          className={`w-full text-xs p-1.5 rounded-lg border outline-none ${bgInput}`}
                        />
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <label className="text-[10px] text-indigo-400 font-bold block mb-1">TELEFON NUMARASI</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className={`w-full text-xs p-1.5 rounded-lg border outline-none ${bgInput}`}
                          placeholder="Telefon Numarası"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <label className="text-[10px] text-indigo-400 font-bold block mb-1">KAYITLI E-POSTA</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className={`w-full text-xs p-1.5 rounded-lg border outline-none ${bgInput}`}
                          placeholder="E-posta adresi"
                        />
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <label className="text-[10px] text-indigo-400 font-bold block mb-1">KAN GRUBU</label>
                        <select
                          value={editBloodType}
                          onChange={e => setEditBloodType(e.target.value)}
                          className={`w-full text-xs p-1.5 rounded-lg border outline-none ${bgInput}`}
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

                      <div className="p-3 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/20 col-span-2 space-y-1">
                        <label className="text-[10px] text-rose-500 font-bold block mb-1">KRİTİK İLAÇ / PENİSİLİN ALERJİSİ BULGUSU</label>
                        <input
                          type="text"
                          value={editAllergies}
                          onChange={e => setEditAllergies(e.target.value)}
                          className={`w-full text-xs p-1.5 rounded-lg border outline-none bg-white text-slate-850 border-rose-500/20 dark:bg-[#090d16] dark:text-white dark:border-rose-500/30`}
                          placeholder="Alerji durumu veya Yok yazın"
                        />
                      </div>

                      <div className="col-span-2 pt-2">
                        <button
                          onClick={handleSaveProfile}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black py-2.5 rounded-xl text-xs transition-with-shadow cursor-pointer shadow-md flex items-center justify-center gap-2"
                          id="btn-save-edited-profile"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Profil Değişikliklerimi Kaydet</span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-450 text-slate-500 font-semibold block mb-1">HASTA T.C. NO</span>
                        <span className="text-slate-700 dark:text-slate-200 font-mono font-bold">{patientRecord?.tcNo || '48291038291'}</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-500 font-semibold block mb-1">TAM ADI</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{patientRecord?.name || 'Selin Aydın'}</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-550 text-slate-500 block mb-1">DOĞUM TARİHİ & YAŞ</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold">{patientRecord?.dob || '2001-04-22'} ({patientRecord?.age || 25} Yaş)</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-500 block mb-1">TELEFON NUMARASI</span>
                        <span className="text-slate-700 dark:text-slate-200 font-mono font-bold">{patientRecord?.phone || '0555 111 22 33'}</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-500 block mb-1">KAYITLI E-POSTA</span>
                        <span className="text-slate-700 dark:text-slate-200 font-semibold">{patientRecord?.email || 'selin@mail.com'}</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[10px] text-slate-550 text-slate-500 block mb-1">KAN GRUBU</span>
                        <span className="text-rose-500 font-bold font-mono">{patientRecord?.bloodType || 'A Rh+'}</span>
                      </div>

                      <div className="p-4 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/20 col-span-2 space-y-1">
                        <div className="flex items-center space-x-2 text-rose-500 font-bold">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-[10px] tracking-wider uppercase font-bold">Kritik İlaç / Penisilin Alerjisi Bulgusu</span>
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium`}>
                          Müşterek verilerde hastamızın <span className="text-rose-500 font-bold">{patientRecord?.allergies || 'Penisilin Alerjisi'}</span> geçmişi kayıtlıdır. Klinik içi müdahale ve reçetelerde göz önünde bulundurulmaktadır.
                        </p>
                      </div>

                    </div>
                  )}
                </div>

                {/* Active Affiliation & Clinic details */}
                <div className="lg:col-span-5 space-y-6">

                  <div className={`${bgCard} border p-6 space-y-4`}>
                    <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-500/10">
                      <ShieldCheck className="h-5 w-5 text-[#2cbd85]" />
                      <h3 className={`text-sm font-bold ${textTitle}`}>AKTİF TEDAVİ GÖRÜLEN KLİNİK SİCİLİ</h3>
                    </div>

                    <div className="space-y-3 t-xs text-xs font-semibold">

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Klinik İsmi</span>
                        <span className="text-[#2cbd85] dark:text-emerald-400 font-bold bg-[#2cbd85]/10 border border-emerald-500/20 px-2.5 py-1 rounded inline-block text-[11px]">
                          {patientRecord?.clinicName || 'DentsAI Elite Clinic (Merkez Şube)'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Birincil Teşhis Mütehassısı</span>
                        <span className="text-slate-700 dark:text-slate-200 font-bold block">{patientRecord?.primaryDentist || 'Dr. Samantha Lee'} (Dental Cerrah)</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Klinik Adres Bilgisi</span>
                        <p className={`leading-relaxed text-[11px] ${textMuted}`}>
                          Çankat Plaza Kat: 4, No: 12-14 Çankaya / Ankara (Tel: 0312 411 11 11)
                        </p>
                      </div>

                      <div className="border-t pt-3.5 mt-2 space-y-2 text-[10.5px] font-bold text-slate-400 border-slate-500/10">
                        <div className="flex justify-between">
                          <span>Sürecin Mevcut Statüsü</span>
                          <span className="text-amber-500 uppercase">{patientRecord?.treatmentStatus || 'Tedavide'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kayıt Statüsü</span>
                          <span className="text-emerald-555 text-emerald-500 font-bold">ETKİN & ONAYLANDI</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Son Klinik Randevu</span>
                          <span className="text-indigo-400 font-mono">25 Mayıs 2026</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* HIPAA compliance statement */}
                  <div className={`${bgCard} border p-5 text-center space-y-1.5`}>
                    <span className="text-[9.5px] font-mono font-bold tracking-wider text-indigo-400 uppercase">KİŞİSEL VERİ GÜVENLİĞİ BEYANI</span>
                    <p className={`text-[11px] leading-relaxed ${textMuted}`}>
                      Klinik veri tabanındaki tıbbi özlük ve radyolojik kayıtlar uluslararası hasta hakları tüzüklerine tam uyumlu olacak biçimde şifrelenmiştir.
                    </p>
                  </div>

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 5: FIRÇALAMA */}
          {activeTab === 'brushing' && (
            <motion.div
              key="panel-brushing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className={`text-lg font-bold ${textTitle}`}>Kişisel Diş Fırçalama Rehberi</h2>
                <p className={`text-xs ${textMuted} mt-0.5`}>
                  Hekimlerin önerdiği 2 dakikalık tam bölge fırçalama rutinini animasyonlarla takip edin.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Active Interactive Brushing Clock */}
                <div className={`${bgCard} border p-6 sm:p-8 flex flex-col items-center justify-center space-y-8 lg:col-span-7`}>

                  {/* Step visual descriptor */}
                  <div className="text-center space-y-2">
                    <span className="bg-indigo-500/10 text-indigo-400 py-1.5 px-4 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                      BÖLGE {currentStepIndex + 1} / {BRUSHING_STEPS.length}: {BRUSHING_STEPS[currentStepIndex].title}
                    </span>
                    <p className={`text-xs ${textMuted} max-w-sm mx-auto leading-relaxed pt-1`}>
                      {BRUSHING_STEPS[currentStepIndex].text}
                    </p>
                  </div>

                  {/* Circle Countdown visual */}
                  <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">

                    {/* Animated glowing border depending on timing */}
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>

                    {/* Active SVG Ring Tracker */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="45%"
                        stroke="#6366f1"
                        strokeWidth="5"
                        fill="transparent"
                        strokeDasharray="290"
                        strokeDashoffset={290 - (290 * timeLeft) / 120}
                        className="transition-all duration-1000"
                      />
                    </svg>

                    <div className="text-center z-10 space-y-1">
                      <span className="text-slate-400 text-[10px] font-black tracking-widest block uppercase">KALAN SÜRE</span>
                      <span className={`text-4xl sm:text-5xl font-black ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-[9px] text-teal-500 font-bold block bg-teal-500/10 px-2 py-0.5 rounded-full w-fit mx-auto mt-1 uppercase">15s / Bölge</span>
                    </div>

                    {/* Animated particle pulse during active timing */}
                    {timerActive && (
                      <div className="absolute inset-2 border border-indigo-500/30 rounded-full animate-[ping_1.5s_infinite]"></div>
                    )}
                  </div>

                  {/* Command Dashboard */}
                  <div className="flex items-center gap-3.5 w-full max-w-xs justify-center pt-2">

                    {/* Toggle sound ticks */}
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`p-3 rounded-full border transition-all cursor-pointer ${soundEnabled
                        ? isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-650'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}
                      title={soundEnabled ? "Sesi Kapat" : "Sesi Aç"}
                    >
                      {soundEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
                    </button>

                    <button
                      onClick={toggleTimer}
                      className={`flex-1 font-bold py-3 px-6 rounded-full text-xs shadow-md transition-all cursor-pointer ${timerActive
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20'
                        }`}
                    >
                      {timerActive ? 'Durdur' : 'Seansı Başlat'}
                    </button>

                    <button
                      onClick={resetTimer}
                      className={`p-3 border rounded-full transition-all cursor-pointer ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      title="Sıfırla"
                    >
                      <RotateCcw className="h-4.5 w-4.5" />
                    </button>

                  </div>

                </div>

                {/* Brushing Log list & Streak info */}
                <div className="lg:col-span-5 space-y-6">

                  {/* Streak Card */}
                  <div className="bg-gradient-to-tr from-indigo-500 to-sky-500 text-white p-6 rounded-2xl shadow-lg border border-indigo-400/30 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -z-10"></div>

                    <div className="flex items-center space-x-2.5">
                      <div className="bg-white/20 p-2 rounded-lg text-white">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">SAĞLIKLI ALIŞKANLIK SERİSİ</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-3xl font-black">7 Gün Streak!</h3>
                      <p className="text-xs text-indigo-100 font-bold">Diş fırçalama gayretiniz son 7 günde hiç bozulmadı.</p>
                    </div>
                  </div>

                  {/* History List */}
                  <div className={`${bgCard} border p-6 space-y-4`}>
                    <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">AKŞAM/SABAH KAYITLARI</h3>

                    {brushingLogs.length > 0 ? (
                      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                        {brushingLogs.map((log) => (
                          <div
                            key={log.id}
                            className={`flex items-center justify-between p-3 border rounded-xl transition-colors ${isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-100'
                              }`}
                          >
                            <div className="space-y-1">
                              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} block`}>
                                {log.date} @ {log.time}
                              </span>
                              <p className="text-[10px] text-slate-450 font-semibold">
                                Süre: {log.duration} saniye • Verimlilik: %{log.score}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2.5">
                              <span className="text-[10.5px] text-[#2cbd85] bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">LİNKED</span>
                              <button
                                onClick={() => deleteBrushingLog(log.id)}
                                className="text-slate-450 hover:text-rose-500 p-1 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-4 text-center">Henüz kaydedilmiş fırçalama seansı yok.</p>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className={`border-t py-6 ${isDark ? 'bg-[#090d16] border-slate-900' : 'bg-white border-slate-100'} transition-all mt-15`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] text-slate-450 text-slate-500 space-y-1">
          <p className="font-semibold">© 2026 DentsAI Diş Sağlığı Portali - Tüm Hakları Saklıdır.</p>
          <p className="text-[9px] uppercase font-bold tracking-widest text-indigo-500/40">Hasta İletişim Güvenlik Altyapısı</p>
        </div>
      </footer>

    </div>
  );
}
