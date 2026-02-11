
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ReceptionForm from './components/Reception/ReceptionForm';
import InventoryList from './components/Inventory/InventoryList';
import FinanceSummary from './components/Finance/FinanceSummary';
import DynamicFaultSelector from './components/Diagnostic/DynamicFaultSelector';
import SmartBudgetGenerator from './components/Budget/SmartBudgetGenerator';
import PaymentValidator from './components/Payment/PaymentValidator';
import FinalChecklistWizard from './components/Verification/FinalChecklistWizard';
import ExchangeRateManager from './components/Configuration/ExchangeRateManager';
import { Order, InventoryItem, Customer, Device, OrderStatus, Budget, PaymentRecord, ExchangeRate, FinalCheck } from './types';
import { dataService } from './lib/supabase';
import { sendWhatsAppBudget } from './utils/whatsapp';
import { User, ShieldCheck, History, Loader2, RefreshCw, CloudOff, Cloud } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);
  const [selectedOrderForDiag, setSelectedOrderForDiag] = useState<Order | null>(null);
  const [selectedOrderForFinalCheck, setSelectedOrderForFinalCheck] = useState<Order | null>(null);
  const [selectedFaults, setSelectedFaults] = useState<string[]>([]);
  
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    rate: 382.63,
    lastUpdate: new Date().toISOString(),
    source: 'Manual'
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [remoteOrders, remoteInv, remoteRate] = await Promise.all([
        dataService.getOrders(),
        dataService.getInventory(),
        dataService.getExchangeRate()
      ]);
      
      setIsCloud(dataService.isCloud());
      if (remoteOrders) setOrders(remoteOrders);
      if (remoteInv) setInventory(remoteInv);
      if (remoteRate) setExchangeRate(remoteRate);
    } catch (err) {
      console.warn("Fallo de conexión al cargar datos:", err);
      setIsCloud(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddOrder = async (newOrder: Order, customer: Partial<Customer>, device: Partial<Device>) => {
    try {
      await dataService.saveOrder(newOrder, customer, device);
      loadData();
    } catch (err) {
      console.error("Error guardando orden:", err);
      // Fallback visual inmediato
      setOrders([{...newOrder, customer, device} as any, ...orders]);
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus, extra: any = {}) => {
    try {
      await dataService.updateOrderStatus(orderId, status, extra);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status, ...extra } : o));
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  };

  const handleUpdateRate = async (newRate: number) => {
    const updated = { rate: newRate, lastUpdate: new Date().toISOString(), source: 'Manual' as const };
    setExchangeRate(updated);
    try {
      await dataService.updateExchangeRate(updated);
    } catch (err) {
      console.error("Error guardando tasa:", err);
    }
  };

  const handleDiagSave = (budget: Budget) => {
    if (selectedOrderForDiag) {
      updateStatus(selectedOrderForDiag.id, 'Diagnóstico', { budget });
      setSelectedOrderForDiag(null);
    }
  };

  const handleSendBudget = (budget: Budget) => {
    if (selectedOrderForDiag) {
      const cust: Customer = (selectedOrderForDiag as any).customer || { id: 'c', name: 'Cliente', phone: '04123868364', idCard: 'V' };
      const dev: Device = (selectedOrderForDiag as any).device || { id: 'd', brand: 'Generic', model: 'Device', type: 'teléfono', serial: 'SN' };
      sendWhatsAppBudget(selectedOrderForDiag, cust, dev, budget);
      updateStatus(selectedOrderForDiag.id, 'Esperando Autorización', { budget });
      setSelectedOrderForDiag(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="font-bold text-slate-500 animate-pulse uppercase tracking-widest text-xs">Sincronizando Sistema...</p>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedOrderForDiag) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <button onClick={() => setSelectedOrderForDiag(null)} className="text-slate-500 flex items-center gap-2 text-sm font-medium hover:text-slate-800 transition-colors">
              ← Cancelar Diagnóstico
            </button>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tasa Activa</span>
              <p className="text-xs font-bold text-blue-600">{exchangeRate.rate} Bs/$</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <DynamicFaultSelector 
                deviceType={selectedOrderForDiag.checklist.powersOn ? 'teléfono' : 'computadora'} 
                onSelect={setSelectedFaults} 
              />
            </div>
            <SmartBudgetGenerator 
              selectedFaults={selectedFaults} 
              inventory={inventory} 
              onSave={handleDiagSave}
              onSend={handleSendBudget}
            />
          </div>
        </div>
      );
    }

    if (selectedOrderForFinalCheck) {
      return (
        <FinalChecklistWizard 
          order={selectedOrderForFinalCheck} 
          onComplete={(check) => {
            updateStatus(selectedOrderForFinalCheck.id, 'Listo para Entrega', { finalCheck: check });
            setSelectedOrderForFinalCheck(null);
          }}
          onCancel={() => setSelectedOrderForFinalCheck(null)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Flujo de Taller</h2>
                <div className="flex items-center gap-2 mt-1">
                   {isCloud ? (
                     <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                       <Cloud size={12} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Sincronizado</span>
                     </div>
                   ) : (
                     <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                       <CloudOff size={12} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Modo Local (Sin Nube)</span>
                     </div>
                   )}
                </div>
              </div>
              <button onClick={loadData} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                 <RefreshCw size={20} />
              </button>
            </header>
            
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {([
                'Recepción', 
                'Diagnóstico', 
                'Esperando Autorización', 
                'En Reparación', 
                'Pruebas Finales', 
                'Listo para Entrega',
                'Retenido por Impago'
              ] as OrderStatus[]).map(status => (
                <div key={status} className={`rounded-3xl p-3 flex flex-col gap-3 min-w-[300px] border ${
                  status === 'Retenido por Impago' ? 'bg-red-50 border-red-100' : 'bg-slate-100/50 border-slate-200/50'
                }`}>
                   <div className="flex justify-between items-center px-2 py-1">
                     <h3 className={`text-[10px] font-black uppercase tracking-widest ${status === 'Retenido por Impago' ? 'text-red-500' : 'text-slate-500'}`}>
                        {status}
                     </h3>
                     <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-400 border">
                        {orders.filter(o => o.status === status).length}
                     </span>
                   </div>
                   
                   <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                     {orders.filter(o => o.status === status).map(order => (
                       <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-bold text-blue-600">#{order.orderNumber}</span>
                             
                             {status === 'Recepción' && (
                               <button onClick={() => { setSelectedOrderForDiag(order); setSelectedFaults(order.budget?.faults || []); }} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold">DIAGNOSTICAR</button>
                             )}
                             {status === 'En Reparación' && (
                               <button onClick={() => updateStatus(order.id, 'Pruebas Finales')} className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold">TERMINAR</button>
                             )}
                             {status === 'Pruebas Finales' && (
                               <button onClick={() => setSelectedOrderForFinalCheck(order)} className="text-[10px] bg-amber-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                 <ShieldCheck size={12} /> VERIFICAR
                               </button>
                             )}
                             {status === 'Esperando Autorización' && (
                               <button onClick={() => updateStatus(order.id, 'Autorizado')} className="text-[10px] bg-green-600 text-white px-3 py-1.5 rounded-xl font-bold">PAGAR</button>
                             )}
                          </div>

                          <h4 className="font-bold text-slate-800 text-sm">{order.deviceId}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{(order as any).customer?.name || 'Cliente'}</p>

                          {order.budget && (
                            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-end">
                               <div>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">En Bolívares</p>
                                 <p className="text-xs font-black text-blue-600">Bs. {(order.budget.total * exchangeRate.rate).toLocaleString()}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">Total USD</p>
                                 <p className="text-sm font-black text-slate-900">${order.budget.total}</p>
                               </div>
                            </div>
                          )}
                       </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'reception':
        return <ReceptionForm onSave={handleAddOrder} />;
      case 'inventory':
        return <InventoryList items={inventory} />;
      case 'finance':
        return <FinanceSummary orders={orders} />;
      case 'config':
        return (
          <div className="max-w-md mx-auto space-y-6">
            <header className="text-center">
              <h2 className="text-2xl font-bold text-slate-800">Estado del Sistema</h2>
              <p className="text-slate-500 text-sm">Configuración de almacenamiento</p>
            </header>

            {!isCloud && (
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 space-y-3">
                 <div className="flex items-center gap-2 text-amber-700 font-bold">
                    <CloudOff size={20} />
                    <h3>Modo Local Activo</h3>
                 </div>
                 <p className="text-xs text-amber-600 leading-relaxed">
                   Los datos se están guardando solo en este navegador. Para usar la nube, configura las variables 
                   <code className="bg-white/50 px-1 mx-1 rounded">SUPABASE_URL</code> y 
                   <code className="bg-white/50 px-1 mx-1 rounded">SUPABASE_ANON_KEY</code>.
                 </p>
              </div>
            )}

            <ExchangeRateManager currentRate={exchangeRate} onUpdate={handleUpdateRate} />
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
               <h3 className="font-bold flex items-center gap-2 text-slate-800"><History size={18} /> Políticas Legales</h3>
               <div className="text-[10px] text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed italic">
                  Las cláusulas de retención de 90 días están sincronizadas globalmente.
               </div>
               <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm">Cerrar Sesión</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
