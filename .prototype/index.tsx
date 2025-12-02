import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  ChevronLeft, 
  MoreHorizontal, 
  FileText,
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react';

// --- Mock Data (ข้อมูลจำลอง) ---
const conferences = [
  {
    id: 1,
    title: "AI & Future Technology Summit 2025",
    date: "15 มกราคม 2568",
    endDate: "17 มกราคม 2568",
    time: "09:00 - 16:30",
    location: "Grand Hall, BITEC Bangna",
    registered: 142,
    capacity: 200,
    status: "scheduled", 
    description: "งานสัมมนาเทคโนโลยีแห่งอนาคตและการประยุกต์ใช้ AI ในภาคธุรกิจ (3 วัน)"
  },
  {
    id: 2,
    title: "Digital Marketing Strategy Workshop",
    date: "22 กุมภาพันธ์ 2568",
    endDate: null,
    time: "13:00 - 17:00",
    location: "Meeting Room 401, True Digital Park",
    registered: 50,
    capacity: 50,
    status: "full", 
    description: "เวิร์กชอปเจาะลึกกลยุทธ์การตลาดออนไลน์สำหรับ SME"
  },
  {
    id: 3,
    title: "HR Tech Conference Thailand",
    date: "10 มีนาคม 2568",
    endDate: null,
    time: "08:30 - 17:00",
    location: "Samyan Mitrtown Hall",
    registered: 80,
    capacity: 300,
    status: "postponed", 
    description: "นวัตกรรมการบริหารทรัพยากรบุคคลยุคใหม่ (เลื่อนการจัดงานอย่างไม่มีกำหนด)"
  },
  {
    id: 4,
    title: "Startup Pitching Day 2025",
    date: "1 เมษายน 2568",
    endDate: null,
    time: "09:00 - 12:00",
    location: "Glowfish Sathorn",
    registered: 10,
    capacity: 100,
    status: "cancelled", 
    description: "เวทีนำเสนอไอเดียธุรกิจสตาร์ทอัพเพื่อระดมทุน"
  }
];

const mockParticipants = [
  { id: 101, confId: 1, name: "สมชาย ใจดี", org: "บริษัท เทคโซลูชั่น จำกัด", position: "Senior Developer", email: "somchai@tech.co.th", phone: "081-111-1111", status: "confirmed", regDate: "01/12/2567" },
  { id: 102, confId: 1, name: "วิภาดา รักงาน", org: "SME Bank", position: "Marketing Manager", email: "wiphada@sme.com", phone: "089-222-2222", status: "pending", regDate: "02/12/2567" },
  { id: 103, confId: 1, name: "ก้องเกียรติ มั่นคง", org: "Freelance", position: "Designer", email: "kong@design.io", phone: "090-333-3333", status: "cancelled", regDate: "03/12/2567" },
  { id: 104, confId: 1, name: "อารียา สุขใจ", org: "มหาวิทยาลัยเชียงใหม่", position: "Researcher", email: "areeya@cmu.ac.th", phone: "086-444-4444", status: "confirmed", regDate: "05/12/2567" },
  { id: 105, confId: 1, name: "ณัฐพล คนเก่ง", org: "Startup One", position: "CTO", email: "nattapol@startup.one", phone: "087-555-5555", status: "confirmed", regDate: "06/12/2567" },
];

// --- Components ---

// *** New Component: Registration Modal ***
const RegistrationModal = ({ isOpen, onClose, conference }) => {
  if (!isOpen || !conference) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
        alert(`ลงทะเบียนสำเร็จสำหรับงาน: ${conference.title}`);
        onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">ลงทะเบียนเข้าร่วมงาน</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{conference.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Modal Body (Form) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
            <input 
                required 
                type="text" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                placeholder="กรอกชื่อและนามสกุล" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">หน่วยงาน <span className="text-red-500">*</span></label>
                <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="ระบุบริษัท/องค์กร" 
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ตำแหน่ง</label>
                <input 
                    type="text" 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="ระบุตำแหน่ง" 
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">อีเมล <span className="text-red-500">*</span></label>
                <input 
                    required 
                    type="email" 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="name@example.com" 
                />
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                <input 
                    required 
                    type="tel" 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm" 
                    placeholder="08x-xxx-xxxx" 
                />
             </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-700">
             <CheckCircle size={14} className="mt-0.5 shrink-0" />
             <p>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน ระบบจะส่งอีเมลยืนยันการลงทะเบียนไปยังอีเมลที่ท่านระบุไว้</p>
          </div>

          <div className="pt-2 flex gap-3 justify-end border-t border-gray-100 mt-6">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors text-sm"
            >
              ยกเลิก
            </button>
            <button 
                type="submit" 
                className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium shadow-sm hover:shadow transition-all flex items-center gap-2 text-sm"
            >
              <UserPlus size={18} />
              ยืนยันการลงทะเบียน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    scheduled: "bg-blue-100 text-blue-700 border-blue-200",   
    open: "bg-green-100 text-green-700 border-green-200",      
    confirmed: "bg-green-100 text-green-700 border-green-200", 
    full: "bg-orange-100 text-orange-700 border-orange-200",   
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200", 
    closed: "bg-gray-100 text-gray-600 border-gray-200",       
    cancelled: "bg-red-100 text-red-700 border-red-200",       
    postponed: "bg-purple-100 text-purple-700 border-purple-200", 
  };

  const labels = {
    scheduled: "ตามกำหนด",
    open: "เปิดลงทะเบียน",
    confirmed: "ยืนยันแล้ว",
    full: "ที่นั่งเต็ม",
    pending: "รอชำระเงิน",
    closed: "ปิดรับสมัคร",
    cancelled: "ยกเลิก",
    postponed: "เลื่อน",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.closed}`}>
      {labels[status] || status}
    </span>
  );
};

const DateDisplay = ({ startDate, endDate, iconSize = 16 }) => (
  <div className="flex items-center gap-2">
    <Calendar size={iconSize} className="text-blue-500 shrink-0" />
    <span>
      {startDate}
      {endDate && endDate !== startDate ? ` - ${endDate}` : ''}
    </span>
  </div>
);

const Header = () => (
  <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-2 rounded-lg">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">EventReg System</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-right hidden sm:block">
          <p className="font-medium text-gray-900">แอดมิน (Admin)</p>
          <p className="text-gray-500 text-xs">แผนกทรัพยากรบุคคล</p>
        </div>
        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
          A
        </div>
      </div>
    </div>
  </header>
);

const ConferenceList = ({ onSelect, onRegisterClick }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">รายการการประชุม</h2>
          <p className="text-gray-500 text-sm mt-1">จัดการและดูรายละเอียดการประชุมทั้งหมด</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
          <UserPlus size={18} />
          <span>สร้างการประชุมใหม่</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conferences.map((conf) => {
          const isUnavailable = ['full', 'closed', 'cancelled', 'postponed'].includes(conf.status);
          
          return (
            <div key={conf.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <StatusBadge status={conf.status} />
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{conf.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{conf.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <DateDisplay startDate={conf.date} endDate={conf.endDate} />
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-500 shrink-0" />
                    <span>{conf.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-500 shrink-0" />
                    <span className="truncate">{conf.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-5 py-4 border-t border-gray-100 mt-auto">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Users size={16} />
                    <span>{conf.registered} / {conf.capacity} คน</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${conf.registered >= conf.capacity ? 'bg-orange-500' : 'bg-blue-500'}`}
                      style={{ width: `${(conf.registered / conf.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={isUnavailable}
                    onClick={() => onRegisterClick(conf)}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm
                      ${isUnavailable 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {conf.status === 'cancelled' ? <XCircle size={16}/> : 
                     conf.status === 'postponed' ? <AlertTriangle size={16}/> : 
                     <UserPlus size={16} />}
                    <span>
                        {conf.status === 'cancelled' ? 'ยกเลิกแล้ว' :
                         conf.status === 'postponed' ? 'เลื่อน' :
                         conf.status === 'full' ? 'เต็ม' : 'ลงทะเบียน'}
                    </span>
                  </button>
                  <button 
                    onClick={() => onSelect(conf)}
                    className="py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    ดูรายชื่อ
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ParticipantList = ({ conference, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter logic (simple search)
  const filteredParticipants = mockParticipants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.org.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <button onClick={onBack} className="hover:text-blue-600">รายการประชุม</button>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-xs">{conference.title}</span>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mt-1"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{conference.title}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                    <DateDisplay startDate={conference.date} endDate={conference.endDate} iconSize={14} />
                </span>
                <span className="flex items-center gap-1"><MapPin size={14}/> {conference.location}</span>
                <StatusBadge status={conference.status} />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             <div className="text-right px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="block text-xs text-blue-600 font-semibold uppercase tracking-wide">ยอดลงทะเบียน</span>
                <span className="text-2xl font-bold text-blue-800">{conference.registered} คน</span>
             </div>
          </div>
        </div>

        {/* Tools Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ หรือ หน่วยงาน..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
              Export Excel
            </button>
            <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center justify-center gap-2">
              <UserPlus size={16} /> เพิ่มชื่อ
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                <th className="px-6 py-4">หน่วยงาน / ตำแหน่ง</th>
                <th className="px-6 py-4">ข้อมูลติดต่อ</th>
                <th className="px-6 py-4">วันที่ลงทะเบียน</th>
                <th className="px-6 py-4 text-center">สถานะ</th>
                <th className="px-6 py-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParticipants.length > 0 ? (
                filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{participant.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{participant.org}</div>
                      <div className="text-xs text-gray-500">{participant.position}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-gray-600">
                        <span>{participant.email}</span>
                        <span className="text-gray-400 text-xs">{participant.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {participant.regDate}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={participant.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-blue-600 p-1">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="text-gray-300" />
                      <p>ไม่พบข้อมูลผู้ลงทะเบียน</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
           <span className="text-sm text-gray-500">แสดง {filteredParticipants.length} รายการ จากทั้งหมด {filteredParticipants.length} รายการ</span>
           <div className="flex gap-2">
             <button className="px-3 py-1 border rounded bg-white text-gray-400 text-sm disabled:opacity-50" disabled>ก่อนหน้า</button>
             <button className="px-3 py-1 border rounded bg-white text-gray-600 text-sm hover:bg-gray-50">ถัดไป</button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [view, setView] = useState("list"); 
  const [selectedConference, setSelectedConference] = useState(null);
  
  // Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regModalConference, setRegModalConference] = useState(null);

  const handleSelectConference = (conf) => {
    setSelectedConference(conf);
    setView("participants");
    window.scrollTo(0,0);
  };

  const handleBack = () => {
    setView("list");
    setSelectedConference(null);
  };

  const openRegistrationModal = (conf) => {
    setRegModalConference(conf);
    setIsRegModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setIsRegModalOpen(false);
    setTimeout(() => setRegModalConference(null), 200); // Clear data after animation
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main>
        {view === "list" ? (
          <ConferenceList 
            onSelect={handleSelectConference} 
            onRegisterClick={openRegistrationModal} 
          />
        ) : (
          <ParticipantList conference={selectedConference} onBack={handleBack} />
        )}
      </main>

      {/* Global Registration Modal */}
      <RegistrationModal 
        isOpen={isRegModalOpen} 
        onClose={closeRegistrationModal} 
        conference={regModalConference} 
      />
    </div>
  );
}