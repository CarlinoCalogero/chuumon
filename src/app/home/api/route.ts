import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, populateSalaObject } from "@/lib/utils";
import { Table } from "@/types/Table";
import { OrderedTablesWithMenuItemsAndDeliveredMenuItems } from "@/types/OrderedTablesWithMenuItemsAndDeliveredMenuItems";
import { SalaWithTables } from "@/types/SalaWithTables";

// Let's initialize it as null initially, and we will assign the actual database instance later.
var db: Database | null = null;

// Define the GET request handler function
export async function GET() {

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    const tables: Table[] = await db.all('SELECT tableNumber, numberOfMergedTables, top, left, rotate, ora, nome_prenotazione, numero_persone, note FROM tavolo');

    // Perform a database query to retrieve all items from the "items" table
    // stmt is an instance of `sqlite#Statement`
    // which is a wrapper around `sqlite3#Statement`
    let resultItem = {
        sala: populateSalaObject(tables),
        orderedTablesWithMenuItemsAndDeliveredMenuItems: {} as OrderedTablesWithMenuItemsAndDeliveredMenuItems
    }


    const tablesAndTotalNumberOfMenuItems: { tableNumber: number, totalNumberOfMenuItems: number }[] = await db.all('SELECT numero_tavolo as "tableNumber", count(o.numero_tavolo) as "totalNumberOfMenuItems" FROM ordinazione as o JOIN contiene as c on c.id_ordinazione=o.id WHERE numero_tavolo IS NOT NULL GROUP BY o.id;');
    const tablesAndTotalNumberOfDeliveredMenuItems: { tableNumber: number, totalNumberOfDeliveredMenuItems: number }[] = await db.all('SELECT numero_tavolo as "tableNumber", count(o.numero_tavolo) as "totalNumberOfDeliveredMenuItems" FROM ordinazione as o JOIN contiene as c on c.id_ordinazione=o.id WHERE numero_tavolo IS NOT NULL AND c.consegnato IS TRUE GROUP BY o.id;');

    for (let count = 0; count < tablesAndTotalNumberOfMenuItems.length; count++) {
        let singleTableAndTotalNumberOfMenuItems = tablesAndTotalNumberOfMenuItems[count];
        let tableNumber = singleTableAndTotalNumberOfMenuItems.tableNumber;
        if (tableNumber in resultItem.orderedTablesWithMenuItemsAndDeliveredMenuItems) {
            console.log("miao") //Error
        } else {
            resultItem.orderedTablesWithMenuItemsAndDeliveredMenuItems[tableNumber] = {
                tablesAndTotalNumberOfMenuItems: singleTableAndTotalNumberOfMenuItems.totalNumberOfMenuItems,
                tablesAndTotalNumberOfDeliveredMenuItems: 0,
            }
        }
    }

    for (let count = 0; count < tablesAndTotalNumberOfDeliveredMenuItems.length; count++) {
        let singleTableAndTotalNumberOfDeliveredMenuItems = tablesAndTotalNumberOfDeliveredMenuItems[count];
        let tableNumber = singleTableAndTotalNumberOfDeliveredMenuItems.tableNumber;
        if (tableNumber in resultItem.orderedTablesWithMenuItemsAndDeliveredMenuItems) {
            resultItem.orderedTablesWithMenuItemsAndDeliveredMenuItems[tableNumber].tablesAndTotalNumberOfDeliveredMenuItems = singleTableAndTotalNumberOfDeliveredMenuItems.totalNumberOfDeliveredMenuItems;
        } else {
            console.log("miao") //Error
        }
    }

    console.log("resultItem", resultItem)

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(resultItem), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}

// Define the GET request handler function
export async function POST(request: Request, response: Response) {

    var tableNumber: number = -1;

    await request.json().then((data) => {
        tableNumber = data;
    })

    console.log(tableNumber)

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }


    await db.run("UPDATE tavolo SET ora = ?, nome_prenotazione = ?, numero_persone = ?, note = ? WHERE tableNumber = ?", [null, null, null, null, tableNumber]);

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify("miao"), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}