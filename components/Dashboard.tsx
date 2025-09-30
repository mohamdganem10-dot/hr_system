
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, FolderKanban, CheckCircle } from 'lucide-react';
import Card from './shared/Card';
import { employees, documents, projects } from '../data/mockData';

const Dashboard: React.FC = () => {
  // Data processing for charts
  const employeesByDept = employees.reduce((acc, employee) => {
    acc[employee.department] = (acc[employee.department] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const chartDataEmployees = Object.keys(employeesByDept).map(key => ({
    name: key,
    'عدد الموظفين': employeesByDept[key],
  }));

  const projectStatus = projects.reduce((acc, project) => {
    const statusMap: { [key: string]: string } = {
        'completed': 'مكتمل',
        'in_progress': 'قيد التنفيذ',
        'on_hold': 'معلق',
        'not_started': 'لم يبدأ'
    }
    const arabicStatus = statusMap[project.status];
    acc[arabicStatus] = (acc[arabicStatus] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const chartDataProjects = Object.keys(projectStatus).map(key => ({
    name: key,
    value: projectStatus[key],
  }));

  const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7'];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">لوحة التحكم</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="إجمالي الموظفين" value={employees.length.toString()} icon={<Users className="text-white" size={28}/>} color="bg-blue-500" />
        <Card title="إجمالي المستندات" value={documents.length.toString()} icon={<FileText className="text-white" size={28}/>} color="bg-green-500" />
        <Card title="المشاريع الجارية" value={projects.filter(p => p.status === 'in_progress').length.toString()} icon={<FolderKanban className="text-white" size={28}/>} color="bg-yellow-500" />
        <Card title="المشاريع المكتملة" value={projects.filter(p => p.status === 'completed').length.toString()} icon={<CheckCircle className="text-white" size={28}/>} color="bg-indigo-500" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">الموظفون حسب القسم</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataEmployees} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fill: 'currentColor' }}/>
              <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#e5e7eb', direction: 'rtl' }} />
              <Legend />
              <Bar dataKey="عدد الموظفين" fill="#3b82f6" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">حالة المشاريع</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartDataProjects}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartDataProjects.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#e5e7eb', direction: 'rtl' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Documents Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">أحدث المستندات</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="p-3 font-semibold text-sm">العنوان</th>
                <th className="p-3 font-semibold text-sm">القسم</th>
                <th className="p-3 font-semibold text-sm">صاحب الرفع</th>
                <th className="p-3 font-semibold text-sm">تاريخ الرفع</th>
              </tr>
            </thead>
            <tbody>
              {documents.slice(0, 4).map((doc, index) => (
                <tr key={doc.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3">{doc.title}</td>
                  <td className="p-3">{doc.category}</td>
                  <td className="p-3">{doc.uploader}</td>
                  <td className="p-3">{doc.uploadDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
