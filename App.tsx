
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
import { sendWhatsAppBudget } from './utils/whatsapp';
import { User, AlertCircle, ShieldCheck, History } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForDiag, setSelectedOrderForDiag] = useState<Order | null>(null);
  const [selectedOrderForFinalCheck, setSelectedOrderForFinalCheck] = useState<Order | null>(null);
  const [selectedFaults, setSelectedFaults] = useState<string[]>([]);
  
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate>({
    rate: 382.63,
    lastUpdate: new Date().toISOString(),
    source: 'Manual'
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Pantalla iPhone 12', stock: 5, minStock: 3, cost: 45, price: 90 },
    { id: '2', name: 'Batería Samsung A10', stock: 2, minStock: 3, cost: 15, price: 35 },
    { id: '3', name: 'Puerto USB-C Genérico', stock: 1, minStock: 5, cost: 2, price: 15 },
  ]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('tecno_coto_orders');
    const savedRate = localStorage.getItem('tecno_coto_rate');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedRate) setExchangeRate(JSON.parse(savedRate));
  }, []);

  const handleAddOrder = (newOrder: Order) => {
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('tecno_coto_orders', JSON.stringify(updated));
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, extra: Partial<Order> = {}) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status, ...extra } : o);
    setOrders(updated);
    localStorage.setItem('tecno_coto_orders', JSON.stringify(updated));
  };

  const handleUpdateRate = (newRate: number) => {
    const updatedRate = { ...exchangeRate, rate: newRate, lastUpdate: new Date().toISOString() };
    setExchangeRate(updatedRate);
    localStorage.setItem('tecno_coto_rate', JSON.stringify(updatedRate));
  };

  const handleDiagSave = (budget: Budget) => {
    if (selectedOrderForDiag) {
      updateOrderStatus(selectedOrderForDiag.id, 'Diagnóstico', { budget });
      setSelectedOrderForDiag(null);
    }
  };

  const handleSendBudget = (budget: Budget) => {
    if (selectedOrderForDiag) {
      const cust: Customer = { id: 'c', name: 'Cliente Demo', phone: '04123868364', idCard: 'V123' };
      const dev: Device = { id: 'd', brand: 'Demo', model: 'Device', type: 'teléfono', serial: 'S123' };
      sendWhatsAppBudget(selectedOrderForDiag, cust, dev, budget);
      updateOrderStatus(selectedOrderForDiag.id, 'Esperando Autorización', { budget });
      setSelectedOrderForDiag(null);
    }
  };

  const handleFinalCheckComplete = (check: FinalCheck) => {
    if (selectedOrderForFinalCheck) {
      updateOrderStatus(selectedOrderForFinalCheck.id, 'Listo para Entrega', { finalCheck: check });
      setSelectedOrderForFinalCheck(null);
    }
  };

  const renderContent = () => {
    if (selectedOrderForDiag) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center">
            <button onClick={() => setSelectedOrderForDiag(null)} className="text-slate-500 flex items-center gap-2 text-sm font-medium hover:text-slate-800">
              ← Cancelar Diagnóstico
            </button>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total en Bolívares</span>
              <p className="text-xs font-bold text-blue-600">Calculado a: {exchangeRate.rate} Bs/$</p>
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
          onComplete={handleFinalCheckComplete}
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
                <p className="text-slate-500 text-sm">Pruebas finales y gestión de pagos integradas</p>
              </div>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-3">
                 <div className="text-right">
                    <p className="text-[8px] font-bold uppercase opacity-80">Tasa del día</p>
                    <p className="text-sm font-black">{exchangeRate.rate} Bs/$</p>
                 </div>
              </div>
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
                             <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-blue-600">#{order.orderNumber}</span>
                             </div>
                             
                             {status === 'Recepción' && (
                               <button onClick={() => { setSelectedOrderForDiag(order); setSelectedFaults(order.budget?.faults || []); }} className="text-[10px] bg-blue-600 text-white px-3 py-1.5 rounded-xl font-bold">DIAGNOSTICAR</button>
                             )}
                             {status === 'En Reparación' && (
                               <button onClick={() => updateOrderStatus(order.id, 'Pruebas Finales')} className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold">TERMINAR</button>
                             )}
                             {status === 'Pruebas Finales' && (
                               <button onClick={() => setSelectedOrderForFinalCheck(order)} className="text-[10px] bg-amber-500 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                                 <ShieldCheck size={12} /> VERIFICAR CON CLIENTE
                               </button>
                             )}
                             {status === 'Esperando Autorización' && (
                               <div className="flex flex-col gap-1">
                                 <button onClick={() => updateOrderStatus(order.id, 'Autorizado')} className="text-[10px] bg-green-600 text-white px-3 py-1.5 rounded-xl font-bold">PAGAR</button>
                                 <button onClick={() => updateOrderStatus(order.id, 'Retenido por Impago')} className="text-[8px] text-red-500 font-bold uppercase hover:underline">Retener</button>
                               </div>
                             )}
                             {status === 'Listo para Entrega' && (
                               <button onClick={() => updateOrderStatus(order.id, 'Entregado')} className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold">ENTREGAR</button>
                             )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm">{order.deviceId}</h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                               <User size={10} />
                               <span>Juan Pérez</span>
                            </div>
                          </div>

                          {order.budget && (
                            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-end">
                               <div>
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">Equivalente</p>
                                 <p className="text-xs font-black text-blue-600">Bs. {(order.budget.total * exchangeRate.rate).toLocaleString()}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-[8px] font-bold text-slate-400 uppercase">Total</p>
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

            {/* Modal de Validación de Pago */}
            {orders.some(o => o.status === 'Autorizado') && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                  <PaymentValidator 
                    total={orders.find(o => o.status === 'Autorizado')?.budget?.total || 0}
                    onConfirm={(record) => {
                       const authOrder = orders.find(o => o.status === 'Autorizado')!;
                       updateOrderStatus(authOrder.id, 'En Reparación', { payment: record });
                    }}
                  />
                  <button onClick={() => updateOrderStatus(orders.find(o => o.status === 'Autorizado')!.id, 'Esperando Autorización')} className="w-full mt-4 text-white text-xs font-bold uppercase opacity-70">Volver</button>
                </div>
              </div>
            )}
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
              <h2 className="text-2xl font-bold text-slate-800">Ajustes Generales</h2>
              <p className="text-slate-500 text-sm">Configuración de moneda y sistema</p>
            </header>
            <ExchangeRateManager currentRate={exchangeRate} onUpdate={handleUpdateRate} />
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
               <h3 className="font-bold flex items-center gap-2 text-slate-800"><History size={18} /> Políticas de Retención</h3>
               <div className="text-[10px] text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100 leading-relaxed italic">
                  "El cliente acepta que tiene 90 días para retirar el equipo. Pasado ese tiempo, Tecno Coto retendrá el equipo como garantía de pago o disposición para cubrir costos."
               </div>
               <button className="w-full bg-slate-100 text-slate-800 py-4 rounded-2xl font-bold text-sm hover:bg-slate-200">Editar Términos Legales</button>
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
