import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, checkIfMenuItemCanBeSlicedUp, checkIfMenuItemIsAPizza } from "@/lib/utils";
import { ContieneDatabaseTableRow } from "@/types/ContieneDatabaseTableRow";
import { MenuItemDatabaseTableRow } from "@/types/MenuItemDatabaseTableRow";
import { OrderedItemByCategoryMap } from "@/types/OrderedItemByCategoryMap";
import { OrderedItem } from "@/types/OrderedItem";

type OrdinazioneDatabaseTableRowWithRowId = {
    rowid: number,
    numero_tavolo: number,
    data_e_ora: Date,
    note: string | null,
    is_si_dividono_le_pizze: boolean,
    numero_ordinazione_progressivo_giornaliero: number,
    pizze_divise_in: number | null,
    numero_bambini: number | null,
    numero_adulti: number
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

    const orders = await db.all('SELECT rowid,* FROM ordinazione') as OrdinazioneDatabaseTableRowWithRowId[];

    // console.log("orders", orders)

    orders.forEach(async (order) => {

        if (db != null) {

            // Perform a database query to retrieve all items from the "items" table
            // stmt is an instance of `sqlite#Statement`
            // which is a wrapper around `sqlite3#Statement`
            const stmt = await db.prepare('SELECT * FROM contiene WHERE id_ordinazione=?');
            await stmt.bind({ 1: order.rowid })
            const orderedItems: ContieneDatabaseTableRow[] = await stmt.all()

            // console.log("orderedItems", orderedItems)

            var orderedItemsByCategoriesMap: OrderedItemByCategoryMap = new Map();

            orderedItems.forEach(async (orderedItem) => {

                if (db != null) {

                    if (orderedItem.id_menu_item != null) {

                        // Perform a database query to retrieve all items from the "items" table
                        // stmt is an instance of `sqlite#Statement`
                        // which is a wrapper around `sqlite3#Statement`
                        const stmt = await db.prepare('SELECT * FROM menu_item WHERE rowid=?');
                        await stmt.bind({ 1: orderedItem.id_menu_item })
                        const menuItem: MenuItemDatabaseTableRow | undefined = await stmt.get()

                        // console.log("menuItem", menuItem)

                        if (menuItem != undefined) {

                            var newOrderedItem: OrderedItem = {
                                menuItem: menuItem.nome,
                                menuItemCategory: menuItem.nome_categoria,
                                price: menuItem.prezzo,
                                originalIngredients: [],
                                ingredients: [],
                                removedIngredients: [],
                                addedIngredients: [],
                                intolleranzaA: [],
                                isWasMenuItemCreated: false,
                                isWereIngredientsModified: false,
                                isMenuItemAPizza: checkIfMenuItemIsAPizza(menuItem.nome_categoria),
                                isCanMenuItemBeSlicedUp: checkIfMenuItemCanBeSlicedUp(menuItem.nome_categoria),
                                slicedIn: orderedItem.divisa_in,
                                numberOf: orderedItem.quantita,
                                unitOfMeasure: orderedItem.nome_unita_di_misura
                            }

                            if (orderedItemsByCategoriesMap.has(menuItem.nome_categoria)) {
                                orderedItemsByCategoriesMap.get(menuItem.nome_categoria)?.push(newOrderedItem);
                            } else {
                                orderedItemsByCategoriesMap.set(menuItem.nome_categoria, [newOrderedItem])
                            }

                            console.log("miaone", orderedItemsByCategoriesMap);

                        }

                        // continua da qui facendo menuItemNotInMenu

                    }

                }

            });

        }


    });


    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(orders), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}