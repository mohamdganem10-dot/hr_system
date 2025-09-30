import { Employee, Document, Project, User, Department } from '../types';

export const employees: Employee[] = [
  { id: '1', name: 'أحمد محمود', employeeId: 'EMP001', department: 'تقنية المعلومات', position: 'مهندس برمجيات', email: 'ahmad.m@example.com', phone: '0501234567', status: 'active', hireDate: '2022-01-15', salary: 3200, photo: { id: 'p1', name: 'ahmad.jpg', url: 'https://picsum.photos/seed/ahmad/200' }, attachments: [] },
  { id: '2', name: 'فاطمة علي', employeeId: 'EMP002', department: 'الموارد البشرية', position: 'أخصائي موارد بشرية', email: 'fatima.a@example.com', phone: '0502345678', status: 'active', hireDate: '2021-11-20', salary: 2500, photo: { id: 'p2', name: 'fatima.jpg', url: 'https://picsum.photos/seed/fatima/200' }, attachments: [] },
  { id: '3', name: 'خالد سعيد', employeeId: 'EMP003', department: 'المالية', position: 'محاسب أول', email: 'khaled.s@example.com', phone: '0503456789', status: 'on_leave', hireDate: '2020-05-10', salary: 2900, photo: { id: 'p3', name: 'khaled.jpg', url: 'https://picsum.photos/seed/khaled/200' }, attachments: [] },
  { id: '4', name: 'سارة إبراهيم', employeeId: 'EMP004', department: 'تقنية المعلومات', position: 'مدير مشروع', email: 'sara.i@example.com', phone: '0504567890', status: 'active', hireDate: '2019-03-01', salary: 4800, photo: { id: 'p4', name: 'sara.jpg', url: 'https://picsum.photos/seed/sara/200' }, attachments: [] },
  { id: '5', name: 'محمد حسن', employeeId: 'EMP005', department: 'القانونية', position: 'مستشار قانوني', email: 'mohamed.h@example.com', phone: '0505678901', status: 'inactive', hireDate: '2022-08-12', salary: 4000, photo: { id: 'p5', name: 'mohamed.jpg', url: 'https://picsum.photos/seed/mohamed/200' }, attachments: [] },
];

export const documents: Document[] = [
  { id: '1', title: 'عقد عمل موظف جديد', description: 'عقد عمل للموظف خالد سعيد', category: 'الموارد البشرية', uploader: 'فاطمة علي', uploadDate: '2024-07-20', tags: ['عقد', 'توظيف'] },
  { id: '2', title: 'التقرير المالي للربع الثاني', description: 'تقرير الأرباح والخسائر للربع الثاني من عام 2024', category: 'المالية', uploader: 'خالد سعيد', uploadDate: '2024-07-18', tags: ['تقرير', 'مالي'], projectId: '3' },
  { id: '3', title: 'خطة مشروع النظام الجديد', description: 'المستندات الكاملة لخطة تطوير النظام الداخلي', category: 'المشاريع', uploader: 'سارة إبراهيم', uploadDate: '2024-07-15', tags: ['مشروع', 'خطة', 'تقنية المعلومات'], projectId: '1' },
  { id: '4', title: 'سياسة الإجازات المحدثة', description: 'تحديث سياسة الإجازات السنوية والمرضية', category: 'الموارد البشرية', uploader: 'فاطمة علي', uploadDate: '2024-07-12', tags: ['سياسة', 'إجازات'] },
];

export const projects: Project[] = [
  { id: '1', title: 'تطوير نظام الأرشفة الإلكتروني', description: 'مشروع لإنشاء نظام جديد لأرشفة المستندات', manager: 'سارة إبراهيم', department: 'تقنية المعلومات', startDate: '2024-05-01', endDate: '2024-12-31', status: 'in_progress', progress: 45, assignedEmployeeIds: ['1', '4'], attachments: [] },
  { id: '2', title: 'حملة تسويقية جديدة', description: 'إطلاق حملة تسويقية للمنتج الجديد', manager: 'علياء منصور', department: 'التسويق', startDate: '2024-06-15', endDate: '2024-09-15', status: 'in_progress', progress: 20, assignedEmployeeIds: [], attachments: [] },
  { id: '3', title: 'إعادة هيكلة القسم المالي', description: 'مشروع لتحديث الإجراءات والأنظمة في القسم المالي', manager: 'خالد سعيد', department: 'المالية', startDate: '2024-02-01', endDate: '2024-07-30', status: 'completed', progress: 100, assignedEmployeeIds: ['3'], attachments: [] },
  { id: '4', title: 'برنامج تدريب الموظفين الجدد', description: 'تطوير وتنفيذ برنامج تدريبي شامل للموظفين الجدد', manager: 'فاطمة علي', department: 'الموارد البشرية', startDate: '2024-08-01', endDate: '2024-10-31', status: 'not_started', progress: 0, assignedEmployeeIds: ['2'], attachments: [] },
];

export const users: User[] = [
    { id: '1', name: 'عبدالله الأحمد', email: 'admin@example.com', role: 'مدير', department: 'الإدارة العليا', status: 'active' },
    { id: '2', name: 'سارة إبراهيم', email: 'sara.i@example.com', role: 'مدير قسم', department: 'تقنية المعلومات', status: 'active' },
    { id: '3', name: 'فاطمة علي', email: 'fatima.a@example.com', role: 'موارد بشرية', department: 'الموارد البشرية', status: 'active' },
    { id: '4', name: 'خالد سعيد', email: 'khaled.s@example.com', role: 'مالية', department: 'المالية', status: 'inactive' },
    { id: '5', name: 'يوسف مراد', email: 'youssef.m@example.com', role: 'مستخدم', department: 'التسويق', status: 'active' },
];

export const departments: Department[] = [
    { id: '1', name: 'تقنية المعلومات', description: 'مسؤول عن البنية التحتية التقنية وتطوير البرمجيات.' },
    { id: '2', name: 'الموارد البشرية', description: 'مسؤول عن شؤون الموظفين والتوظيف والتدريب.' },
    { id: '3', name: 'المالية', description: 'مسؤول عن المحاسبة والميزانيات والتقارير المالية.' },
    { id: '4', name: 'التسويق', description: 'مسؤول عن الترويج للمنتجات والخدمات وإدارة الحملات.' },
    { id: '5', name: 'القانونية', description: 'مسؤول عن الشؤون القانونية والعقود والامتثال.' },
];