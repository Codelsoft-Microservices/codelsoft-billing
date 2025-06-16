import { generateFakeBill } from "../fakers/billsFaker.js";
import { PrismaClient } from '../../../prisma/bills-client/index.js';

const prisma = new PrismaClient();

const seedBills = async (numBills) => {
    const bills = [];
    const successfulBills = [];

    for (let i = 0; i < numBills; i++) {
        const bill = await generateFakeBill();
        
        if (!bill) {
            console.log("Omitiendo creación de factura debido a usuario faltante");
            continue;
        }
        
        bills.push(bill);
    }

    console.log(`Generadas ${bills.length} facturas falsas. Ahora insertando en la base de datos...`);

    for (const bill of bills) {
        const createdBill = await createFakeBill(bill);
        if (createdBill) {
            successfulBills.push(bill);
        } else {
            console.log("Error al crear una factura, continuando con otras");
        }
    }
    
    console.log(`Creadas exitosamente ${successfulBills.length} de ${bills.length} facturas`);
    return successfulBills.length > 0 ? successfulBills : false;
};

const createFakeBill = async (bill) => {
    const { billStatus, userUuid, amount, issuedAt, paidAt, deleted } = bill;

    try {      
        const billCreated = await prisma.bill.create({
            data: {
                uuid: bill.uuid,
                billStatus: billStatus,
                userUuid: userUuid,
                amount: amount,
                issuedAt: new Date(issuedAt),
                paidAt: paidAt ? new Date(paidAt) : null,
                deleted: deleted
            },
        });

        return billCreated;
    } catch (error) {
        console.error("Error al crear factura:", error);
        return false;
    }
};

export { seedBills };