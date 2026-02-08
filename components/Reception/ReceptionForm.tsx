
import React, { useState } from 'react';
import { Camera, ChevronRight, Save, Send, Printer, CheckCircle, Plus, ShieldAlert } from 'lucide-react';
import { Order, Checklist, Customer, Device } from '../../types';
import SignaturePad from './SignaturePad';
import { useThermalPrint } from '../../hooks/useThermalPrint';
import { sendWhatsAppOrder } from '../../utils/whatsapp';

interface ReceptionFormProps {
  onSave: (order: Order) => void;
}

const ReceptionForm: React.FC<ReceptionFormProps> = ({ onSave }) => {
  const { printOrder } = useThermalPrint();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  const [customer, setCustomer] = useState<Partial<Customer>>({ phone: '0412-386-8364' });
  const [device, setDevice] = useState<Partial<Device>>({ type: 'teléfono' });
  const [checklist, setChecklist] = useState<Checklist>({
    powersOn: false,
    screenCondition: 'Sana',
    chargingPort: 'Funciona',
    battery: 'Normal',
    liquidDamage: false,
    previousRepair: false
  });
  const [signature, setSignature] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setPhotos([...photos, event.target.result as string]);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      orderNumber: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      customerId: customer.name || 'Anónimo',
      deviceId: `${device.brand} ${device.model}`,
      status: 'Recepción',
      checklist,
      entryDate: new Date().toISOString(),
      signature,
      photos,
      totalPrice: 0
    };
    onSave(newOrder);
    setLastOrder(newOrder);
    setIsSuccess(true);
  };

  const resetForm = () => {
    setIsSuccess(false);
    setStep(1);
    setCustomer({ phone: '0412-386-8364' });
    setDevice({ type: 'teléfono' });
    setChecklist({ powersOn: false, screenCondition: 'Sana', chargingPort: 'Funciona', battery: 'Normal', liquidDamage: false, previousRepair: false });
    setSignature('');
    setPhotos([]);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={56} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900">¡Recibido!</h2>
          <p className="text-slate-500 mt-2 font-medium">La orden #{lastOrder?.orderNumber} ha sido registrada.</p>
        </div>
        <div className="grid gap-3 pt-4">
          <button onClick={() => lastOrder && printOrder(lastOrder, customer as Customer, device as Device)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
            <Printer size={20} /> IMPRIMIR TICKET (Bluetooth)
          </button>
          <button onClick={() => lastOrder && sendWhatsAppOrder(lastOrder, customer as Customer, device as Device)} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
            <Send size={20} /> ENVIAR POR WHATSAPP
          </button>
          <button onClick={resetForm} className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 mt-4">
            <Plus size={20} /> NUEVA RECEPCIÓN
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl mx-auto">
      <div className="bg-slate-50 flex border-b border-slate-100">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="p-8 space-y-8">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-black text-xl text-slate-800 tracking-tight">Identificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Cliente</label>
                <input required type="text" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                  value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                <input required type="tel" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca / Equipo</label>
                <input required type="text" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={device.brand} onChange={e => setDevice({...device, brand: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo o Serial (IMEI)</label>
                <input required type="text" className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={device.serial} onChange={e => setDevice({...device, serial: e.target.value})} />
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
              Checklist Técnico <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-black text-xl text-slate-800 tracking-tight">Estado del Equipo</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700">¿El equipo enciende?</span>
                <input type="checkbox" className="w-7 h-7 rounded-lg text-blue-600 focus:ring-blue-500" checked={checklist.powersOn} onChange={e => setChecklist({...checklist, powersOn: e.target.checked})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado de Pantalla</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Sana', 'Rota', 'Líneas'].map(val => (
                    <button key={val} type="button" onClick={() => setChecklist({...checklist, screenCondition: val as any})}
                      className={`py-3 rounded-xl border text-xs font-black uppercase tracking-tighter transition-all ${checklist.screenCondition === val ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-500'}`}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} />
                  <span className="text-sm font-black uppercase tracking-tighter">Señales de Líquido</span>
                </div>
                <input type="checkbox" className="w-7 h-7 rounded-lg text-red-600 focus:ring-red-500" checked={checklist.liquidDamage} onChange={e => setChecklist({...checklist, liquidDamage: e.target.checked})} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {photos.map((p, i) => (
                <div key={i} className="aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-inner">
                  <img src={p} className="w-full h-full object-cover" />
                </div>
              ))}
              <label className="aspect-square bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors">
                <Camera className="text-slate-400" />
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>

            <button type="button" onClick={() => setStep(3)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2">
              Términos de Servicio <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-black text-xl text-slate-800 tracking-tight">Legal y Firma</h3>
            <div className="p-5 bg-slate-900 text-white rounded-3xl text-[10px] leading-relaxed italic border-4 border-slate-800 shadow-2xl">
              <p className="mb-3">1. Garantía solo por falla reparada (30 días).</p>
              <p className="mb-3">2. No nos hacemos responsables por equipos mojados o con reparaciones previas.</p>
              <p className="text-blue-400 font-bold">3. CLÁUSULA DE RETENCIÓN: Dispone de 90 días para retirar el equipo. Transcurrido este tiempo, Tecno Coto retendrá el equipo como garantía de pago o disposición final.</p>
            </div>
            
            <SignaturePad onSave={setSignature} onClear={() => setSignature('')} />

            <div className="pt-4 space-y-3">
              <button type="submit" className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-green-100 transition-transform active:scale-95">
                <Save size={24} /> REGISTRAR ENTRADA
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-slate-400 font-bold py-2 hover:text-slate-600 transition-colors">
                Editar Datos Previos
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default ReceptionForm;
