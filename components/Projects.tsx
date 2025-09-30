import React, { useState, useEffect } from 'react';
import { projects as initialProjects, employees as initialEmployees } from '../data/mockData';
import { Project, Attachment, Employee } from '../types';
import { FolderPlus, MoreVertical, Edit, Trash2, X, Eye, Paperclip, PlusCircle, Users, CheckCircle } from 'lucide-react';

const getStatusPill = (status: Project['status']) => {
    switch(status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'on_hold': return 'bg-yellow-100 text-yellow-800';
        case 'not_started': return 'bg-gray-100 text-gray-800';
    }
}

const statusMap: { [key in Project['status']]: string } = {
    'completed': 'مكتمل',
    'in_progress': 'قيد التنفيذ',
    'on_hold': 'معلق',
    'not_started': 'لم يبدأ'
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


const ProjectModal: React.FC<{
    project: Project | null;
    employees: Employee[];
    onClose: () => void;
    onSave: (project: Project) => void;
}> = ({ project, employees, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: project?.title || '',
        description: project?.description || '',
        manager: project?.manager || '',
        department: project?.department || 'تقنية المعلومات',
        startDate: project?.startDate || '',
        endDate: project?.endDate || '',
        progress: project?.progress || 0,
        status: project?.status || 'not_started',
    });
    const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>(project?.assignedEmployeeIds || []);
    const [attachments, setAttachments] = useState<Attachment[]>(project?.attachments || []);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'progress' ? Number(value) : value }));
    };

    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => option.value);
        setAssignedEmployeeIds(selectedIds);
    }
    
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
        console.log(`--- بدء عملية حفظ المشروع: ${formData.title} ---`);

        const uploadPromises = attachments
            .filter(att => att.file)
            .map(att => {
                console.log(`حفظ المرفق '${att.name}' إلى: /projects/${formData.title}/`);
                return simulateUpload(att.file!, (progress) => {
                    setAttachments(atts => atts.map(a => a.id === att.id ? { ...a, isUploading: true, progress } : a));
                }).then(() => {
                    setAttachments(atts => atts.map(a => a.id === att.id ? { ...a, isUploading: false, isUploaded: true } : a));
                });
            });

        await Promise.all(uploadPromises);

        const finalProject: Project = {
            id: project?.id || Date.now().toString(),
            ...formData,
            status: formData.status as Project['status'],
            assignedEmployeeIds,
            attachments: attachments.filter(a => a.name).map(a => ({...a, file: undefined}))
        };
        console.log(`--- اكتملت عملية حفظ المشروع: ${formData.title} ---`);
        onSave(finalProject);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{project ? 'تعديل مشروع' : 'مشروع جديد'}</h2>
                    <button onClick={onClose} disabled={isSaving}><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset disabled={isSaving}>
                        <input name="title" placeholder="عنوان المشروع" value={formData.title} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2"/>
                        <textarea name="description" placeholder="الوصف" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mt-4"></textarea>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <input name="manager" placeholder="مدير المشروع" value={formData.manager} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2"/>
                            <input name="department" placeholder="القسم" value={formData.department} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2"/>
                            <div><label className="text-sm">تاريخ البدء</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2"/></div>
                            <div><label className="text-sm">تاريخ الانتهاء</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-2"/></div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">فريق العمل</label>
                            <select multiple value={assignedEmployeeIds} onChange={handleEmployeeSelect} className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                            </select>
                        </div>
                        <div className="mt-4"><label className="block text-sm font-medium">نسبة الإنجاز: {formData.progress}%</label><input type="range" name="progress" min="0" max="100" value={formData.progress} onChange={handleChange} className="w-full"/></div>
                    </fieldset>
                    <div className="border-t pt-4 mt-4">
                        <h3 className="font-bold mb-2">مرفقات المشروع</h3>
                        {attachments.map((att) => (
                            <AttachmentItem key={att.id} attachment={att} onFileChange={(file) => handleAttachmentChange(att.id, file)} isSaving={isSaving}/>
                        ))}
                         <button type="button" onClick={addAttachmentField} disabled={isSaving} className="mt-3 text-blue-600 flex items-center gap-1 text-sm disabled:opacity-50"><PlusCircle size={16}/><span>إضافة مرفق آخر</span></button>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg disabled:opacity-50">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">{isSaving ? 'جاري الحفظ...' : (project ? 'حفظ' : 'إنشاء')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ViewProjectModal: React.FC<{ project: Project; employees: Employee[]; onClose: () => void }> = ({ project, employees, onClose }) => {
    const assignedEmployeesList = employees.filter(emp => project.assignedEmployeeIds.includes(emp.id));
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{project.title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div><p className="font-semibold text-gray-500">الوصف:</p><p>{project.description}</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><p className="font-semibold text-gray-500">مدير المشروع:</p><p>{project.manager}</p></div>
                        <div><p className="font-semibold text-gray-500">القسم:</p><p>{project.department}</p></div>
                        <div><p className="font-semibold text-gray-500">تاريخ البدء:</p><p>{project.startDate}</p></div>
                        <div><p className="font-semibold text-gray-500">تاريخ الانتهاء:</p><p>{project.endDate}</p></div>
                        <div><p className="font-semibold text-gray-500">الحالة:</p><span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusPill(project.status)}`}>{statusMap[project.status]}</span></div>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-500 mb-2">نسبة الإنجاز: <span className="font-bold text-blue-600 dark:text-blue-400">{project.progress}%</span></p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-blue-600 h-4 rounded-full" style={{ width: `${project.progress}%` }}></div></div>
                    </div>
                    {assignedEmployeesList.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                             <h3 className="font-bold mb-2 flex items-center gap-2"><Users size={20}/> فريق العمل</h3>
                             <div className="flex flex-wrap gap-2">
                                 {assignedEmployeesList.map(emp => (
                                     <span key={emp.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm">
                                         <img src={emp.photo?.url || 'https://via.placeholder.com/24'} alt={emp.name} className="w-6 h-6 rounded-full"/>
                                         {emp.name}
                                     </span>
                                 ))}
                             </div>
                        </div>
                    )}
                     {project.attachments.length > 0 && (
                        <div className="border-t pt-4 mt-4">
                             <h3 className="font-bold mb-2">المرفقات</h3>
                             <ul className="space-y-2">
                                 {project.attachments.map((att, i) => (
                                     <li key={i} className="flex items-center gap-2 text-blue-600 hover:underline">
                                         <Paperclip size={16}/><a href={att.url || '#'} target="_blank" rel="noopener noreferrer">{att.name}</a>
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    )}
                </div>
                <div className="text-left mt-6"><button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-6 py-2 rounded-lg">إغلاق</button></div>
            </div>
        </div>
    );
};

const ProjectCard: React.FC<{ project: Project; onEdit: () => void; onDelete: () => void; onView: () => void; }> = ({ project, onEdit, onDelete, onView }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300 relative">
        <div className="absolute top-4 left-4 group">
            <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1"><MoreVertical size={20} /></button>
            <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 hidden group-hover:block z-20">
                <a href="#" onClick={(e) => { e.preventDefault(); onView(); }} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><Eye size={16} className="ml-2" /> عرض</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onEdit(); }} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"><Edit size={16} className="ml-2" /> تعديل</a>
                <a href="#" onClick={(e) => { e.preventDefault(); onDelete(); }} className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"><Trash2 size={16} className="ml-2" /> حذف</a>
            </div>
        </div>
        <div>
            <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 max-w-[80%]">{project.title}</h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusPill(project.status)}`}>{statusMap[project.status]}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10 overflow-hidden">{project.description}</p>
            <div className="text-sm space-y-2 text-gray-700 dark:text-gray-300">
                <p><span className="font-semibold">مدير المشروع:</span> {project.manager}</p>
            </div>
        </div>
        <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">نسبة الإنجاز</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
        </div>
    </div>
);

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
      try {
          const saved = localStorage.getItem('projects');
          return saved ? JSON.parse(saved) : initialProjects;
      } catch { return initialProjects; }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
      try {
          const saved = localStorage.getItem('employees');
          return saved ? JSON.parse(saved) : initialEmployees;
      } catch { return initialEmployees; }
  });
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
      localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);


  const handleOpenEditModal = (project: Project | null = null) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };
  
  const handleOpenViewModal = (project: Project) => {
      setSelectedProject(project);
      setIsViewModalOpen(true);
  }

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedProject(null);
  };

  const handleSave = (project: Project) => {
    setProjects(prev => {
        const exists = prev.find(p => p.id === project.id);
        if (exists) {
            return prev.map(p => p.id === project.id ? project : p);
        }
        return [project, ...prev];
    });
    handleCloseModals();
  };

  const handleDelete = (id: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
        setProjects(projects.filter(p => p.id !== id));
    }
  };

  return (
    <>
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">أرشيف المشاريع</h1>
             <button onClick={() => handleOpenEditModal()} className="w-full md:w-auto flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                <FolderPlus size={20} className="ml-2"/>
                <span>مشروع جديد</span>
            </button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} onView={() => handleOpenViewModal(project)} onEdit={() => handleOpenEditModal(project)} onDelete={() => handleDelete(project.id)} />
        ))}
      </div>
    </div>
    {isEditModalOpen && <ProjectModal project={selectedProject} employees={employees} onClose={handleCloseModals} onSave={handleSave} />}
    {isViewModalOpen && selectedProject && <ViewProjectModal project={selectedProject} employees={employees} onClose={handleCloseModals} />}
    </>
  );
};

export default Projects;