
import React, { useState } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Smartphone, Camera, Wifi, Volume2, Fingerprint } from 'lucide-react';
import { Order, FinalCheck } from '../../types';
import SignaturePad from '../Reception/SignaturePad';

interface FinalChecklistWizardProps {
  order: Order;
  onComplete: (check: FinalCheck) => void;
  onCancel: () => void;
}

const FinalChecklistWizard: React.FC<FinalChecklistWizardProps> = ({ order, onComplete, onCancel }) => {
  const [faultsResolved, setFaultsResolved] = useState<Record<string, boolean>>(
    (order.budget?.faults || []).reduce((acc, fault) => ({ ...acc, [fault]: true }), {})
  );

  const [generalChecks, setGeneralChecks] = useState({
    systemBoot: true,
    touchScreen: true,
    audio: true,
    cameras: true,
    connectivity: true,
    biometrics: true
  });

  const [signature, setSignature] = useState('');
  const [conformity, setConformity] = useState(false);

  const handleComplete = () => {
    if (!signature || !conformity) {
      alert("Se requiere la firma y aceptación del cliente.");
      return;
    }
    onComplete({
      faultsResolved,
      generalChecks,
      customerConformity: conformity,
      finalSignature: signature
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl max-w-2xl mx-auto animate-in fade-in zoom-in-95">
      <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-blue-400" /> Verificación Final
          </h2>
          <p className="text-slate-400 text-xs mt-1">Orden #{order.orderNumber} | Cliente Presente</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-white">
          <XCircle size={24} />
        </button>
      </div>

      <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
        {/* Sección 1: Fallas Originales */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Fallas Diagnosticadas</h3>
          <div className="space-y-2">
            {order.budget?.faults.map(fault => (
              <div key={fault} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700">{fault}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFaultsResolved({...faultsResolved, [fault]: true})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${faultsResolved[fault] ? 'bg-green-600 text-white' : 'bg-white text-slate-400 border'}`}
                  >
                    CORREGIDO
                  </button>
                  <button 
                    onClick={() => setFaultsResolved({...faultsResolved, [fault]: false})}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!faultsResolved[fault] ? 'bg-red-600 text-white' : 'bg-white text-slate-400 border'}`}
                  >
                    PERSISTE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 2: Checklist General con Cliente */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Checklist de Calidad</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'systemBoot', label: 'Enciende OK', icon: CheckCircle2 },
              { id: 'touchScreen', label: 'Táctil OK', icon: Smartphone },
              { id: 'audio', label: 'Sonido OK', icon: Volume2 },
              { id: 'cameras', label: 'Cámaras OK', icon: Camera },
              { id: 'connectivity', label: 'WiFi / BT OK', icon: Wifi },
              { id: 'biometrics', label: 'Huella / Rostro', icon: Fingerprint },
            ].map(check => (
              <button
                key={check.id}
                onClick={() => setGeneralChecks({...generalChecks, [check.id]: !generalChecks[check.id as keyof typeof generalChecks]})}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  generalChecks[check.id as keyof typeof generalChecks] ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white text-slate-400 border-slate-100'
                }`}
              >
                <check.icon size={18} />
                <span className="text-xs font-bold uppercase">{check.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Sección 3: Conformidad Legal */}
        <section className="space-y-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-[10px] text-amber-800 leading-relaxed italic">
              "Verifico que mi equipo fue probado en mi presencia y funciona correctamente según lo marcado en este checklist. 
              Acepto los términos de garantía sobre la falla reparada."
            </p>
            <label className="flex items-center gap-3 mt-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-amber-300 text-amber-600"
                checked={conformity}
                onChange={e => setConformity(e.target.checked)}
              />
              <span className="text-xs font-bold text-amber-900">EL CLIENTE ESTÁ DE ACUERDO</span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 text-center uppercase">Firma del Cliente (Entrega)</p>
            <SignaturePad onSave={setSignature} onClear={() => setSignature('')} />
          </div>
        </section>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-3">
        <button 
          onClick={onCancel}
          className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          POSTPONER
        </button>
        <button 
          onClick={handleComplete}
          className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} /> FINALIZAR PRUEBAS
        </button>
      </div>
    </div>
  );
};

export default FinalChecklistWizard;
