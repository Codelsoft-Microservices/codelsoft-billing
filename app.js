import { config } from 'dotenv';
import { ServerCredentials, Server } from '@grpc/grpc-js';
import { loadProto } from './src/utils/loadProto.js';
import billingService from './src/services/billingService.js';
import {connectToRabbitMQ} from './src/queue/config/connection.js';

config({path: './.env'});

const server = new Server();

process.env.DATABASE_URL.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
    ).replace("<USER>", process.env.DATABASE_USER);

// connectToRabbitMQ()
//     .then(() => console.log('Conexión a RabbitMQ exitosa'))
//     .catch(error => console.error('Error al conectar a RabbitMQ:', error));

const billingProto = loadProto('billing')
server.addService(billingProto.BillingService.service, billingService);

server.bindAsync(
    `${process.env.SERVER_URL}:${process.env.PORT}`,
    ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(`Error al iniciar el servidor: ${error.message}`);
            return;
        } else {
            console.log(`- Entorno:     ${process.env.NODE_ENV}`);
            console.log(`- Puerto:      ${port}`);
            console.log(`- URL:         ${process.env.SERVER_URL}:${port}`);
        }
    }
);