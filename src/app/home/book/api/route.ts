import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO } from "@/lib/utils";
import { TableBooking } from "@/types/TableBooking";

// Let's initialize it as null initially, and we will assign the actual database instance later.
var db: Database | null = null;

// Define the GET request handler function
export async function POST(request: Request, response: Response) {

    var tableBooking: TableBooking = {
        tableNumber: -1,
        time: null,
        name: "",
        numberOfPeoples: -1,
        note: ""
    };

    await request.json().then((data) => {
        tableBooking = data;
    })

    console.log(tableBooking)

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }


    await db.run("UPDATE tavolo SET ora = ?, nome_prenotazione = ?, numero_persone = ?, note = ? WHERE tableNumber = ?", [tableBooking.time, tableBooking.name, tableBooking.numberOfPeoples, tableBooking.note, tableBooking.tableNumber]);

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify("miao"), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}