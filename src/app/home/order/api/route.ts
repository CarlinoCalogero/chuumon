import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO } from "@/lib/utils";
import { MenuItemWithIngredientsMap } from "@/types/MenuItemWithIngredientsMap";
import { MenuItemInfo } from "@/types/MenuItemInfo";
import { CategoryWithMenuItemsMap } from "@/types/CategoryWithMenuItemsMap";
import { UnitaDiMisuraDatabaseTableRow } from "@/types/UnitaDiMisuraDatabaseTableRow";
import { IngredienteDatabaseTableRow } from "@/types/IngredienteDatabaseTableRow";

type MenuItemsAndOneIngredient = {
    menuItem: string,
    prezzo: number,
    categoria: string,
    ingrediente: string
}

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

    var menuItemsAndIngredients = await db.all('SELECT mi.nome as "menuItem", mi.prezzo as "prezzo", cat.nome as "categoria", i.nome as "ingrediente" FROM compone as c join ingrediente as i on i.rowid=c.id_ingrediente right join menu_item as mi on mi.rowid=c.id_menu_item join categoria as cat on cat.nome=mi.nome_categoria') as MenuItemsAndOneIngredient[]

    var menuItemsWithIngredientsMap: MenuItemWithIngredientsMap = new Map();
    var categoriesWithMenuItemsMap: CategoryWithMenuItemsMap = new Map();


    menuItemsAndIngredients.forEach(menuItemAndOneIngredient => {
        // add in menuItemsWithIngredientsMap
        if (menuItemsWithIngredientsMap.has(menuItemAndOneIngredient.menuItem)) {
            menuItemsWithIngredientsMap.get(menuItemAndOneIngredient.menuItem)?.ingredienti.push(menuItemAndOneIngredient.ingrediente);
        } else {
            var insert: MenuItemInfo = {
                categoria: menuItemAndOneIngredient.categoria,
                prezzo: menuItemAndOneIngredient.prezzo,
                ingredienti: [menuItemAndOneIngredient.ingrediente]
            }
            menuItemsWithIngredientsMap.set(menuItemAndOneIngredient.menuItem, insert)
        }

        // add in categoriesWithMenuItemsMaps
        if (categoriesWithMenuItemsMap.has(menuItemAndOneIngredient.categoria)) {
            if (!categoriesWithMenuItemsMap.get(menuItemAndOneIngredient.categoria)?.includes(menuItemAndOneIngredient.menuItem))
                categoriesWithMenuItemsMap.get(menuItemAndOneIngredient.categoria)?.push(menuItemAndOneIngredient.menuItem)
        } else {
            categoriesWithMenuItemsMap.set(menuItemAndOneIngredient.categoria, [menuItemAndOneIngredient.menuItem])
        }
    });

    // Perform a database query to retrieve all items from the "items" table
    // stmt is an instance of `sqlite#Statement`
    // which is a wrapper around `sqlite3#Statement`
    const resultItem = {
        menuItemsWithIngredientsMap: Object.fromEntries(menuItemsWithIngredientsMap),
        categoriesWithMenuItemsMap: Object.fromEntries(categoriesWithMenuItemsMap),
        ingredienti: await db.all('SELECT * FROM ingrediente') as IngredienteDatabaseTableRow[],
        unitaDiMisura: await db.all('SELECT * FROM unita_di_misura') as UnitaDiMisuraDatabaseTableRow[]
    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(resultItem), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}