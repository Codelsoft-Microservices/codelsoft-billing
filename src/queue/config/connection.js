import { connect } from "amqplib";

let channel;

const QUEUES = ["billing-mail-queue"];
const EXCHANGE_NAME = "billing-exchange"; // Usa solo si usas exchange

async function connectToRabbitMQ() {
  try {
    const connection = await connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "fanout", { durable: true });

    await Promise.all(
      QUEUES.map(async (queue) => {
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, EXCHANGE_NAME, ""); // si usas exchange
      })
    );

    return channel;
  } catch (err) {
    console.error("Error connecting to RabbitMQ:", err.message);
    process.exit(1);
  }
}

async function getChannel() {
  if (!channel) {
    channel = await connectToRabbitMQ();
  }
  return channel;
}

export {
  connectToRabbitMQ,
  getChannel
};
