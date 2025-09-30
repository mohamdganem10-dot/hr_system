import React, { useState, useEffect, useRef } from 'react';
import { employees as initialEmployees } from '../data/mockData';
import { Employee, Attachment } from '../types';
import { UserPlus, Edit, Trash2, X, Eye, Paperclip, PlusCircle, CheckCircle, FileUp, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';


// --- Helper Functions & Components ---
const getStatusBadge = (status: Employee['status']) => {
  switch (status) {
    case 'active': return <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">نشط</span>;
    case 'inactive': return <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">غير نشط</span>;
    case 'on_leave': return <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">في إجازة</span>;
  }
};

const simulateUpload = (file: File, onProgress: (progress: number) => void): Promise<void> => {
    return new Promise(resolve => {
        let progress = 0;
        onProgress(0);
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                clearInterval(interval);
                onProgress(100);
                setTimeout(resolve, 300);
            } else {
                onProgress(progress);
            }
        }, 200);
    });
};

const AttachmentItem: React.FC<{ attachment: Attachment; onFileChange: (file: File | null) => void; isSaving: boolean; }> = ({ attachment, onFileChange, isSaving }) => (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        {attachment.isUploading && (
            <div>
                <p className="text-sm text-gray-500 truncate">جاري رفع: {attachment.name}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${attachment.progress}%` }}></div>
                </div>
            </div>
        )}
        {attachment.isUploaded && (
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 truncate">{attachment.name}</p>
                <CheckCircle size={20} className="text-green-500" />
            </div>
        )}
        {!attachment.isUploading && !attachment.isUploaded && (
            <div className="flex justify-between items-center">
                 <label className="text-sm font-medium truncate pr-2">{attachment.name || 'مرفق جديد'}</label>
                 <input type="file" disabled={isSaving} onChange={(e) => onFileChange(e.target.files ? e.target.files[0] : null)} className="w-full max-w-[60%] text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
            </div>
        )}
    </div>
);


// --- Modals ---
const EmployeeModal: React.FC<{
    employee: Employee | null;
    onClose: () => void;
    onSave: (employee: Employee) => void;
}> = ({ employee, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: employee?.name || '', employeeId: employee?.employeeId || '', department: employee?.department || 'تقنية المعلومات',
        position: employee?.position || '', email: employee?.email || '', phone: employee?.phone || '',
        hireDate: employee?.hireDate || '', endDate: employee?.endDate || '', salary: employee?.salary || 0,
    });
    const [photo, setPhoto] = useState<Attachment | null>(employee?.photo || null);
    const [attachments, setAttachments] = useState<Attachment[]>(employee?.attachments || []);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePhotoChange = (file: File | null) => {
        if (file) {
            setPhoto({ id: 'photo', name: file.name, file, url: URL.createObjectURL(file), isUploaded: false });
        }
    };
    
    const handleAttachmentChange = (id: string, file: File | null) => {
        if (!file) return;
        setAttachments(atts => atts.map(att => att.id === id ? { ...att, name: file.name, file } : att));
    };

    const addAttachmentField = () => {
        setAttachments([...attachments, { id: `new_${Date.now()}`, name: '' }]);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        console.log(`--- بدء عملية حفظ الموظف: ${formData.name} ---`);
        console.log(`إنشاء مجلد الموظف في: /employees/${formData.name}/`);

        const uploadPromises: Promise<void>[] = [];

        // Photo upload
        if (photo?.file) {
            console.log(`حفظ المرفق '${photo.name}' إلى: /employees/${formData.name}/`);
            const promise = simulateUpload(photo.file, (progress) => {
                setPhoto(p => p ? { ...p, isUploading: true, progress } : null);
            }).then(() => {
                setPhoto(p => p ? { ...p, isUploading: false, isUploaded: true } : null);
            });
            uploadPromises.push(promise);
        }

        // Attachments upload
        attachments.forEach(att => {
            if (att.file) {
                console.log(`حفظ المرفق '${att.name}' إلى: /employees/${formData.name}/`);
                const promise = simulateUpload(att.file, (progress) => {
                     setAttachments(atts => atts.map(a => a.id === att.id ? {...a, isUploading: true, progress} : a));
                }).then(() => {
                     setAttachments(atts => atts.map(a => a.id === att.id ? {...a, isUploading: false, isUploaded: true} : a));
                });
                uploadPromises.push(promise);
            }
        });
        
        await Promise.all(uploadPromises);

        const finalEmployee: Employee = {
            id: employee?.id || Date.now().toString(), status: employee?.status || 'active',
            ...formData, salary: Number(formData.salary),
            photo: photo ? { ...photo, file: undefined, url: photo.url } : undefined, // Don't store file object
            attachments: attachments.filter(a => a.name).map(a => ({...a, file: undefined})),
        };
        
        console.log(`--- اكتملت عملية حفظ الموظف: ${formData.name} ---`);
        onSave(finalEmployee);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{employee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h2>
                    <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fields */}
                        <input name="name" placeholder="الاسم الكامل" value={formData.name} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/>
                        <input name="employeeId" placeholder="رقم الموظف" value={formData.employeeId} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/>
                        <input type="email" name="email" placeholder="البريد الإلكتروني" value={formData.email} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/>
                        <input type="tel" name="phone" placeholder="رقم الهاتف" value={formData.phone} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/>
                        <input name="department" placeholder="القسم" value={formData.department} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/>
                        <input name="position" placeholder="المسمى الوظيفي" value={formData.position} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/>
                        <div className="relative"><input type="number" name="salary" placeholder="الراتب" value={formData.salary} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2 pl-6" disabled={isSaving}/><span className="absolute left-2 top-2 text-gray-400">$</span></div>
                        <div><label className="text-sm">تاريخ التعيين</label><input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/></div>
                        <div><label className="text-sm">انتهاء العقد</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2" disabled={isSaving}/></div>
                    </div>
                     <div className="border-t pt-4 mt-4">
                        <h3 className="font-bold mb-2">المرفقات والصورة</h3>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-4">
                               <img src={photo?.url || 'https://via.placeholder.com/80'} alt="Preview" className="w-20 h-20 rounded-full object-cover"/>
                               <div className="flex-1">
                                   <label className="block text-sm font-medium mb-1">الصورة الشخصية</label>
                                    {photo?.isUploading && (
                                       <div>
                                            <p className="text-sm text-gray-500 truncate">جاري رفع: {photo.name}</p>
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${photo.progress}%` }}></div>
                                            </div>
                                       </div>
                                   )}
                                   {photo?.isUploaded && (
                                       <div className="flex items-center gap-2 text-green-600">
                                           <CheckCircle size={16}/>
                                           <span className="font-semibold">تم الرفع بنجاح</span>
                                       </div>
                                   )}
                                   {!photo?.isUploading && !photo?.isUploaded && (
                                       <input type="file" accept="image/*" disabled={isSaving} onChange={(e) => handlePhotoChange(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                                   )}
                               </div>
                            </div>
                        </div>
                         {attachments.map((att) => (
                           <AttachmentItem key={att.id} attachment={att} onFileChange={(file) => handleAttachmentChange(att.id, file)} isSaving={isSaving}/>
                        ))}
                         <button type="button" onClick={addAttachmentField} disabled={isSaving} className="mt-3 text-blue-600 flex items-center gap-1 text-sm disabled:opacity-50"><PlusCircle size={16}/><span>إضافة مرفق آخر</span></button>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg disabled:opacity-50">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">{isSaving ? 'جاري الحفظ...' : (employee ? 'حفظ' : 'إضافة')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ViewEmployeeModal: React.FC<{
    employee: Employee;
    onClose: () => void;
}> = ({ employee, onClose }) => {
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                       <img src={employee.photo?.url || 'https://via.placeholder.com/80'} alt={employee.name} className="w-16 h-16 rounded-full object-cover"/>
                       <div>
                           <h2 className="text-2xl font-bold">{employee.name}</h2>
                           <p className="text-gray-500">{employee.position}</p>
                       </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div><p className="font-semibold text-gray-500">رقم الموظف:</p><p>{employee.employeeId}</p></div>
                        <div><p className="font-semibold text-gray-500">البريد الإلكتروني:</p><p className="text-blue-500">{employee.email}</p></div>
                        <div><p className="font-semibold text-gray-500">رقم الهاتف:</p><p>{employee.phone}</p></div>
                        <div><p className="font-semibold text-gray-500">القسم:</p><p>{employee.department}</p></div>
                        <div><p className="font-semibold text-gray-500">الراتب:</p><p>${employee.salary.toLocaleString('en-US')}</p></div>
                        <div><p className="font-semibold text-gray-500">تاريخ التعيين:</p><p>{employee.hireDate}</p></div>
                        {employee.endDate && <div><p className="font-semibold text-gray-500">انتهاء العقد:</p><p>{employee.endDate}</p></div>}
                        <div><p className="font-semibold text-gray-500">الحالة:</p><p>{getStatusBadge(employee.status)}</p></div>
                    </div>
                    {employee.attachments.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                             <h3 className="font-bold mb-2">المرفقات</h3>
                             <ul className="space-y-2">
                                 {employee.attachments.map((att, i) => (
                                     <li key={i} className="flex items-center gap-2 text-blue-600 hover:underline">
                                         <Paperclip size={16}/><a href={att.url || '#'} target="_blank" rel="noopener noreferrer">{att.name}</a>
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    )}
                </div>
                <div className="text-left mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-6 py-2 rounded-lg">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

const ImportCSVModal: React.FC<{
    onClose: () => void;
    onImport: (newEmployees: Employee[]) => void;
}> = ({ onClose, onImport }) => {
    const [csvData, setCsvData] = useState<any[]>([]);
    const [csvErrors, setCsvErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileParse = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCsvData([]);
        setCsvErrors([]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const requiredHeaders = ['name', 'employeeId', 'department', 'position', 'email', 'phone', 'status', 'hireDate', 'salary'];
                const headers = results.meta.fields || [];
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    setCsvErrors([`ملف CSV يفتقد الأعمدة المطلوبة: ${missingHeaders.join(', ')}`]);
                    return;
                }
                
                setCsvData(results.data);
            },
            error: (error) => {
                setCsvErrors([`حدث خطأ أثناء تحليل الملف: ${error.message}`]);
            }
        });
    };

    const handleConfirmImport = () => {
        const newEmployees: Employee[] = csvData.map((row, index) => ({
            id: `csv_${Date.now()}_${index}`,
            name: row.name,
            employeeId: row.employeeId,
            department: row.department,
            position: row.position,
            email: row.email,
            phone: row.phone,
            status: row.status as Employee['status'] || 'active',
            hireDate: row.hireDate,
            salary: Number(row.salary) || 0,
            attachments: [],
        }));
        onImport(newEmployees);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">استيراد الموظفين من ملف CSV</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="mb-4">
                    <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileParse} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    <p className="text-xs text-gray-500 mt-1">يجب أن يحتوي الملف على الأعمدة: name, employeeId, department, position, email, phone, status, hireDate, salary</p>
                </div>
                {csvErrors.length > 0 && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                        <p className="font-bold">أخطاء</p>
                        {csvErrors.map((error, i) => <p key={i}>{error}</p>)}
                    </div>
                )}
                {csvData.length > 0 && (
                    <div className="flex-1 overflow-y-auto border rounded-lg">
                        <table className="w-full text-right text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>{Object.keys(csvData[0]).map(key => <th key={key} className="p-2 font-semibold">{key}</th>)}</tr>
                            </thead>
                            <tbody>
                                {csvData.map((row, i) => (
                                    <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        {Object.values(row).map((val: any, j) => <td key={j} className="p-2 truncate max-w-xs">{val}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="flex justify-end gap-4 pt-4 mt-auto">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg">إلغاء</button>
                    <button onClick={handleConfirmImport} disabled={csvData.length === 0 || csvErrors.length > 0} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">تأكيد الاستيراد</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---
const Employees: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>(() => {
        try {
            const saved = localStorage.getItem('employees');
            return saved ? JSON.parse(saved) : initialEmployees;
        } catch {
            return initialEmployees;
        }
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        localStorage.setItem('employees', JSON.stringify(employees));
    }, [employees]);


    const handleOpenEditModal = (employee: Employee | null = null) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };
    
    const handleOpenViewModal = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsViewModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsEditModalOpen(false);
        setIsViewModalOpen(false);
        setIsImportModalOpen(false);
        setSelectedEmployee(null);
    };

    const handleSave = (employee: Employee) => {
        setEmployees(prev => {
            const exists = prev.find(e => e.id === employee.id);
            if (exists) {
                return prev.map(e => e.id === employee.id ? employee : e);
            }
            return [...prev, employee];
        });
        handleCloseModals();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
            setEmployees(employees.filter(e => e.id !== id));
        }
    };
    
    const handleImport = (newEmployees: Employee[]) => {
        setEmployees(prev => [...prev, ...newEmployees]);
    };

  return (
    <>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">إدارة الموظفين</h1>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <button onClick={() => setIsImportModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <FileUp size={20} className="ml-2"/>
                    <span>استيراد من CSV</span>
                </button>
                <button onClick={() => handleOpenEditModal()} className="w-full sm:w-auto flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <UserPlus size={20} className="ml-2"/>
                    <span>إضافة موظف</span>
                </button>
            </div>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 font-semibold text-sm">الاسم</th>
              <th className="p-3 font-semibold text-sm hidden md:table-cell">رقم الموظف</th>
              <th className="p-3 font-semibold text-sm hidden lg:table-cell">القسم</th>
              <th className="p-3 font-semibold text-sm hidden lg:table-cell">البريد الإلكتروني</th>
              <th className="p-3 font-semibold text-sm">الحالة</th>
              <th className="p-3 font-semibold text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 font-medium flex items-center gap-3">
                   <img src={employee.photo?.url || 'https://via.placeholder.com/40'} alt={employee.name} className="w-10 h-10 rounded-full object-cover hidden sm:block" />
                   {employee.name}
                </td>
                <td className="p-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{employee.employeeId}</td>
                <td className="p-3 hidden lg:table-cell">{employee.department}</td>
                <td className="p-3 text-blue-500 hidden lg:table-cell">{employee.email}</td>
                <td className="p-3">{getStatusBadge(employee.status)}</td>
                <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenViewModal(employee)} className="text-gray-500 hover:text-green-600 dark:hover:text-green-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Eye size={18} />
                        </button>
                         <button onClick={() => handleOpenEditModal(employee)} className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(employee.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
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
    {isEditModalOpen && <EmployeeModal employee={selectedEmployee} onClose={handleCloseModals} onSave={handleSave} />}
    {isViewModalOpen && selectedEmployee && <ViewEmployeeModal employee={selectedEmployee} onClose={handleCloseModals} />}
    {isImportModalOpen && <ImportCSVModal onClose={handleCloseModals} onImport={handleImport} />}
    </>
  );
};

export default Employees;