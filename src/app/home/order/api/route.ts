import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO } from "@/lib/utils";
import { MenuItemDatabaseTableRow } from "@/types/MenuItemDatabaseTableRow";
import { CategoriesDatabaseTableRow } from "@/types/CategoriesDatabaseTableRow";

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
    const resultItem = {
        menuItems: await db.all('SELECT * FROM menu_item') as MenuItemDatabaseTableRow[],
        categories: await db.all('SELECT * FROM categoria') as CategoriesDatabaseTableRow[],
        unitaDiMisura: await db.all('SELECT * FROM unita_di_misura') as string[]
    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(resultItem), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}