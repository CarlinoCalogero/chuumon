import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, DATABASE_STRING_SEPARATOR, addIngredientToMenuItemWithIngredients, addMenuItemInCategory } from "@/lib/utils";
import { MenuItemInfo } from "@/types/MenuItemInfo";
import { UnitaDiMisuraDatabaseTableRow } from "@/types/UnitaDiMisuraDatabaseTableRow";
import { IngredienteDatabaseTableRow } from "@/types/IngredienteDatabaseTableRow";
import { TableOrder } from "@/types/TableOrder";
import { DatabaseRowId } from "@/types/DatabaseRowId";
import { MenuItemsWithIngredients } from "@/types/MenuItemsWithIngredients";
import { CategoriesWithMenuItems } from "@/types/CategoriesWithMenuItems";
import { MenuItemsAndOneIngredient } from "@/types/MenuItemsAndOneIngredient";
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


    await db.run("INSERT INTO prenotazione (numero_tavolo, ora, nome_prenotazione, numero_persone, note)  VALUES(?, ?, ?, ?, ?)", [tableBooking.tableNumber, tableBooking.time, tableBooking.name, tableBooking.numberOfPeoples, tableBooking.note]);

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify("miao"), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}