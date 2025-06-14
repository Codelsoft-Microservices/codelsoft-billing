
import { prisma } from "../database/prisma.js";
import { status } from "@grpc/grpc-js";
import  catchAsync from "../utils/catchAsync.js";

const validStatuses = ["Pending", "Paid", "Overdue"];


/*Metodo de prueba*/
const billsCheck = catchAsync(async (callback) => {
    return callback(null, {
        message: "El servicio de facturación está funcionando",
    });
});

const CreateBill = catchAsync(async (call, callback) => {
    // Apartado de datos
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
            userUuid,
            billStatus,
            amount,
        },
    });
    return callback(null, {
        message: "Factura creada exitosamente",
        data: newBill,
    });
});

const GetBillById = catchAsync(async (call, callback) => {
    // Apartado de datos
    const { id } = call.request;
    const bill = await prisma.bill.findUnique({
        where: { id: parseInt(id) },
    });
    if (!bill) {
        return callback({
            code: status.NOT_FOUND,
            message: "Factura no encontrada",
        });
    }
    return callback(null, {
        message: "Factura encontrada",
        data: bill,
    });
});

const UpdateBillStatus = catchAsync(async (call, callback) => {
    const { id, billStatus } = call.request;
    // Verifica si se ingresó el ID de la factura
    if (!id || !billStatus) {
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
        where: { id: parseInt(id) },
        data: {
            billStatus,
            paidAt: billStatus === "Paid" ? new Date() : null,
        },
    });

    return callback(null, {
        message: "Estado de la factura actualizado exitosamente",
        data: updatedBill,
    });

});

const DeleteBill = catchAsync(async (call, callback) => {
    const { id } = call.request;
    const bill = await prisma.bill.findUnique({
        where: { id: parseInt(id) },
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
        where: { id: parseInt(id) },
        data: { deleted: true },
    });

    return callback(null, {
        message: "Factura eliminada exitosamente",
    });
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
        data: bills,
    });
});

/*Exporte de todos los metodos correspondientes al controlador para ser usados en nuestro Router.*/
export default { 
    billsCheck,
    CreateBill,
    GetBillById,
    UpdateBillStatus,
    DeleteBill,
    ListBillsByUser,
};