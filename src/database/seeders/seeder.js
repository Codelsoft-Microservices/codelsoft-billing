import { seedBills } from "../seeders/billsSeeder.js";

const mainSeedingFunction = async () => {
    console.log("Iniciando proceso de siembra de datos...");

    const numBills = 350;
    const billsSeeded = await seedBills(numBills);

    if (billsSeeded) {
        console.log(`Se sembraron exitosamente ${billsSeeded.length} facturas.`);
    } else {
        console.log("No se sembraron facturas.");
    }

    console.log("Proceso de siembra de datos finalizado.");
}

mainSeedingFunction()
    .then(() => {
        console.log("Proceso de seeding completado.");
        process.exit(0); // Finaliza el proceso
    })
    .catch((error) => {
        console.error("Error en el proceso de seeding:", error);
        process.exit(1); // Finaliza el proceso con error
    });