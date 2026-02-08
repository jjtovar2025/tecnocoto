
import React, { useState } from 'react';
import { CreditCard, Banknote, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PaymentStatus, PaymentMethod, PaymentRecord } from '../../types';

interface PaymentValidatorProps {
  total: number;
  onConfirm: (record: PaymentRecord) => void;
}

const PaymentValidator: React.FC<PaymentValidatorProps> = ({ total, onConfirm }) => {
  const [received, setReceived] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('Efectivo');

  const getStatus = (): PaymentStatus => {
    if (received >= total) return 'Pagado';
    if (received > 0) return 'Abono Parcial';
    return 'Crédito';
  };

  const remaining = Math.max(0, total - received);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
      <div className="text-center">
        <h3 className="font-bold text-lg text-slate-800">Validación de Pago</h3>
        <p className="text-slate-500 text-sm">Total a cobrar: <span className="font-bold text-slate-900">${total}</span></p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(['Efectivo', 'Transferencia', 'Zelle', 'Pago Móvil'] as PaymentMethod[]).map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                method === m ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white text-slate-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Monto Recibido ($)</label>
          <input 
            type="number" 
            className="w-full p-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-xl font-bold text-slate-900 outline-none focus:border-blue-500"
            value={received || ''}
            onChange={e => setReceived(Number(e.target.value))}
            placeholder="0.00"
          />
        </div>

        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo Pendiente</p>
            <p className={`text-lg font-bold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>${remaining}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Estado Pago</p>
            <p className="text-sm font-bold text-slate-700">{getStatus()}</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onConfirm({ status: getStatus(), method, amountReceived: received, remainingBalance: remaining })}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
      >
        <CheckCircle2 size={20} /> CONFIRMAR Y COMENZAR REPARACIÓN
      </button>
    </div>
  );
};

export default PaymentValidator;
