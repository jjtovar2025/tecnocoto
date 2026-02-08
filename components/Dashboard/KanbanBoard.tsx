
import React from 'react';
import { Order, OrderStatus } from '../../types';
import { MoreHorizontal, Clock, Smartphone, Computer, Speaker } from 'lucide-react';

interface KanbanBoardProps {
  orders: Order[];
  onMoveOrder: (orderId: string, newStatus: OrderStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ orders, onMoveOrder }) => {
  // Fix: Adjusted 'Reparación' to 'En Reparación' and 'Listo' to 'Listo para Entrega' to match OrderStatus type
  const columns: OrderStatus[] = ['Recepción', 'Diagnóstico', 'En Reparación', 'Listo para Entrega'];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'teléfono': return <Smartphone size={16} />;
      case 'computadora': return <Computer size={16} />;
      case 'bocina': return <Speaker size={16} />;
      default: return <Smartphone size={16} />;
    }
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1000px] h-[calc(100vh-200px)]">
        {columns.map((col) => (
          <div key={col} className="flex-1 bg-slate-100 rounded-xl p-3 flex flex-col gap-3">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">{col}</h3>
              <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full border font-bold">
                {orders.filter(o => o.status === col).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {orders.filter(o => o.status === col).map((order) => (
                <div key={order.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      #{order.orderNumber}
                    </span>
                    <button className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  
                  <h4 className="font-semibold text-sm text-slate-800">iPhone 13 Pro</h4>
                  <p className="text-xs text-slate-500 truncate">Juan Pérez • 0412-386-8364</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-medium">2d</span>
                    </div>
                    <div className="text-slate-400">
                      {getDeviceIcon('teléfono')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
