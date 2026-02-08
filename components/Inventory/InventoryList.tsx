
import React from 'react';
import { InventoryItem } from '../../types';
import { AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
}

const InventoryList: React.FC<InventoryListProps> = ({ items }) => {
  const getStatusColor = (item: InventoryItem) => {
    if (item.stock === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (item.stock <= item.minStock) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = (item: InventoryItem) => {
    if (item.stock === 0) return <XCircle size={16} />;
    if (item.stock <= item.minStock) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Inventario de Repuestos</h2>
        <button className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
          <Plus size={20} />
        </button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">{item.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(item)}`}>
                  {getStatusIcon(item)}
                  Stock: {item.stock} / Min: {item.minStock}
                </span>
                <span className="text-xs text-slate-500">Costo: ${item.cost}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">${item.price}</p>
              <button className="text-xs text-blue-600 font-medium">Editar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryList;
