
import React, { useState } from 'react';
import { RefreshCcw, DollarSign, TrendingUp, Save } from 'lucide-react';
import { ExchangeRate } from '../../types';

interface ExchangeRateManagerProps {
  currentRate: ExchangeRate;
  onUpdate: (rate: number) => void;
}

const ExchangeRateManager: React.FC<ExchangeRateManagerProps> = ({ currentRate, onUpdate }) => {
  const [val, setVal] = useState(currentRate.rate.toString());

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <RefreshCcw className="text-blue-600" size={20} />
          <h3 className="font-bold text-slate-800">Tasa Cambiaria</h3>
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-black uppercase tracking-tighter">
          Actualizado: {new Date(currentRate.lastUpdate).toLocaleTimeString()}
        </span>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Bs.</span>
          <input 
            type="number"
            step="0.01"
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-xl font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            value={val}
            onChange={e => setVal(e.target.value)}
          />
        </div>
        <button 
          onClick={() => onUpdate(parseFloat(val))}
          className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
        >
          <Save size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
        <TrendingUp size={14} className="text-green-500" />
        <span>1.00 USD equivale a <b>{val} Bs.</b></span>
      </div>
    </div>
  );
};

export default ExchangeRateManager;
