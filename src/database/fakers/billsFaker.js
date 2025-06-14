import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";


const generateFakeBill = async () => {
    const billStatus = faker.helpers.arrayElement(["Pending", "Paid", "Overdue"]);
    
    // Generate random amount between 10 and 1000
    const amount = faker.number.int({ min: 10, max: 1000 });
    
    // Generate issue date within the last 30 days
    const issuedAt = faker.date.recent({ days: 30 })
    
    // If status is Paid, generate a paid date after the issue date
    let paidAt = null;
    if (billStatus === "Paid") {
        const issueDate = new Date(issuedAt);
        paidAt = faker.date.between({
            from: issueDate,
            to: new Date()
        })
    }

    const userUuid = uuidv4();

    const bill = {
        uuid: uuidv4(),
        billStatus: billStatus,
        userUuid: userUuid,
        amount: amount,
        issuedAt: issuedAt,
        paidAt: paidAt,
        deleted: false
    };
    
    return bill;
};

const generateFakeBills = (numberOfBills) => {
    const bills = [];
    for (let i = 0; i < numberOfBills; i++) {
        bills.push(generateFakeBill());
    }
    return bills;
};

export { generateFakeBill, generateFakeBills };