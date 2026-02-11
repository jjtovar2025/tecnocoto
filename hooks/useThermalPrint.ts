
import { Order, Customer, Device } from '../types';

export const useThermalPrint = () => {
  
  const generateTicketCommands = (order: Order, customer: Customer, device: Device) => {
    return [
      '\x1B\x40', // Initialize
      '\x1B\x61\x01', // Center
      '\x1B\x21\x30', // Double height and width for title
      'TECNO COTO\n',
      '\x1B\x21\x00', // Reset size
      'REPARACIONES ELECTRONICAS\n',
      'C.I: V-12345678\n',
      'Tel: 0412-386-8364\n',
      '--------------------------------\n',
      '\x1B\x61\x00', // Left
      `ORDEN: #${order.orderNumber}\n`,
      `FECHA: ${new Date(order.entryDate).toLocaleDateString()}\n`,
      '--------------------------------\n',
      `CLIENTE: ${customer.name}\n`,
      `TEL: ${customer.phone}\n`,
      '--------------------------------\n',
      `EQUIPO: ${device.brand} ${device.model}\n`,
      `SERIAL: ${device.serial}\n`,
      'ESTADO DE RECEPCION:\n',
      `- Pantalla ${order.checklist.screenCondition}\n`,
      `- Carga: ${order.checklist.chargingPort}\n`,
      `- Enciende: ${order.checklist.powersOn ? 'SI' : 'NO'}\n`,
      '--------------------------------\n',
      '\x1B\x61\x01', // Center
      '\x1B\x21\x01', // Small font
      'RECLAMOS SOLO CON ESTE TICKET\n',
      '90 DIAS PARA RETIRAR EQUIPO\n',
      '\x1B\x21\x00', // Reset size
      '\n\n',
      'FIRMA CLIENTE: ________________\n',
      '\n\n\n\n'
    ];
  };

  const printOrderBT = async (order: Order, customer: Customer, device: Device) => {
    try {
      if (!('bluetooth' in navigator)) {
        throw new Error('Bluetooth no soportado en este navegador.');
      }

      const deviceBT = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }], 
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await deviceBT.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      const encoder = new TextEncoder();
      const commands = generateTicketCommands(order, customer, device);

      for (const cmd of commands) {
        await characteristic.writeValue(encoder.encode(cmd));
      }

      await server.disconnect();
    } catch (error: any) {
      console.error('BT Print failed:', error);
      alert(`Error Bluetooth: ${error.message}`);
    }
  };

  const printOrderUSB = async (order: Order, customer: Customer, device: Device) => {
    try {
      if (!('usb' in navigator)) {
        throw new Error('WebUSB no soportado en este navegador.');
      }

      const usbDevice = await (navigator as any).usb.requestDevice({ filters: [] });
      await usbDevice.open();
      
      // Select configuration and claim interface
      // Most thermal printers use configuration 1, interface 0
      if (usbDevice.configuration === null) {
        await usbDevice.selectConfiguration(1);
      }
      
      const interfaceNum = 0;
      await usbDevice.claimInterface(interfaceNum);

      // Find the bulk OUT endpoint
      const outEndpoint = usbDevice.configuration.interfaces[interfaceNum].alternate.endpoints.find(
        (e: any) => e.direction === 'out' && e.type === 'bulk'
      );

      if (!outEndpoint) {
        throw new Error('No se encontró el canal de salida (OUT endpoint) en la impresora.');
      }

      const encoder = new TextEncoder();
      const commands = generateTicketCommands(order, customer, device);
      
      for (const cmd of commands) {
        await usbDevice.transferOut(outEndpoint.endpointNumber, encoder.encode(cmd));
      }

      await usbDevice.close();
    } catch (error: any) {
      console.error('USB Print failed:', error);
      alert(`Error USB: ${error.message}. Asegúrese de usar Chrome o Edge y que la impresora esté conectada.`);
    }
  };

  return { printOrderBT, printOrderUSB };
};
