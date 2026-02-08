
import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, AlertCircle, Save, Send } from 'lucide-react';
import { Budget, InventoryItem } from '../../types';

interface BudgetGeneratorProps {
  selectedFaults: string[];
  inventory: InventoryItem[];
  onSave: (budget: Budget) => void;
  onSend: (budget: Budget) => void;
}

const SmartBudgetGenerator: React.FC<BudgetGeneratorProps> = ({ selectedFaults, inventory, onSave, onSend }) => {
  const [labor, setLabor] = useState(20); // Base labor
  const [adjustment, setAdjustment] = useState(0);
  const [time, setTime] = useState('24-48 horas');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

  // Suggest labor based on number of faults
  useEffect(() => {
    setLabor(selectedFaults.length * 15 || 20);
  }, [selectedFaults]);

  const partsTotal = selectedParts.reduce((acc, id) => {
    const item = inventory.find(i => i.id === id);
    return acc + (item?.price || 0);
  }, 0);

  const total = partsTotal + labor + adjustment;

  const getBudget = (): Budget => ({
    faults: selectedFaults,
    parts: selectedParts.map(id => {
      const item = inventory.find(i => i.id === id)!;
      return { name: item.name, cost: item.price };
    }),
    laborCost: labor,
    total,
    estimatedTime: time,
    adjustment
  });

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-6 shadow-xl">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <DollarSign className="text-green-400" /> Generador de Presupuesto
        </h3>
        <span className="text-2xl font-black text-green-400">${total}</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Mano de Obra Sugerida</label>
          <input 
            type="number" 
            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={labor}
            onChange={e => setLabor(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Ajuste Manual (Descuento/Extra)</label>
          <input 
            type="number" 
            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={adjustment}
            onChange={e => setAdjustment(Number(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Estimado</label>
          <select 
            className="w-full bg-slate-800 border-none rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            <option>1-3 horas</option>
            <option>Hoy mismo</option>
            <option>24-48 horas</option>
            <option>2-5 días (repuestos)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Repuestos del Inventario</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {inventory.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedParts(prev => prev.includes(item.id) ? prev.filter(p => p !== item.id) : [...prev, item.id])}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  selectedParts.includes(item.id) ? 'bg-green-600 border-green-600 text-white' : 'border-slate-700 text-slate-400'
                }`}
              >
                {item.name} (${item.price})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 grid grid-cols-2 gap-3">
        <button 
          onClick={() => onSave(getBudget())}
          className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
        >
          <Save size={18} /> GUARDAR BORRADOR
        </button>
        <button 
          onClick={() => onSend(getBudget())}
          className="bg-green-600 hover:bg-green-500 p-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
        >
          <Send size={18} /> ENVIAR AL CLIENTE
        </button>
      </div>

      <div className="bg-blue-900/30 border border-blue-800 p-3 rounded-lg flex gap-3">
        <AlertCircle className="text-blue-400 shrink-0" size={20} />
        <p className="text-[10px] text-blue-200">
          El cliente recibirá un mensaje de WhatsApp con el detalle y un enlace de autorización.
        </p>
      </div>
    </div>
  );
};

export default SmartBudgetGenerator;
