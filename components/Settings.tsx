import React, { useState } from 'react';
import { Building, CheckCircle, UserCog, Mail, Palette, UserPlus, Edit, Trash2, X } from 'lucide-react';
import { users as initialUsers, departments as initialDepartments } from '../data/mockData';
import { User, UserRole, UserStatus, Department } from '../types';

// Constants for Roles and Departments
const ROLES: UserRole[] = ['مدير', 'مدير قسم', 'موارد بشرية', 'مالية', 'مستخدم'];
const DEPARTMENTS_LIST = ['الإدارة العليا', 'تقنية المعلومات', 'الموارد البشرية', 'المالية', 'التسويق', 'القانونية'];

// --- User Management Component ---
const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: ROLES[4], department: DEPARTMENTS_LIST[1] });

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        setFormData(user ? { name: user.name, email: user.email, role: user.role, department: user.department } : { name: '', email: '', role: ROLES[4], department: DEPARTMENTS_LIST[1] });
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
        } else {
            setUsers([...users, { id: Date.now().toString(), status: 'active', ...formData }]);
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('هل أنت متأكد؟')) setUsers(users.filter(u => u.id !== id));
    };

    const getStatusBadge = (status: UserStatus) => status === 'active' 
        ? <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">نشط</span>
        : <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">غير نشط</span>;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">إدارة المستخدمين</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <UserPlus size={20} className="ml-2"/><span>إضافة مستخدم</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3">الاسم</th><th className="p-3">البريد</th><th className="p-3">الدور</th><th className="p-3">القسم</th><th className="p-3">الحالة</th><th className="p-3">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                        <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="p-3">{user.name}</td><td className="p-3">{user.email}</td><td className="p-3">{user.role}</td><td className="p-3">{user.department}</td><td className="p-3">{getStatusBadge(user.status)}</td>
                            <td className="p-3">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleOpenModal(user)} className="p-2 hover:text-blue-600"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(user.id)} className="p-2 hover:text-red-600"><Trash2 size={18}/></button>
                                </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{editingUser ? 'تعديل' : 'إضافة'} مستخدم</h2><button onClick={handleCloseModal}><X/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="الاسم" required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2"/>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="البريد" required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2"/>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2">{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select>
                            <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2">{DEPARTMENTS_LIST.map(d=><option key={d} value={d}>{d}</option>)}</select>
                            <div className="flex justify-end gap-4"><button type="button" onClick={handleCloseModal} className="bg-gray-200 p-2 rounded">إلغاء</button><button type="submit" className="bg-blue-600 text-white p-2 rounded">حفظ</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Department Management Component ---
const DepartmentManagement: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>(initialDepartments);
    // Modal logic would be similar to UserManagement
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">إدارة الأقسام</h2>
             <div className="overflow-x-auto">
                 <table className="w-full text-right">
                     <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-3">الاسم</th><th className="p-3">الوصف</th><th className="p-3">إجراءات</th></tr></thead>
                     <tbody>
                         {departments.map(d => <tr key={d.id} className="border-b dark:border-gray-700">
                             <td className="p-3">{d.name}</td><td className="p-3">{d.description}</td>
                             <td className="p-3"><div className="flex justify-end gap-2"><button className="p-2 hover:text-blue-600"><Edit size={18}/></button><button className="p-2 hover:text-red-600"><Trash2 size={18}/></button></div></td>
                         </tr>)}
                     </tbody>
                 </table>
             </div>
             <button className="mt-4 flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><UserPlus className="ml-2"/>إضافة قسم</button>
        </div>
    )
}

// --- General Settings Component ---
const GeneralSettings: React.FC = () => {
    const [companyName, setCompanyName] = useState('مؤسستي');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setLogoPreview(URL.createObjectURL(event.target.files[0]));
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">إعدادات عامة</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <input value={companyName} onChange={e=>setCompanyName(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2"/>
                <div className="flex items-center gap-4">
                    {logoPreview ? <img src={logoPreview} alt="Preview" className="w-16 h-16 rounded"/> : <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center"><Building/></div>}
                    <input type="file" accept="image/*" onChange={handleLogoChange}/>
                </div>
                <div className="flex justify-end items-center gap-4">
                    {isSaved && <div className="flex items-center text-green-600"><CheckCircle size={20} className="ml-2"/><span>تم الحفظ!</span></div>}
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">حفظ</button>
                </div>
            </form>
        </div>
    )
}

// --- Mail Settings Component ---
const MailSettings: React.FC = () => {
    return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
             <h2 className="text-xl font-bold mb-4">إعدادات البريد (SMTP)</h2>
             <form className="space-y-4">
                 <input placeholder="خادم SMTP" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <input placeholder="المنفذ" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <input placeholder="اسم المستخدم" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <input type="password" placeholder="كلمة المرور" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <div className="flex justify-end"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">حفظ</button></div>
             </form>
        </div>
    )
}


const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'عام', icon: <Palette size={20}/>, component: <GeneralSettings /> },
        { id: 'users', label: 'المستخدمون', icon: <UserCog size={20}/>, component: <UserManagement/> },
        { id: 'departments', label: 'الأقسام', icon: <Building size={20}/>, component: <DepartmentManagement/> },
        { id: 'mail', label: 'البريد', icon: <Mail size={20}/>, component: <MailSettings/> },
    ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">الإعدادات</h1>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                  {tab.icon}
                  {tab.label}
              </button>
          ))}
      </div>

      <div className="mt-6">
          {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default Settings;