
import React from 'react';
import { Home, PlusCircle, Package, BarChart3, Settings, ClipboardList } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Taller', icon: Home },
    { id: 'reception', label: 'Recepción', icon: PlusCircle },
    { id: 'inventory', label: 'Stock', icon: Package },
    { id: 'finance', label: 'Finanzas', icon: BarChart3 },
    { id: 'config', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full left-0 top-0 z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400">Tecno Coto</h1>
          <p className="text-slate-400 text-xs">Sistema de Gestión v1.0</p>
        </div>
        <nav className="flex-1 mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 sticky top-0 z-40 flex justify-between items-center">
        <h1 className="text-xl font-bold">Tecno Coto</h1>
        <div className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 z-40">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 transition-colors ${
              activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
