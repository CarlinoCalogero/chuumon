import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, convertStringArrayToNumbersArray, populateSalaObject, removeNumbersFromArray } from "@/lib/utils";
import { Table } from "@/types/Table";
import { Sala } from "@/types/Sala";
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

    const tables: Table[] = await db.all('SELECT tableNumber, numero_sala, numberOfMergedTables, top, left, rotate, ora, nome_prenotazione, numero_persone, note FROM tavolo');

    // Perform a database query to retrieve all items from the "items" table
    // stmt is an instance of `sqlite#Statement`
    // which is a wrapper around `sqlite3#Statement`
    let sala = populateSalaObject(tables);

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(sala), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}

// Define the GET request handler function
export async function POST(request: Request, response: Response) {

    var saleWithTables: SalaWithTables = {};

    await request.json().then((data) => {
        saleWithTables = data;
    })

    console.log(saleWithTables)

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    let saleWithTablesKeysNumberArray = convertStringArrayToNumbersArray(Object.keys(saleWithTables));
    let tablesArray: Table[] = [];

    for (let counter = 0; counter < saleWithTablesKeysNumberArray.length; counter++) {

        let currentSalaNumber = saleWithTablesKeysNumberArray[counter];

        //add tables to array
        tablesArray = [...tablesArray, ...saleWithTables[counter]]

        const checkIfSalaExists = await db.prepare('SELECT * FROM sala WHERE salaNumber = ?')
        await checkIfSalaExists.bind({ 1: currentSalaNumber })
        let resultCheckIfSalaExists: { salaNumber: number } | undefined = await checkIfSalaExists.get()

        if (resultCheckIfSalaExists == undefined) { // sala does not exist

            //insert sala
            await db.run("INSERT INTO sala (salaNumber) VALUES(?)", [currentSalaNumber]);

            console.log("miaone", currentSalaNumber);

        }

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
            await db.run("INSERT INTO tavolo (tableNumber, numero_sala, numberOfMergedTables, top, left, rotate, ora, nome_prenotazione, numero_persone, note) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [currentTable.tableNumber, currentTable.numero_sala, currentTable.numberOfMergedTables, currentTable.top, currentTable.left, currentTable.rotate, currentTable.ora, currentTable.nome_prenotazione, currentTable.numero_persone, currentTable.note]);
        } else {
            console.log("tables exists")
            tableNumberOnlyNumbersArray = removeNumbersFromArray(tableNumberOnlyNumbersArray, [currentTable.tableNumber])
            await db.run("UPDATE tavolo SET numero_sala = ?, numberOfMergedTables = ?, top = ?, left = ?, rotate = ? WHERE tableNumber = ?", [currentTable.numero_sala, currentTable.numberOfMergedTables, currentTable.top, currentTable.left, currentTable.rotate, result.tableNumber]);
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