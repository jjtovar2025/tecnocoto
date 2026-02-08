
import React from 'react';
import { Order } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

interface FinanceSummaryProps {
  orders: Order[];
}

const FinanceSummary: React.FC<FinanceSummaryProps> = ({ orders }) => {
  const data = [
    { name: 'Lun', income: 120 },
    { name: 'Mar', income: 45 },
    { name: 'Mie', income: 250 },
    { name: 'Jue', income: 80 },
    { name: 'Vie', income: 300 },
    { name: 'Sab', income: 150 },
  ];

  const stats = [
    { label: 'Ingresos Mensuales', value: '$840.00', icon: TrendingUp, trend: '+12%', color: 'blue' },
    { label: 'Gastos', value: '$230.00', icon: Wallet, trend: '-5%', color: 'red' },
    { label: 'Utilidad Neta', value: '$610.00', icon: ArrowUpRight, trend: '+18%', color: 'green' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Panel Financiero</h2>
        <p className="text-slate-500">Métricas de rendimiento del taller</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</h4>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Ingresos de la Semana</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="income" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 4 ? '#2563eb' : '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary;
