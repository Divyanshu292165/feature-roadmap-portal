import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, List, MessageSquare, ArrowLeft } from 'lucide-react';

export default function AdminSidebar() {
  return (
    <div className="w-64 bg-white border-r min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-lg font-bold text-gray-900">Admin Panel</span>
      </div>
      <div className="flex-1 py-6 flex flex-col space-y-1 px-3">
        <NavLink to="/admin" end className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
          <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard
        </NavLink>
        <NavLink to="/admin/features" className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
          <List className="mr-3 h-5 w-5" /> Features
        </NavLink>
        <NavLink to="/admin/comments" className={({ isActive }) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
          <MessageSquare className="mr-3 h-5 w-5" /> Comments
        </NavLink>
      </div>
      <div className="p-4 border-t">
        <Link to="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
          <ArrowLeft className="mr-3 h-5 w-5" /> Back to App
        </Link>
      </div>
    </div>
  );
}
