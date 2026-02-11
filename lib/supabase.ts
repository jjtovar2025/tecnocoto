
import { createClient } from '@supabase/supabase-js';
import { Order, InventoryItem, ExchangeRate, Customer, Device } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Verificar si la configuración es la por defecto (no configurada)
const isConfigured = supabaseUrl !== 'https://your-project.supabase.co' && supabaseKey !== 'your-anon-key';

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * MOCK / LOCAL STORAGE FALLBACK SERVICE
 * Permite que la app funcione sin errores si Supabase no está listo.
 */
const localDb = {
  get: (key: string) => JSON.parse(localStorage.getItem(`tecno_coto_${key}`) || '[]'),
  set: (key: string, data: any) => localStorage.setItem(`tecno_coto_${key}`, JSON.stringify(data)),
};

export const dataService = {
  isCloud: () => !!supabase,

  async getOrders() {
    if (!supabase) return localDb.get('orders');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, customer:customers(*), device:devices(*)')
        .order('entry_date', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase error, usando local:", e);
      return localDb.get('orders');
    }
  },

  async saveOrder(order: Order, customerData: any, deviceData: any) {
    if (!supabase) {
      const orders = localDb.get('orders');
      const fullOrder = { ...order, customer: customerData, device: deviceData };
      localDb.set('orders', [fullOrder, ...orders]);
      return true;
    }

    try {
      const { data: customer, error: cErr } = await supabase
        .from('customers')
        .upsert({ 
          name: customerData.name, 
          phone: customerData.phone, 
          id_card: customerData.idCard 
        }, { onConflict: 'phone' })
        .select()
        .single();
      if (cErr) throw cErr;

      const { data: device, error: dErr } = await supabase
        .from('devices')
        .upsert({
          customer_id: customer.id,
          brand: deviceData.brand,
          model: deviceData.model,
          serial: deviceData.serial,
          type: deviceData.type
        }, { onConflict: 'serial' })
        .select()
        .single();
      if (dErr) throw dErr;

      const { error: oErr } = await supabase
        .from('orders')
        .insert({
          order_number: order.orderNumber,
          customer_id: customer.id,
          device_id: device.id,
          status: order.status,
          checklist: order.checklist,
          budget: order.budget,
          payment: order.payment,
          final_check: order.finalCheck,
          signature: order.signature,
          photos: order.photos,
          total_price: order.totalPrice
        });
      if (oErr) throw oErr;
      return true;
    } catch (e) {
      console.error("Error en saveOrder cloud:", e);
      throw e;
    }
  },

  async updateOrderStatus(orderId: string, status: string, extraData: any = {}) {
    if (!supabase) {
      const orders = localDb.get('orders');
      const updated = orders.map((o: any) => o.id === orderId ? { ...o, status, ...extraData } : o);
      localDb.set('orders', updated);
      return;
    }
    const { error } = await supabase.from('orders').update({ status, ...extraData }).eq('id', orderId);
    if (error) throw error;
  },

  async getInventory() {
    if (!supabase) return localDb.get('inventory');
    const { data, error } = await supabase.from('inventory').select('*');
    if (error) return localDb.get('inventory');
    return data;
  },

  async getExchangeRate() {
    if (!supabase) return localDb.get('settings_rate') || { rate: 382.63, lastUpdate: new Date().toISOString(), source: 'Manual' };
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'exchange_rate').single();
    if (error) return localDb.get('settings_rate');
    return data.value;
  },

  async updateExchangeRate(rate: ExchangeRate) {
    localDb.set('settings_rate', rate);
    if (!supabase) return;
    await supabase.from('settings').upsert({ key: 'exchange_rate', value: rate });
  }
};
