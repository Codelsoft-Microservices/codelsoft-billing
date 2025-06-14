import { config } from 'dotenv';
import { ServerCredentials, Server } from '@grpc/grpc-js';
import { loadProto } from './src/utils/loadProto.js';
import billingService from './src/services/billingService.js';

config({path: './.env'});

const server = new Server();

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