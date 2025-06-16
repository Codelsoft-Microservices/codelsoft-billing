import { getChannel } from '../../config/queue.js';

export const sendBillNotification = async (bill) => {
    try {
        const channel = await getChannel();
        const queue = 'billing-mail-queue'; // Introducir el nombre de la cola

        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(bill)), {
            persistent: true,
        });

        console.log(`Factura enviada a la cola: ${bill.id}`);
    } catch (error) {
        console.error('Error al enviar la factura a la cola:', error);
    }
}