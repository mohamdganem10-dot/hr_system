import React, { useState, useEffect } from 'react';
import { Building, CheckCircle, UserCog, Mail, Palette, UserPlus, Edit, Trash2, X } from 'lucide-react';
import { users as initialUsers, departments as initialDepartments } from '../data/mockData';
import { User, UserRole, UserStatus, Department } from '../types';

// Constants for Roles
const ROLES: UserRole[] = ['مدير', 'مدير قسم', 'موارد بشرية', 'مالية', 'مستخدم'];

// --- User Management Component ---
const UserManagement: React.FC<{ departments: Department[] }> = ({ departments }) => {
    const [users, setUsers] = useState<User[]>(() => {
        try { const saved = localStorage.getItem('users'); return saved ? JSON.parse(saved) : initialUsers; } 
        catch { return initialUsers; }
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: ROLES[4], department: departments[0]?.name || '' });

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    const handleOpenModal = (user: User | null = null) => {
        setEditingUser(user);
        const defaultDepartment = departments[0]?.name || '';
        setFormData(user ? { name: user.name, email: user.email, role: user.role, department: user.department } : { name: '', email: '', role: ROLES[4], department: defaultDepartment });
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUsers(prev => {
            if (editingUser) {
                return prev.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
            } else {
                return [...prev, { id: Date.now().toString(), status: 'active', ...formData }];
            }
        });
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
                            <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2">{departments.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}</select>
                            <div className="flex justify-end gap-4"><button type="button" onClick={handleCloseModal} className="bg-gray-200 p-2 rounded">إلغاء</button><button type="submit" className="bg-blue-600 text-white p-2 rounded">حفظ</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Department Management Component ---
const DepartmentManagement: React.FC<{ departments: Department[], setDepartments: (depts: Department[]) => void }> = ({ departments, setDepartments }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    const handleOpenModal = (dept: Department | null = null) => {
        setEditingDept(dept);
        setFormData(dept ? { name: dept.name, description: dept.description } : { name: '', description: '' });
        setIsModalOpen(true);
    };
    const handleCloseModal = () => setIsModalOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: The `setDepartments` prop expects a `Department[]` array, not a function.
        // The functional update form was causing a type error because the prop type was not defined to accept a function.
        // This is changed to compute the new state array first using the `departments` prop and then pass it to `setDepartments`.
        if (editingDept) {
            setDepartments(departments.map(d => d.id === editingDept.id ? { ...d, ...formData } : d));
        } else {
            setDepartments([...departments, { id: Date.now().toString(), ...formData }]);
        }
        handleCloseModal();
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm('هل أنت متأكد؟')) setDepartments(departments.filter(d => d.id !== id));
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">إدارة الأقسام</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Building className="ml-2" size={18}/>إضافة قسم</button>
            </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-right">
                     <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-3">الاسم</th><th className="p-3">الوصف</th><th className="p-3">إجراءات</th></tr></thead>
                     <tbody>
                         {departments.map(d => <tr key={d.id} className="border-b dark:border-gray-700">
                             <td className="p-3">{d.name}</td><td className="p-3">{d.description}</td>
                             <td className="p-3"><div className="flex justify-end gap-2">
                                <button onClick={() => handleOpenModal(d)} className="p-2 hover:text-blue-600"><Edit size={18}/></button>
                                <button onClick={() => handleDelete(d.id)} className="p-2 hover:text-red-600"><Trash2 size={18}/></button>
                            </div></td>
                         </tr>)}
                     </tbody>
                 </table>
             </div>
             {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{editingDept ? 'تعديل' : 'إضافة'} قسم</h2><button onClick={handleCloseModal}><X/></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="اسم القسم" required className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="وصف القسم" rows={3} className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                            <div className="flex justify-end gap-4"><button type="button" onClick={handleCloseModal} className="bg-gray-200 p-2 rounded">إلغاء</button><button type="submit" className="bg-blue-600 text-white p-2 rounded">حفظ</button></div>
                        </form>
                    </div>
                </div>
             )}
        </div>
    )
}

// --- General Settings Component ---
const GeneralSettings: React.FC = () => {
    const [settings, setSettings] = useState(() => {
        try { const saved = localStorage.getItem('generalSettings'); return saved ? JSON.parse(saved) : { companyName: 'مؤسستي' }; } 
        catch { return { companyName: 'مؤسستي' }; }
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    
    useEffect(() => {
        localStorage.setItem('generalSettings', JSON.stringify(settings));
    }, [settings]);

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogoPreview(base64String);
                setSettings(s => ({ ...s, logo: base64String }));
            };
            reader.readAsDataURL(event.target.files[0]);
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
                <input value={settings.companyName} onChange={e=>setSettings(s => ({...s, companyName: e.target.value}))} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2"/>
                <div className="flex items-center gap-4">
                    { (logoPreview || settings.logo) ? <img src={logoPreview || settings.logo} alt="Preview" className="w-16 h-16 rounded"/> : <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center"><Building/></div>}
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
    const [mailSettings, setMailSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('mailSettings');
            return saved ? JSON.parse(saved) : { server: '', port: '', username: '', password: '' };
        } catch {
            return { server: '', port: '', username: '', password: '' };
        }
    });

    useEffect(() => {
        localStorage.setItem('mailSettings', JSON.stringify(mailSettings));
    }, [mailSettings]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMailSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
             <h2 className="text-xl font-bold mb-4">إعدادات البريد (SMTP)</h2>
             <form className="space-y-4">
                 <input name="server" value={mailSettings.server} onChange={handleChange} placeholder="خادم SMTP" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <input name="port" value={mailSettings.port} onChange={handleChange} placeholder="المنفذ" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <input name="username" value={mailSettings.username} onChange={handleChange} placeholder="اسم المستخدم" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <input type="password" name="password" value={mailSettings.password} onChange={handleChange} placeholder="كلمة المرور" className="w-full bg-gray-100 dark:bg-gray-700 p-2 rounded"/>
                 <div className="flex justify-end"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">حفظ</button></div>
             </form>
        </div>
    )
}


const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [departments, setDepartments] = useState<Department[]>(() => {
        try { const saved = localStorage.getItem('departments'); return saved ? JSON.parse(saved) : initialDepartments; } 
        catch { return initialDepartments; }
    });

     useEffect(() => {
        localStorage.setItem('departments', JSON.stringify(departments));
    }, [departments]);


    const tabs = [
        { id: 'general', label: 'عام', icon: <Palette size={20}/>, component: <GeneralSettings /> },
        { id: 'users', label: 'المستخدمون', icon: <UserCog size={20}/>, component: <UserManagement departments={departments} /> },
        { id: 'departments', label: 'الأقسام', icon: <Building size={20}/>, component: <DepartmentManagement departments={departments} setDepartments={setDepartments} /> },
        { id: 'mail', label: 'البريد', icon: <Mail size={20}/>, component: <MailSettings/> },
    ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">الإعدادات</h1>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors flex-shrink-0 ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
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