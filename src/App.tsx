import React, { useState, useEffect } from 'react';
import { ToothDetails } from './types';
import { INITIAL_TEETH } from './data';
import DoctorPortal from './components/DoctorPortal';
import AdminPortal from './components/AdminPortal';
import UnifiedLogin from './components/UnifiedLogin';
import ClinicAdminPortal from './components/ClinicAdminPortal';
import SecretaryPortal from './components/SecretaryPortal';
import LandingPage from './components/LandingPage';
import PatientPortal from './components/PatientPortal';
import { ToastProvider, useToast } from './components/ui/ToastContext';

function AppContent() {
  const toast = useToast();
  const [showLogin, setShowLogin] = useState<boolean>(false);

  // Dark/Light Theme Support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dis_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('dis_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('dis_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [mockUsers, setMockUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('dis_saas_users_v2');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'usr-1',
        name: 'Süper Admin (Yönetici)',
        email: 'admin@dentsai.com',
        password: 'superadmin2026',
        role: 'super_admin',
        clinicId: 'system',
        isTemporaryPassword: false,
        phone: '0500 005 00 00'
      },
      {
        id: 'usr-2',
        name: 'DentGroup Yönetici Admin',
        email: 'group@dentgroup.com',
        password: 'admin',
        role: 'clinic_admin',
        clinicId: 'CLN-101',
        isTemporaryPassword: false,
        phone: '0511 111 11 11'
      },
      {
        id: 'usr-3',
        name: 'Dr. Ahmet Yılmaz',
        email: 'ahmet@dentsai.com',
        password: 'doctor',
        role: 'doctor',
        clinicId: 'CLN-101',
        isTemporaryPassword: false,
        phone: '0522 222 22 22'
      },
      {
        id: 'usr-6',
        name: 'Yeni Hekim (Geçici Şifreli)',
        email: 'yeni@dentsai.com',
        password: 'TEMP-NEW123',
        role: 'doctor',
        clinicId: 'CLN-101',
        isTemporaryPassword: true,
        phone: '0555 555 55 55'
      }
    ];
  });

  const [clinics, setClinics] = useState<any[]>(() => {
    const saved = localStorage.getItem('dis_saas_clinics');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'CLN-101',
        name: 'DentGroup Kadıköy Ana Klinik',
        logoUrl: '🦷',
        themeColor: '#3B82F6',
        status: 'active',
        packageName: 'Enterprise',
        doctorLimit: 25,
        storageLimit: 500,
        aiScanLimit: 10000,
        doctorCount: 4,
        storageUsed: 342.8,
        aiScanCount: 7820,
        createdDate: '2025-01-14',
        phone: '0216 444 3 444'
      },
      {
        id: 'CLN-102',
        name: 'DentSpa Cihangir VIP Estetik',
        logoUrl: '✨',
        themeColor: '#2ED0E1',
        status: 'active',
        packageName: 'Professional',
        doctorLimit: 12,
        storageLimit: 200,
        aiScanLimit: 5000,
        doctorCount: 3,
        storageUsed: 134.5,
        aiScanCount: 4120,
        createdDate: '2025-03-22',
        phone: '0212 251 40 40'
      }
    ];
  });

  // Save changes automatically
  useEffect(() => {
    localStorage.setItem('dis_saas_users_v2', JSON.stringify(mockUsers));
  }, [mockUsers]);

  useEffect(() => {
    localStorage.setItem('dis_saas_clinics', JSON.stringify(clinics));
  }, [clinics]);

  // Reset showLogin on logout to return to Landing Homepage
  useEffect(() => {
    if (!currentUser) {
      setShowLogin(false);
    }
  }, [currentUser]);

  const fetchClinics = async () => {
    try {
      const response = await fetch("http://localhost:8000/clinics/");
      if (response.ok) {
        const data = await response.json();
        const mapped = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          logoUrl: c.logo_url || "🦷",
          themeColor: c.theme_color || "#3B82F6",
          status: c.status || "passive",
          packageName: c.package_name || "Standard",
          doctorLimit: c.doctor_limit || 5,
          storageLimit: c.storage_limit || 50,
          aiScanLimit: c.ai_scan_limit || 1000,
          doctorCount: c.doctor_count || 0,
          storageUsed: Number(c.storage_used) || 0.0,
          aiScanCount: c.ai_scan_count || 0,
          createdDate: c.created_date || new Date().toISOString().split("T")[0],
          phone: c.phone || "",
          adminEmail: c.admin_email || "",
          temporaryPassword: c.temporary_password || ""
        }));
        setClinics(mapped);
      }
    } catch (err) {
      console.error("Klinikler yüklenirken hata oluştu:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/users/");
      if (response.ok) {
        const data = await response.json();
        setMockUsers(prev => {
          const updated = [...prev];
          data.forEach((usr: any) => {
            const emailClean = usr.email.toLowerCase().trim();
            const idx = updated.findIndex(u => u.email.toLowerCase().trim() === emailClean);
            const userObj = {
              id: usr.id,
              name: usr.name,
              email: usr.email,
              role: usr.role,
              clinicId: usr.clinic_id || "system",
              isTemporaryPassword: Boolean(usr.is_temporary_password),
              password: usr.password,
              phone: usr.phone_number,
              phoneNumber: usr.phone_number
            };
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], ...userObj };
            } else {
              updated.push(userObj);
            }
          });
          return updated;
        });
      }
    } catch (err) {
      console.error("Kullanıcılar yüklenirken hata oluştu:", err);
    }
  };

  const fetchDoctors = async (tempPasswordMapping?: Record<string, string>, clinicId?: string) => {
    try {
      const url = clinicId ? `http://localhost:8000/doctors/?clinic_id=${clinicId}` : "http://localhost:8000/doctors/";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setMockUsers(prev => {
          const mappedDoctors = data.map((doc: any) => {
            const emailClean = doc.email.toLowerCase().trim();
            const existing = prev.find(u => u.email.toLowerCase().trim() === emailClean);
            const tempPassword = tempPasswordMapping?.[emailClean] || (existing ? existing.password : '');
            const isTemp = tempPasswordMapping?.[emailClean] ? true : (existing ? existing.isTemporaryPassword : false);
            return {
              id: doc.user_id,
              name: doc.name,
              email: doc.email,
              role: existing ? existing.role : 'doctor',
              clinicId: doc.clinic_id,
              isTemporaryPassword: isTemp,
              password: tempPassword,
              phoneNumber: doc.phone_number,
              phone: doc.phone_number,
              diplomaNo: doc.diploma_no,
              specialty: doc.specialty || '',
              education: doc.education || '',
              bio: doc.bio || '',
              avatarUrl: doc.avatar_url || ''
            };
          });
          const emailsInMapped = new Set(mappedDoctors.map(d => d.email.toLowerCase().trim()));
          const nonDoctors = prev.filter(u => !emailsInMapped.has(u.email.toLowerCase().trim()));
          return [...nonDoctors, ...mappedDoctors];
        });
      }
    } catch (err) {
      console.error("Hekimler yüklenirken hata oluştu:", err);
    }
  };

  useEffect(() => {
    fetchClinics();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser?.clinicId && currentUser.clinicId !== 'system') {
      fetchDoctors(undefined, currentUser.clinicId);
    } else {
      fetchDoctors();
    }
  }, [currentUser]);

  useEffect(() => {
    const currentClinicId = currentUser?.clinicId;
    const currentClinic = clinics.find(c => c.id === currentClinicId);
    const themeColor = currentClinic?.themeColor || '#3B82F6';
    document.documentElement.style.setProperty('--color-clinic-accent', themeColor);
  }, [currentUser, clinics]);

  const handleCreateUser = async (name: string, email: string, role: 'doctor' | 'secretary' | 'patient', phone?: string, customPassword?: string) => {
    const exists = mockUsers.some(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
    if (exists) {
      const errMsg = `Hata: "${email}" e-posta adresi sistemde zaten kayıtlıdır.`;
      toast.error(errMsg);
      throw new Error(errMsg);
    }

    const tempPassword = customPassword || 'temp-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    if (role === 'doctor') {
      try {
        const docClinicId = (currentUser && currentUser.clinicId && currentUser.clinicId !== 'system') ? currentUser.clinicId : 'CLN-101';
        const response = await fetch('http://localhost:8000/doctors/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: 'usr-' + Date.now(),
            email: email.trim(),
            password: tempPassword,
            name: name.trim(),
            phone_number: phone || null,
            clinic_id: docClinicId,
            diploma_no: 'DIP-' + Math.floor(1000 + Math.random() * 9000),
            specialty: 'Genel Diş Hekimi',
            education: 'Diş Hekimliği Fakültesi',
            bio: 'Uzman Hekim',
            avatar_url: ''
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          let errMsg = 'Hekim kaydı oluşturulamadı.';
          if (errData && errData.detail) {
            if (Array.isArray(errData.detail)) {
              errMsg = errData.detail.map((e: any) => {
                const locStr = e.loc ? e.loc.join('.') : '';
                return `${locStr}: ${e.msg}`;
              }).join('\n');
            } else {
              errMsg = String(errData.detail);
            }
          }
          toast.error(errMsg);
          throw new Error(errMsg);
        }

        await fetchDoctors({ [email.toLowerCase().trim()]: tempPassword }, currentUser?.clinicId);
        toast.success('Hekim kaydı başarıyla oluşturuldu.');

      } catch (err: any) {
        console.error('Hekim kayıt hatası:', err);
        throw err;
      }
    } else {
      const newUsr = {
        id: 'usr-' + Date.now(),
        name,
        email,
        password: tempPassword,
        role,
        clinicId: currentUser ? currentUser.clinicId : 'system',
        isTemporaryPassword: true,
        phone: phone || '0505 000 00 00'
      };
      setMockUsers(prev => [...prev, newUsr]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dis_current_user');
  };


  // App Global States backed by LocalStorage
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('dis_username') || 'Selin Aydın';
  });

  const [teeth, setTeeth] = useState<ToothDetails[]>(() => {
    const saved = localStorage.getItem('dis_teeth');
    return saved ? JSON.parse(saved) : INITIAL_TEETH;
  });

  useEffect(() => {
    localStorage.setItem('dis_username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('dis_teeth', JSON.stringify(teeth));
  }, [teeth]);



  // 1. GATED ENTRY: Landing Page and Unified Login
  if (!currentUser) {
    if (!showLogin) {
      return (
        <LandingPage
          onEnterLogin={() => setShowLogin(true)}
          theme={theme}
        />
      );
    }

    return (
      <UnifiedLogin
        mockUsers={mockUsers}
        clinics={clinics}
        onLoginSuccess={(session) => {
          setCurrentUser(session);
          setUserName(session.name);
          localStorage.setItem('dis_current_user', JSON.stringify(session));
          localStorage.setItem('dis_username', session.name);
        }}
        onUpdateUserPassword={(email, newPassword) => {
          // Check if user is a clinic admin and update active state of clinic
          const targetUser = mockUsers.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
          if (targetUser && targetUser.role === 'clinic_admin') {
            setClinics(prev => prev.map(c => {
              if (c.id === targetUser.clinicId) {
                return { ...c, status: 'active' };
              }
              return c;
            }));
          }

          setMockUsers(prev => prev.map(u => {
            if (u.email.toLowerCase().trim() === email.toLowerCase().trim()) {
              return { ...u, password: newPassword, isTemporaryPassword: false };
            }
            return u;
          }));
        }}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  // 2. ROLE-BASED REDIRECTION
  if (currentUser.role === 'super_admin') {
    return (
      <AdminPortal
        onExit={handleLogout}
        theme={theme}
        setTheme={setTheme}
        clinics={clinics}
        onUpdateClinic={async (updated) => {
          try {
            const response = await fetch(`http://localhost:8000/clinics/${updated.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: updated.id,
                name: updated.name,
                logo_url: updated.logoUrl,
                theme_color: updated.themeColor,
                status: updated.status,
                package_name: updated.packageName,
                doctor_limit: updated.doctorLimit,
                storage_limit: updated.storageLimit,
                ai_scan_limit: updated.aiScanLimit,
                doctor_count: updated.doctorCount || 0,
                storage_used: updated.storageUsed || 0.0,
                ai_scan_count: updated.aiScanCount || 0,
                phone: updated.phone,
                admin_email: updated.adminEmail,
                temporary_password: updated.temporaryPassword
              })
            });

            if (!response.ok) {
              const errData = await response.json();
              let errMsg = 'Klinik güncellenemedi.';
              if (errData && errData.detail) {
                if (Array.isArray(errData.detail)) {
                  errMsg = errData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                } else {
                  errMsg = errData.detail;
                }
              }
              toast.error(errMsg);
              throw new Error(errMsg);
            }

            setClinics(prev => prev.map(c => c.id === updated.id ? updated : c));
          } catch (err) {
            console.error('Klinik güncelleme hatası:', err);
            throw err;
          }
        }}
        onCreateClinic={async (newClinic) => {
          try {
            const response = await fetch('http://localhost:8000/clinics/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                id: newClinic.id,
                name: newClinic.name,
                logo_url: newClinic.logoUrl,
                theme_color: newClinic.themeColor,
                status: newClinic.status || 'passive',
                package_name: newClinic.packageName,
                doctor_limit: newClinic.doctorLimit,
                storage_limit: newClinic.storageLimit,
                ai_scan_limit: newClinic.aiScanLimit,
                phone: newClinic.phone,
                admin_email: newClinic.adminEmail,
                temporary_password: newClinic.temporaryPassword,
                created_date: newClinic.createdDate
              })
            });

            if (!response.ok) {
              const errData = await response.json();
              let errMsg = 'Klinik eklenemedi.';
              if (errData && errData.detail) {
                if (Array.isArray(errData.detail)) {
                  errMsg = errData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                } else {
                  errMsg = errData.detail;
                }
              }
              toast.error(errMsg);
              throw new Error(errMsg);
            }

            await fetchClinics();
            toast.success('Klinik kaydı başarıyla oluşturuldu.');

            if (newClinic.adminEmail && newClinic.temporaryPassword) {
              const newAdminUser = {
                id: 'usr-' + Date.now(),
                name: `${newClinic.name} Yöneticisi`,
                email: newClinic.adminEmail.toLowerCase().trim(),
                password: newClinic.temporaryPassword.trim(),
                role: 'clinic_admin',
                clinicId: newClinic.id,
                isTemporaryPassword: true,
                phone: newClinic.phone || '0500 000 00 00'
              };
              setMockUsers(prev => [...prev, newAdminUser]);
            }
          } catch (err) {
            console.error('Klinik ekleme hatası:', err);
            throw err;
          }
        }}
        onDeleteClinic={async (id) => {
          try {
            const response = await fetch(`http://localhost:8000/clinics/${id}`, {
              method: 'DELETE'
            });

            if (!response.ok) {
              const errData = await response.json();
              let errMsg = 'Klinik silinemedi.';
              if (errData && errData.detail) {
                if (Array.isArray(errData.detail)) {
                  errMsg = errData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
                } else {
                  errMsg = errData.detail;
                }
              }
              toast.error(errMsg);
              throw new Error(errMsg);
            }

            setClinics(prev => prev.filter(c => c.id !== id));
            toast.success('Klinik sistemden başarıyla silindi.');
          } catch (err) {
            console.error('Klinik silme hatası:', err);
            throw err;
          }
        }}
        mockUsers={mockUsers}
        onCreateUser={(name, email, role, phone, clnId, customPassword) => {
          const newUsr = {
            id: 'usr-' + Date.now(),
            name,
            email,
            password: customPassword || 'temp-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            role,
            clinicId: clnId || 'system',
            isTemporaryPassword: true,
            phone: phone || '0500 000 00 00'
          };
          setMockUsers(prev => [...prev, newUsr]);
        }}
        onDeleteUser={(id) => {
          setMockUsers(prev => prev.filter(u => u.id !== id));
        }}
      />
    );
  }

  if (currentUser.role === 'clinic_admin') {
    return (
      <ClinicAdminPortal
        onExit={handleLogout}
        theme={theme}
        setTheme={setTheme}
        clinicId={currentUser.clinicId}
        clinics={clinics}
        mockUsers={mockUsers}
        onUpdateClinic={(updated) => {
          setClinics(prev => prev.map(c => c.id === updated.id ? updated : c));
        }}
        onCreateUser={handleCreateUser}
        onDeleteUser={(id) => {
          setMockUsers(prev => prev.filter(u => u.id !== id));
        }}
        patientName={userName}
        patientTeeth={teeth}
        updatePatientTeeth={setTeeth}
        currentUser={currentUser}
      />
    );
  }

  if (currentUser.role === 'doctor') {
    return (
      <DoctorPortal
        onExit={handleLogout}
        theme={theme}
        setTheme={setTheme}
        patientName={userName}
        patientTeeth={teeth}
        updatePatientTeeth={setTeeth}
        clinicId={currentUser.clinicId}
        clinics={clinics}
        mockUsers={mockUsers}
        onCreateUser={handleCreateUser}
        onDeleteUser={(id) => {
          setMockUsers(prev => prev.filter(u => u.id !== id));
        }}
        currentUser={currentUser}
      />
    );
  }

  if (currentUser.role === 'secretary') {
    return (
      <SecretaryPortal
        onExit={handleLogout}
        theme={theme}
        setTheme={setTheme}
        clinicId={currentUser.clinicId}
        clinics={clinics}
        mockUsers={mockUsers}
        onCreateUser={handleCreateUser}
        onDeleteUser={(id) => {
          setMockUsers(prev => prev.filter(u => u.id !== id));
        }}
      />
    );
  }

  if (currentUser.role === 'patient') {
    return (
      <PatientPortal
        onExit={handleLogout}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-slate-950 text-[#2C3E50] dark:text-slate-100">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="text-sm font-semibold">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
