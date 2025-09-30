import React, { useState } from 'react';
import { users as initialUsers } from '../data/mockData';
import { User, UserRole, UserStatus } from '../types';
import { UserPlus, Edit, Trash2, X } from 'lucide-react';

const getStatusBadge = (status: UserStatus) => {
  switch (status) {
    case 'active':
      return <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">نشط</span>;
    case 'inactive':
      return <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">غير نشط</span>;
  }
};

const ROLES: UserRole[] = ['مدير', 'مدير قسم', 'موارد بشرية', 'مالية', 'مستخدم'];
const DEPARTMENTS = ['الإدارة العليا', 'تقنية المعلومات', 'الموارد البشرية', 'المالية', 'التسويق', 'القانونية'];


const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: ROLES[4],
      department: DEPARTMENTS[1],
  });

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role, department: user.department });
    } else {
      setFormData({ name: '', email: '', role: ROLES[4], department: DEPARTMENTS[1] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
        // Edit user
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      } else {
        // Add new user
        const newUser: User = {
            id: (users.length + 1).toString(),
            status: 'active',
            ...formData
        };
        setUsers([...users, newUser]);
      }
      handleCloseModal();
  };

  const handleDelete = (id: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
        setUsers(users.filter(u => u.id !== id));
      }
  };

  const handleToggleStatus = (id: string) => {
      setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };


  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة المستخدمين</h1>
              <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <UserPlus size={20} className="ml-2"/>
                  <span>إضافة مستخدم</span>
              </button>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 font-semibold text-sm">الاسم</th>
                <th className="p-3 font-semibold text-sm">البريد الإلكتروني</th>
                <th className="p-3 font-semibold text-sm">الدور</th>
                <th className="p-3 font-semibold text-sm">القسم</th>
                <th className="p-3 font-semibold text-sm">الحالة</th>
                <th className="p-3 font-semibold text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-blue-500">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{user.department}</td>
                  <td className="p-3 cursor-pointer" onClick={() => handleToggleStatus(user.id)}>{getStatusBadge(user.status)}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(user)} className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h2>
                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">الاسم الكامل</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">البريد الإلكتروني</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium mb-1">الدور</label>
                        <select name="role" id="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500">
                            {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium mb-1">القسم</label>
                        <select name="department" id="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500">
                            {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                            إلغاء
                        </button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                           {editingUser ? 'حفظ التغييرات' : 'إضافة مستخدم'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
};

export default Users;
