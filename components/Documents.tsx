import React, { useState, useEffect } from 'react';
import { documents as initialDocuments, projects as initialProjects } from '../data/mockData';
import { Document, Attachment, Project } from '../types';
import { FileUp, Edit, Trash2, X, Eye, CheckCircle } from 'lucide-react';

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

const DocumentModal: React.FC<{
    document: Document | null;
    projects: Project[];
    onClose: () => void;
    onSave: (doc: Document) => void;
}> = ({ document: doc, projects, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: doc?.title || '',
        description: doc?.description || '',
        category: doc?.category || 'الموارد البشرية',
        tags: doc?.tags.join(', ') || '',
        projectId: doc?.projectId || '',
    });
    const [attachment, setAttachment] = useState<Attachment | null>(doc?.attachment || null);
    const [isSaving, setIsSaving] = useState(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (file: File | null) => {
        if(file) {
            setAttachment({ id: 'doc_file', name: file.name, file });
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalDocData: Omit<Document, 'id' | 'uploader' | 'uploadDate'> = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            projectId: formData.projectId || undefined,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        };

        let finalAttachment = attachment;

        if (attachment?.file) {
            setIsSaving(true);
            const projectName = projects.find(p => p.id === formData.projectId)?.title || 'general';
            const filePath = `/documents/${projectName}/${formData.category}/${attachment.name}`;
            console.log(`--- بدء رفع المستند ---`);
            console.log(`حفظ المستند إلى: ${filePath}`);

            await simulateUpload(attachment.file, (progress) => {
                setAttachment(att => att ? { ...att, isUploading: true, progress } : null);
            });
            
            const uploadedAttachment = { ...attachment, isUploading: false, isUploaded: true, file: undefined };
            setAttachment(uploadedAttachment);
            finalAttachment = uploadedAttachment;

            console.log(`--- اكتمل رفع المستند ---`);
        }


        const finalDoc: Document = {
            id: doc?.id || Date.now().toString(),
            uploader: doc?.uploader || 'عبدالله الأحمد', // Mock current user
            uploadDate: doc?.uploadDate || new Date().toISOString().split('T')[0],
            ...finalDocData,
            attachment: finalAttachment || undefined,
        };

        onSave(finalDoc);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{doc ? 'تعديل مستند' : 'رفع مستند جديد'}</h2>
                    <button onClick={onClose} disabled={isSaving} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset disabled={isSaving}>
                        <input name="title" placeholder="عنوان المستند" value={formData.title} onChange={handleChange} required className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2"/>
                        <textarea name="description" placeholder="الوصف" value={formData.description} onChange={handleChange} rows={3} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2 mt-4"></textarea>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2">
                               <option>الموارد البشرية</option><option>المالية</option><option>المشاريع</option><option>القانونية</option>
                            </select>
                            <select name="projectId" value={formData.projectId} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2">
                               <option value="">بلا مشروع</option>
                               {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>
                        <input type="text" name="tags" placeholder="الوسوم (مفصولة بفاصلة)" value={formData.tags} onChange={handleChange} className="w-full bg-gray-100 dark:bg-gray-700 rounded p-2 mt-4"/>
                    </fieldset>
                    
                    <div className="pt-4 border-t mt-4">
                        <label className="block text-sm font-medium mb-2">الملف</label>
                        {!attachment?.isUploaded && (
                            <input type="file" id="file" disabled={isSaving || attachment?.isUploading} onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
                        )}
                        {attachment?.isUploading && (
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${attachment.progress}%` }}></div>
                            </div>
                        )}
                        {attachment?.isUploaded && (
                             <div className="flex items-center gap-2 text-green-600"><CheckCircle size={16}/><span>تم رفع الملف بنجاح: {attachment.name}</span></div>
                        )}
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-lg disabled:opacity-50">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
                           {isSaving ? 'جاري الرفع...' : (doc ? 'حفظ' : 'رفع')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ViewDocumentModal: React.FC<{
    document: Document;
    projects: Project[];
    onClose: () => void;
}> = ({ document: doc, projects, onClose }) => {
    const linkedProject = projects.find(p => p.id === doc.projectId);

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">{doc.title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="space-y-4">
                     <div><p className="font-semibold text-gray-500">الوصف:</p><p className="whitespace-pre-wrap">{doc.description || 'لا يوجد وصف.'}</p></div>
                     <hr className="dark:border-gray-700"/>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><p className="font-semibold text-gray-500">القسم:</p><p>{doc.category}</p></div>
                        {linkedProject && <div><p className="font-semibold text-gray-500">المشروع المرتبط:</p><p className="text-indigo-500">{linkedProject.title}</p></div>}
                        <div><p className="font-semibold text-gray-500">صاحب الرفع:</p><p>{doc.uploader}</p></div>
                        <div><p className="font-semibold text-gray-500">تاريخ الرفع:</p><p>{doc.uploadDate}</p></div>
                     </div>
                     <div>
                        <p className="font-semibold text-gray-500 mb-2">الوسوم:</p>
                        <div className="flex flex-wrap gap-2">
                            {doc.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">{tag}</span>
                            ))}
                        </div>
                     </div>
                </div>
                <div className="text-left mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(() => {
      try {
          const saved = localStorage.getItem('documents');
          return saved ? JSON.parse(saved) : initialDocuments;
      } catch { return initialDocuments; }
  });
  
  const [projects, setProjects] = useState<Project[]>(() => {
      try {
          const saved = localStorage.getItem('projects');
          return saved ? JSON.parse(saved) : initialProjects;
      } catch { return initialProjects; }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
      localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  const handleOpenEditModal = (doc: Document | null = null) => {
    setSelectedDocument(doc);
    setIsEditModalOpen(true);
  };
  
  const handleOpenViewModal = (doc: Document) => {
    setSelectedDocument(doc);
    setIsViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setSelectedDocument(null);
  };

  const handleSave = (doc: Document) => {
    setDocuments(prev => {
        const exists = prev.find(d => d.id === doc.id);
        if (exists) {
            return prev.map(d => d.id === doc.id ? doc : d);
        }
        return [doc, ...prev];
    });
    handleCloseModals();
  };

  const handleDelete = (id: string) => {
    if(window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {
        setDocuments(documents.filter(d => d.id !== id));
    }
  };

  return (
    <>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">أرشيف المستندات</h1>
             <button onClick={() => handleOpenEditModal()} className="w-full md:w-auto flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <FileUp size={20} className="ml-2"/>
                <span>رفع مستند</span>
            </button>
        </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-3 font-semibold text-sm">العنوان</th>
              <th className="p-3 font-semibold text-sm hidden md:table-cell">القسم</th>
              <th className="p-3 font-semibold text-sm hidden lg:table-cell">صاحب الرفع</th>
              <th className="p-3 font-semibold text-sm hidden lg:table-cell">تاريخ الرفع</th>
              <th className="p-3 font-semibold text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3 font-medium">{doc.title}</td>
                <td className="p-3 hidden md:table-cell">{doc.category}</td>
                <td className="p-3 text-gray-600 dark:text-gray-300 hidden lg:table-cell">{doc.uploader}</td>
                <td className="p-3 hidden lg:table-cell">{doc.uploadDate}</td>
                <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenViewModal(doc)} className="text-gray-500 hover:text-green-600 dark:hover:text-green-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Eye size={18} />
                        </button>
                         <button onClick={() => handleOpenEditModal(doc)} className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
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
    {isEditModalOpen && <DocumentModal document={selectedDocument} projects={projects} onClose={handleCloseModals} onSave={handleSave} />}
    {isViewModalOpen && selectedDocument && <ViewDocumentModal document={selectedDocument} projects={projects} onClose={handleCloseModals} />}
    </>
  );
};

export default Documents;