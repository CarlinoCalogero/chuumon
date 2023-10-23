import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, removeNumbersFromArray } from "@/lib/utils";
import { Table } from "@/types/Table";
import { Sala } from "@/types/Sala";

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
    var sala: Sala = {
        currentMaxTableNumber: 0,
        tableNumbersArray: [],
        tables: await db.all('SELECT * FROM tavolo')
    };

    sala.tables.forEach(table => {
        sala.tableNumbersArray.push(table.tableNumber);
        if (sala.currentMaxTableNumber < table.tableNumber)
            sala.currentMaxTableNumber = table.tableNumber
    });

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(sala), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}

// Define the GET request handler function
export async function POST(request: Request, response: Response) {

    var tablesArray: Table[] = [];

    await request.json().then((data) => {
        tablesArray = data;
    })

    console.log(tablesArray)

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    const tableNumberArray: { tableNumber: number }[] = await db.all('SELECT tableNumber FROM tavolo')
    let tableNumberOnlyNumbersArray: number[] = [];

    for (let count = 0; count < tableNumberArray.length; count++) {
        tableNumberOnlyNumbersArray.push(tableNumberArray[count].tableNumber)
    }

    console.log(tableNumberOnlyNumbersArray)


    for (let count = 0; count < tablesArray.length; count++) {
        let currentTable = tablesArray[count];

        // stmt is an instance of `sqlite#Statement`
        // which is a wrapper around `sqlite3#Statement`
        const stmt = await db.prepare('SELECT tableNumber FROM tavolo WHERE tableNumber = ?')
        await stmt.bind({ 1: currentTable.tableNumber })
        let result: { tableNumber: string } | undefined = await stmt.get()

        console.log(result)

        if (result == undefined) {
            console.log("table does not exist")
            await db.run("INSERT INTO tavolo (tableNumber, numberOfMergedTables, top, left, rotate, ora, nome_prenotazione, numero_persone, note) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", [currentTable.tableNumber, currentTable.numberOfMergedTables, currentTable.top, currentTable.left, currentTable.rotate, currentTable.ora, currentTable.nome_prenotazione, currentTable.numero_persone, currentTable.note]);
        } else {
            console.log("tables exists")
            tableNumberOnlyNumbersArray = removeNumbersFromArray(tableNumberOnlyNumbersArray, [currentTable.tableNumber])
            await db.run("UPDATE tavolo SET numberOfMergedTables = ?, top = ?, left = ?, rotate = ? WHERE tableNumber = ?", [currentTable.numberOfMergedTables, currentTable.top, currentTable.left, currentTable.rotate, result.tableNumber]);
        }
    }

    console.log(tableNumberOnlyNumbersArray)

    for (let count = 0; count < tableNumberOnlyNumbersArray.length; count++) {

        // This turns on support for foreign keys, which is necessary for ON DELETE CASCADE to work properly.
        await db.get("PRAGMA foreign_keys = ON");

        const stmt2 = await db.prepare('DELETE FROM tavolo WHERE tableNumber=?')
        await stmt2.bind({ 1: tableNumberOnlyNumbersArray[count] })
        let result = await stmt2.get()

        console.log(result);

    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify("miao"), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}