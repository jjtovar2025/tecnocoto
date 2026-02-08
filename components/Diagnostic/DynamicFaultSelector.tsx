
import React, { useState } from 'react';
import { Smartphone, Laptop, Speaker, Plus, X, Check } from 'lucide-react';

interface FaultSelectorProps {
  deviceType: 'teléfono' | 'computadora' | 'bocina' | 'otro';
  onSelect: (faults: string[]) => void;
}

const FAULT_DATA: Record<string, Record<string, string[]>> = {
  'teléfono': {
    'Pantalla': ['Pantalla rota', 'Pantalla con líneas', 'Touch no responde', 'Pantalla negra'],
    'Audio': ['Bocina sin sonido', 'Micrófono no funciona', 'Auricular dañado'],
    'Carga': ['Puerto dañado', 'Batería no carga', 'Carga intermitente'],
  },
  'computadora': {
    'Pantalla': ['Pantalla rota', 'Bisagras dañadas', 'Backlight falla'],
    'Hardware': ['Teclado no funciona', 'Touchpad muerto', 'No reconoce cargador'],
    'Rendimiento': ['Sobrecalentamiento', 'No arranca sistema', 'Muy lento'],
  },
  'bocina': {
    'Energía': ['No enciende', 'No carga batería'],
    'Audio': ['Sonido distorsionado', 'Ruido estático', 'Un canal falla'],
  },
  'genérico': {
    'Comunes': ['No enciende', 'Problemas de carga', 'Lentitud general', 'Daño por líquido']
  }
};

const DynamicFaultSelector: React.FC<FaultSelectorProps> = ({ deviceType, onSelect }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [customFault, setCustomFault] = useState('');
  
  const categories = FAULT_DATA[deviceType] || FAULT_DATA['genérico'];
  const common = FAULT_DATA['genérico']['Comunes'];

  const toggleFault = (fault: string) => {
    const newSelected = selected.includes(fault) 
      ? selected.filter(s => s !== fault)
      : [...selected, fault];
    setSelected(newSelected);
    onSelect(newSelected);
  };

  const addCustom = () => {
    if (customFault.trim()) {
      toggleFault(customFault.trim());
      setCustomFault('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        {deviceType === 'teléfono' && <Smartphone className="text-blue-600" />}
        {deviceType === 'computadora' && <Laptop className="text-blue-600" />}
        {deviceType === 'bocina' && <Speaker className="text-blue-600" />}
        <h3 className="font-bold text-lg">Diagnóstico de Fallas</h3>
      </div>

      <div className="space-y-6">
        {/* Common Faults */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Fallas Comunes</h4>
          <div className="flex flex-wrap gap-2">
            {common.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => toggleFault(f)}
                className={`px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${
                  selected.includes(f) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:border-blue-300'
                }`}
              >
                {selected.includes(f) && <Check size={14} />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Categories */}
        {Object.entries(categories).map(([cat, faults]) => (
          <div key={cat}>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">{cat}</h4>
            <div className="flex flex-wrap gap-2">
              {faults.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFault(f)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-all flex items-center gap-2 ${
                    selected.includes(f) ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {selected.includes(f) && <Check size={14} />}
                  {f}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Custom Fault */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Agregar otra falla..." 
              className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={customFault}
              onChange={e => setCustomFault(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && addCustom()}
            />
            <button 
              type="button" 
              onClick={addCustom}
              className="bg-slate-100 p-2 rounded-lg text-slate-600 hover:bg-slate-200"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFaultSelector;
