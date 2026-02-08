
import { Order, Customer, Device, Budget } from '../types';

export const sendWhatsAppOrder = (order: Order, customer: Customer, device: Device) => {
  const message = `
📱 *NUEVA ORDEN TECNO COTO* 
Orden: #${order.orderNumber}
Fecha: ${new Date(order.entryDate).toLocaleDateString()}
Cliente: ${customer.name}
Equipo: ${device.brand} ${device.model} (SN: ${device.serial})

📋 *ESTADO DE RECEPCIÓN:*
• ${order.checklist.powersOn ? '✅ Enciende' : '❌ No enciende'}
• ${order.checklist.screenCondition === 'Sana' ? '✅' : '❌'} Pantalla ${order.checklist.screenCondition}

---
Responda a este mensaje para consultas.
`.trim();

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
};

export const sendWhatsAppBudget = (order: Order, customer: Customer, device: Device, budget: Budget) => {
  const message = `
🔧 *PRESUPUESTO TECNO COTO* 
Orden: #${order.orderNumber}
Cliente: ${customer.name}
Equipo: ${device.brand} ${device.model}

⚠️ *FALLAS DETECTADAS:*
${budget.faults.map(f => `• ${f}`).join('\n')}

💰 *PRESUPUESTO:*
- Repuestos: $${budget.parts.reduce((acc, p) => acc + p.cost, 0)}
- Mano de Obra: $${budget.laborCost + budget.adjustment}
*Total: $${budget.total}*

⏱️ *TIEMPO ESTIMADO:* ${budget.estimatedTime}

📝 *CONDICIONES:*
Garantía 30 días. No cubre mal uso o líquidos.

¿Autoriza la reparación? Responda:
✅ *SI* - para autorizar
❌ *NO* - para rechazar
`.trim();

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`, '_blank');
};
