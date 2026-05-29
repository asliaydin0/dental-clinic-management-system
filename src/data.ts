import { ToothDetails, BrushingLog, AnalysisFile } from './types';

export const INITIAL_TEETH: ToothDetails[] = [
  // Upper Right (18 to 11)
  { id: 18, name: "Üst Sağ Üçüncü Azı (Yirmilik)", zone: "upper-right", status: "completed", notes: "Yirmilik diş çekimi başarıyla tamamlandı.", treatments: [{ type: "cekme", date: "2025-11-12", description: "Cerrahi çekim yapıldı." }] },
  { id: 17, name: "Üst Sağ İkinci Azı", zone: "upper-right", status: "healthy", notes: "", treatments: [] },
  { id: 16, name: "Üst Sağ Birinci Azı", zone: "upper-right", status: "risk", notes: "Yüzeysel renklenme mevcut, fırçalamada özen gösterilmeli.", treatments: [] },
  { id: 15, name: "Üst Sağ İkinci Küçük Azı", zone: "upper-right", status: "healthy", notes: "", treatments: [] },
  { id: 14, name: "Üst Sağ Birinci Küçük Azı", zone: "upper-right", status: "healthy", notes: "", treatments: [] },
  { id: 13, name: "Üst Sağ Köpek Dişi", zone: "upper-right", status: "healthy", notes: "", treatments: [] },
  { id: 12, name: "Üst Sağ Yan Kesici", zone: "upper-right", status: "healthy", notes: "", treatments: [] },
  { id: 11, name: "Üst Sağ Orta Kesici", zone: "upper-right", status: "healthy", notes: "", treatments: [] },

  // Upper Left (21 to 28)
  { id: 21, name: "Üst Sol Orta Kesici", zone: "upper-left", status: "healthy", notes: "", treatments: [] },
  { id: 22, name: "Üst Sol Yan Kesici", zone: "upper-left", status: "healthy", notes: "", treatments: [] },
  { id: 23, name: "Üst Sol Köpek Dişi", zone: "upper-left", status: "healthy", notes: "", treatments: [] },
  { id: 24, name: "Üst Sol Birinci Küçük Azı", zone: "upper-left", status: "treatment", notes: "Hafif hassasiyet var, dolgu planlanıyor.", treatments: [] },
  { id: 25, name: "Üst Sol İkinci Küçük Azı", zone: "upper-left", status: "healthy", notes: "", treatments: [] },
  { id: 26, name: "Üst Sol Birinci Azı", zone: "upper-left", status: "completed", notes: "Kanal tedavisi tamamlandı.", treatments: [{ type: "kanal", date: "2026-02-15", description: "Kanal dolgusu ve kompozit restorasyon." }] },
  { id: 27, name: "Üst Sol İkinci Azı", zone: "upper-left", status: "healthy", notes: "", treatments: [] },
  { id: 28, name: "Üst Sol Üçüncü Azı (Yirmilik)", zone: "upper-left", status: "healthy", notes: "Henüz sürmemiş.", treatments: [] },

  // Lower Left (38 to 31)
  { id: 38, name: "Alt Sol Üçüncü Azı (Yirmilik)", zone: "lower-left", status: "healthy", notes: "", treatments: [] },
  { id: 37, name: "Alt Sol İkinci Azı", zone: "lower-left", status: "healthy", notes: "", treatments: [] },
  { id: 36, name: "Alt Sol Birinci Azı", zone: "lower-left", status: "healthy", notes: "", treatments: [] },
  { id: 35, name: "Alt Sol İkinci Küçük Azı", zone: "lower-left", status: "healthy", notes: "", treatments: [] },
  { id: 34, name: "Alt Sol Birinci Küçük Azı", zone: "lower-left", status: "healthy", notes: "", treatments: [] },
  { id: 33, name: "Alt Sol Köpek Dişi", zone: "lower-left", status: "healthy", notes: "", treatments: [] },
  { id: 32, name: "Alt Sol Yan Kesici", zone: "lower-left", status: "healthy", notes: "", treatments: [] },
  { id: 31, name: "Alt Sol Orta Kesici", zone: "lower-left", status: "healthy", notes: "", treatments: [] },

  // Lower Right (41 to 48)
  { id: 41, name: "Alt Sağ Orta Kesici", zone: "lower-right", status: "healthy", notes: "", treatments: [] },
  { id: 42, name: "Alt Sağ Yan Kesici", zone: "lower-right", status: "healthy", notes: "", treatments: [] },
  { id: 43, name: "Alt Sağ Köpek Dişi", zone: "lower-right", status: "healthy", notes: "", treatments: [] },
  { id: 44, name: "Alt Sağ Birinci Küçük Azı", zone: "lower-right", status: "healthy", notes: "", treatments: [] },
  { id: 45, name: "Alt Sağ İkinci Küçük Azı", zone: "lower-right", status: "healthy", notes: "", treatments: [] },
  { id: 46, name: "Alt Sağ Birinci Azı", zone: "lower-right", status: "risk", notes: "Arayüz çürüğü riski, diş ipi kullanımı artırılmalı.", treatments: [] },
  { id: 47, name: "Alt Sağ İkinci Azı", zone: "lower-right", status: "healthy", notes: "", treatments: [] },
  { id: 48, name: "Alt Sağ Üçüncü Azı (Yirmilik)", zone: "lower-right", status: "healthy", notes: "Sürmüş, sorunsuz.", treatments: [] }
];

export const INITIAL_BRUSHING_LOGS: BrushingLog[] = [
  { id: "1", date: "2026-05-19", time: "08:15", duration: 120, completed: true, score: 95 },
  { id: "2", date: "2026-05-19", time: "22:30", duration: 110, completed: true, score: 88 },
  { id: "3", date: "2026-05-20", time: "08:30", duration: 125, completed: true, score: 92 },
  { id: "4", date: "2026-05-20", time: "21:45", duration: 120, completed: true, score: 96 },
  { id: "5", date: "2026-05-21", time: "08:05", duration: 105, completed: true, score: 85 },
  { id: "6", date: "2026-05-21", time: "23:00", duration: 120, completed: true, score: 90 },
  { id: "7", date: "2026-05-22", time: "08:20", duration: 130, completed: true, score: 98 },
  { id: "8", date: "2026-05-22", time: "22:15", duration: 120, completed: true, score: 94 }
];

export const INITIAL_ANALYSES: AnalysisFile[] = [
  {
    id: "a1",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400",
    date: "2026-05-22",
    status: "completed",
    score: 92,
    plaqueIndex: 12,
    cavitiesCount: 0,
    recommendations: [
      "Ön grup dişlerin arka yüzeylerinde hafif fırçalama eksiği fark edildi.",
      "Sol arka azı bölgesinde diş ipi kullanımını sıklaştırın.",
      "Genel plak oranı mükemmel seviyede (%12)."
    ]
  },
  {
    id: "a2",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400",
    date: "2026-05-18",
    status: "completed",
    score: 84,
    plaqueIndex: 18,
    cavitiesCount: 1,
    recommendations: [
      "Diş minesinde bölgesel sararmalar mevcut.",
      "Üst sol fırçalama kalitesi arttırılmalı."
    ]
  },
  {
    id: "a3",
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=400",
    date: "2026-05-12",
    status: "completed",
    score: 75,
    plaqueIndex: 24,
    cavitiesCount: 2,
    recommendations: [
      "Yoğun plak birikimi görüldü.",
      "Diş ipi kullanımı yetersiz görünmekte."
    ]
  }
];

export const BRUSHING_STEPS = [
  { title: "Üst Sağ Dış Yüzeyler", text: "Fırçayı 45 derece açıyla tutun ve diş etinden dişe doğru dairesel hareketler yapın.", duration: 15 },
  { title: "Üst Ön Dış Yüzeyler", text: "Ön dişlerinizi yukarıdan aşağıya doğru nazikçe dairesel hareketlerle fırçalayın.", duration: 15 },
  { title: "Üst Sol Dış Yüzeyler", text: "Sol üst azı dişlerinin dış yüzeylerini dairesel hareketlerle temizleyin.", duration: 15 },
  { title: "Alt Sol Dış Yüzeyler", text: "Aşağıdan yukarıya, diş etinden dişe doğru hareketlerle fırçalayın.", duration: 15 },
  { title: "Alt Ön Dış Yüzeyler", text: "Alt ön yüzeyleri dairesel ve süpürme hareketleriyle derinlemesine fırçalayın.", duration: 15 },
  { title: "Alt Sağ Dış Yüzeyler", text: "Alt sağ azı bölgesinin dış kısımlarını temizleyin.", duration: 15 },
  { title: "Çiğneme Yüzeyleri (Üst)", text: "Azı dişlerinizin çiğneme yüzeylerini ileri-geri hareketlerle fırçalayın.", duration: 15 },
  { title: "Çiğneme Yüzeyleri (Alt)", text: "Alt azı dişlerinin çiğneme yüzeylerini ileri-geri hareketlerle fırçalayın.", duration: 15 }
];
