
import { Order, Customer, Device } from '../types';

export const useThermalPrint = () => {
  const printOrder = async (order: Order, customer: Customer, device: Device) => {
    try {
      // Note: This requires a browser that supports Web Bluetooth and a compatible printer
      const deviceBT = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], // Generic serial service
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await deviceBT.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      const encoder = new TextEncoder();
      
      const commands = [
        '\x1B\x40', // Initialize
        '\x1B\x61\x01', // Center
        'TECNO COTO REPARACIONES\n',
        'C.I: V-12345678\n',
        'Tel: 0412-386-8364\n',
        '----------------\n',
        '\x1B\x61\x00', // Left
        `ORDEN: #${order.orderNumber}\n`,
        `FECHA: ${new Date(order.entryDate).toLocaleDateString()}\n`,
        `CLIENTE: ${customer.name}\n`,
        `TEL: ${customer.phone}\n`,
        '----------------\n',
        `EQUIPO: ${device.brand} ${device.model}\n`,
        `SERIAL: ${device.serial}\n`,
        'ESTADO:\n',
        `- Pantalla ${order.checklist.screenCondition}\n`,
        `- Puerto ${order.checklist.chargingPort}\n`,
        '----------------\n',
        '\n\n',
        'FIRMA CLIENTE: _______\n',
        '----------------\n',
        'Terminos aceptados\n',
        '\n\n\n'
      ];

      for (const cmd of commands) {
        await characteristic.writeValue(encoder.encode(cmd));
      }

      await server.disconnect();
    } catch (error) {
      console.error('Printing failed:', error);
      alert('Error de impresión: Asegúrese de tener el Bluetooth encendido y la impresora vinculada.');
      // Fallback: window.print() style if wanted
    }
  };

  return { printOrder };
};
