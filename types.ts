
export type OrderStatus = 
  | 'Recepción' 
  | 'Diagnóstico' 
  | 'Esperando Autorización' 
  | 'Autorizado' 
  | 'Rechazado' 
  | 'En Reparación' 
  | 'Pruebas Finales' 
  | 'Listo para Entrega' 
  | 'Entregado'
  | 'Retenido por Impago';

export type PaymentStatus = 'Pendiente' | 'Abono Parcial' | 'Pagado' | 'Crédito';
export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Zelle' | 'Pago Móvil';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  email?: string;
}

export interface Device {
  id: string;
  type: 'teléfono' | 'computadora' | 'bocina' | 'otro';
  brand: string;
  model: string;
  serial: string;
}

export interface Checklist {
  powersOn: boolean;
  screenCondition: 'Sana' | 'Rota' | 'Líneas';
  chargingPort: 'Funciona' | 'No carga' | 'Suelto';
  battery: string;
  liquidDamage: boolean;
  previousRepair: boolean;
}

export interface FinalCheck {
  faultsResolved: Record<string, boolean>;
  generalChecks: {
    systemBoot: boolean;
    touchScreen: boolean;
    audio: boolean;
    cameras: boolean;
    connectivity: boolean;
    biometrics: boolean;
  };
  customerConformity: boolean;
  finalSignature?: string;
}

export interface Budget {
  faults: string[];
  parts: Array<{ name: string; cost: number }>;
  laborCost: number;
  total: number;
  estimatedTime: string;
  adjustment: number;
}

export interface PaymentRecord {
  status: PaymentStatus;
  method: PaymentMethod;
  amountReceived: number;
  remainingBalance: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  deviceId: string;
  status: OrderStatus;
  entryDate: string;
  deliveryDate?: string;
  checklist: Checklist;
  finalCheck?: FinalCheck;
  budget?: Budget;
  payment?: PaymentRecord;
  signature?: string;
  photos: string[];
  totalPrice: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
}

export interface ExchangeRate {
  rate: number;
  lastUpdate: string;
  source: 'BCV' | 'Manual';
}
