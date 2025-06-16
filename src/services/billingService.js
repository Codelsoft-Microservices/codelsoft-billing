
import { prisma } from "../database/prisma.js";
import { status } from "@grpc/grpc-js";
import { v4 as uuidv4 } from "uuid";
import  catchAsync from "../utils/catchAsync.js";

const validStatuses = ["Pending", "Paid", "Overdue"];


/*Metodo de prueba*/
const BillsCheck = catchAsync(async (call, callback) => {
    return callback(null, {
        message: "El servicio de facturación está funcionando",
    });
});

const CreateBill = catchAsync(async (call, callback) => {
    const { userUuid, billStatus, amount } = call.request;
    // Verifica si se ingresaron todos los datos necesarios para crear la factura
    if (!userUuid || !billStatus || !amount) {
        return callback({
            code: status.INVALID_ARGUMENT,
            message: "Faltan datos necesarios para crear la factura",
        });
    }
    // Verifica si el monto es un número entero y mayor a 0
    if ( amount <= 0 || !Number.isInteger(amount)) {
        return callback({
            code: status.INVALID_ARGUMENT,
            message: "El monto debe ser un número entero mayor a 0",
        });
    }
    // Verifica si el estado es uno de los permitidos
    if (!validStatuses.includes(billStatus)) {
        return callback({
            code: status.INVALID_ARGUMENT,
            message: "Estado inválido. Debe ser 'Pending', 'Paid' o 'Overdue'",
        });
    }
    const newBill = await prisma.bill.create({
        data: {
            uuid: uuidv4(),
            userUuid,
            billStatus,
            amount,
        },
    });
    return callback(null, {
        message: "Factura creada exitosamente",
        bill: {
            uuid: newBill.uuid,
            userUuid: newBill.userUuid,
            billStatus: newBill.billStatus,
            amount: newBill.amount,
            issuedAt: newBill.issuedAt,
            paidAt: newBill.paidAt,
        }
    });
});

const GetBillById = catchAsync(async (call, callback) => {
    // Apartado de datos
    const { uuid } = call.request;
    const bill = await prisma.bill.findUnique({
        where: { uuid: uuid },
    });
    if (!bill) {
        return callback({
            code: status.NOT_FOUND,
            message: "Factura no encontrada",
        });
    }
    return callback(null, {
        message: "Factura encontrada",
        bill: {
            uuid: bill.uuid,
            userUuid: bill.userUuid,
            billStatus: bill.billStatus,
            amount: bill.amount,
            issuedAt: bill.issuedAt,
            paidAt: bill.paidAt,
        },
    });
});

const UpdateBillStatus = catchAsync(async (call, callback) => {
    const { uuid, billStatus } = call.request;
    // Verifica si se ingresó el ID de la factura
    if (!uuid || !billStatus) {
        return callback({
            code: status.INVALID_ARGUMENT,
            message: "Faltan datos necesarios para actualizar el estado de la factura",
        });
    }
    // Verifica si el estado es uno de los permitidos
    if (!validStatuses.includes(billStatus)) {
        return callback({
            code: status.INVALID_ARGUMENT,
            message: "Estado inválido. Debe ser 'Pending', 'Paid' o 'Overdue'",
        });
    }

    const updatedBill = await prisma.bill.update({
        where: { uuid: uuid },
        data: {
            billStatus,
            paidAt: billStatus === "Paid" ? new Date() : null,
        },
    });

    return callback(null, {
        message: "Estado de la factura actualizado exitosamente",
        bill: {
            uuid: updatedBill.uuid,
            userUuid: updatedBill.userUuid,
            billStatus: updatedBill.billStatus,
            amount: updatedBill.amount,
            issuedAt: updatedBill.issuedAt,
            paidAt: updatedBill.paidAt,
        },
    });

});

const DeleteBill = catchAsync(async (call, callback) => {
    const { uuid } = call.request;
    const bill = await prisma.bill.findUnique({
        where: { uuid: uuid },
    });

    if (!bill) {
        return callback({
            code: status.NOT_FOUND,
            message: "Factura no encontrada",
        });
    }

    if (bill.billStatus === "Paid") {
        return callback({
            code: status.FAILED_PRECONDITION,
            message: "No se puede eliminar una factura pagada",
        });
    }

    await prisma.bill.update({
        where: { uuid: uuid },
        data: { deleted: true },
    });

    return callback(null, {});
});

const ListBillsByUser = catchAsync(async (call, callback) => {
    const { userUuid, billStatus } = call.request;
    const filter = {
        userUuid,
        deleted: false,
    };


    if (billStatus) {
      if (!validStatuses.includes(billStatus)) {
        return callback({
            code: status.INVALID_ARGUMENT,
            message: "Estado inválido. Debe ser 'Pending', 'Paid' o 'Overdue'",
        });
      }
      filter.billStatus = billStatus;
    }
  
    const bills = await prisma.bill.findMany({ where: filter });
    if (bills.length === 0) {
        return callback({
            code: status.NOT_FOUND,
            message: "No se encontraron facturas para el usuario especificado",
        });
    }
    return callback(null, {
        message: "Facturas encontradas",
        bills: bills.map(b => ({
            uuid: b.uuid,
            userUuid: b.userUuid,
            billStatus: b.billStatus,
            amount: b.amount,
            issuedAt: b.issuedAt,
            paidAt: b.paidAt,
        })),
    });
});

const ListAllBills  = catchAsync(async (call, callback) => {
    const bills = await prisma.bill.findMany({
        where: { deleted: false },
    });

    if (bills.length === 0) {
        return callback({
            code: status.NOT_FOUND,
            message: "No se encontraron facturas",
        });
    }

    return callback(null, {
        message: "Facturas encontradas",
        bills: bills.map(b => ({
            uuid: b.uuid,
            userUuid: b.userUuid,
            billStatus: b.billStatus,
            amount: b.amount,
            issuedAt: b.issuedAt,
            paidAt: b.paidAt,
        })),
    });

});

/*Exporte de todos los metodos correspondientes al controlador para ser usados en nuestro Router.*/
export default { 
    BillsCheck,
    CreateBill,
    GetBillById,
    UpdateBillStatus,
    DeleteBill,
    ListBillsByUser,
    ListAllBills
};