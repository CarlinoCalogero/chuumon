import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO } from "@/lib/utils";
import { Table } from "@/types/Table";

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

    // Perform a database query to retrieve all items from the "items" table
    // stmt is an instance of `sqlite#Statement`
    // which is a wrapper around `sqlite3#Statement`
    const tables: Table[] = await db.all('SELECT tableNumber, numberOfMergedTables, top, left, rotate, ora, nome_prenotazione, numero_persone, note FROM tavolo');

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(tables), {
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