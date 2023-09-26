import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, addMenuItemToStringKeyAndOrderedItemArrayValueMap, checkIfMenuItemCanBeSlicedUp, checkIfMenuItemIsAPizza } from "@/lib/utils";
import { ContieneDatabaseTableRow } from "@/types/ContieneDatabaseTableRow";
import { MenuItemDatabaseTableRow } from "@/types/MenuItemDatabaseTableRow";
import { OrderedItemByCategoryMap } from "@/types/OrderedItemByCategoryMap";
import { OrderedItem } from "@/types/OrderedItem";
import { MenuItemNotInMenuDatabaseTableRow } from "@/types/MenuItemNotInMenuDatabaseTableRow";
import { TableOrderInfo } from "@/types/TableOrderInfo";

type OrdinazioneDatabaseTableRowWithRowId = {
    rowid: number,
    numero_tavolo: number,
    data_e_ora: Date,
    note: string | null,
    is_si_dividono_le_pizze: boolean,
    is_fritti_prima_della_pizza: boolean,
    numero_ordinazione_progressivo_giornaliero: number,
    pizze_divise_in: number | null,
    numero_bambini: number | null,
    numero_adulti: number
}

type APIOrder = {
    numeroOrdineProgressivoGiornaliero: number,
    dateAndTime: Date,
    orderInfo: TableOrderInfo,
    orderedItems: { [k: string]: OrderedItem[]; },
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

    const ordersFromDatabase = await db.all('SELECT rowid,* FROM ordinazione') as OrdinazioneDatabaseTableRowWithRowId[];

    // console.log("orders", orders)

    var ordersArray: APIOrder[] = [];

    for (const order of ordersFromDatabase) {

        var orderedItemsByCategoriesMap: OrderedItemByCategoryMap = new Map();

        if (db != null) {

            // Perform a database query to retrieve all items from the "items" table
            // stmt is an instance of `sqlite#Statement`
            // which is a wrapper around `sqlite3#Statement`
            const stmt = await db.prepare('SELECT * FROM contiene WHERE id_ordinazione=?');
            await stmt.bind({ 1: order.rowid })
            const orderedItems: ContieneDatabaseTableRow[] = await stmt.all()

            // console.log("orderedItems", orderedItems)

            for (const orderedItem of orderedItems) {

                if (db != null) {

                    var newOrderedItem: OrderedItem = {
                        menuItem: null,
                        menuItemCategory: null,
                        price: null,
                        originalIngredients: [],
                        ingredients: [],
                        removedIngredients: [],
                        addedIngredients: [],
                        intolleranzaA: [],
                        isWasMenuItemCreated: false,
                        isWereIngredientsModified: false,
                        isMenuItemAPizza: false,
                        isCanMenuItemBeSlicedUp: false,
                        slicedIn: orderedItem.divisa_in,
                        numberOf: orderedItem.quantita,
                        unitOfMeasure: orderedItem.nome_unita_di_misura
                    }

                    // it is a not created anew or modified menuItem
                    if (orderedItem.id_menu_item != null) {

                        // Perform a database query to retrieve all items from the "items" table
                        // stmt is an instance of `sqlite#Statement`
                        // which is a wrapper around `sqlite3#Statement`
                        const stmt = await db.prepare('SELECT * FROM menu_item WHERE rowid=?');
                        await stmt.bind({ 1: orderedItem.id_menu_item })
                        const menuItem: MenuItemDatabaseTableRow | undefined = await stmt.get()

                        // console.log("menuItem", menuItem)

                        if (menuItem != undefined) {

                            // fill in fields
                            newOrderedItem.menuItem = menuItem.nome;
                            newOrderedItem.menuItemCategory = menuItem.nome_categoria;
                            newOrderedItem.price = menuItem.prezzo
                            newOrderedItem.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItem.nome_categoria);
                            newOrderedItem.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItem.nome_categoria);

                            addMenuItemToStringKeyAndOrderedItemArrayValueMap(orderedItemsByCategoriesMap, menuItem.nome_categoria, newOrderedItem);

                        }

                    }

                    // it is a created anew or modified menuItem
                    if (orderedItem.id_menu_item_not_in_menu != null) {

                        // Perform a database query to retrieve all items from the "items" table
                        // stmt is an instance of `sqlite#Statement`
                        // which is a wrapper around `sqlite3#Statement`
                        const stmt = await db.prepare('SELECT * FROM menu_item_not_in_menu WHERE rowid=?');
                        await stmt.bind({ 1: orderedItem.id_menu_item_not_in_menu })
                        const menuItemNotInMenu: MenuItemNotInMenuDatabaseTableRow | undefined = await stmt.get()

                        // console.log("menuItem", menuItem)

                        if (menuItemNotInMenu != undefined) {

                            // fill in fields
                            newOrderedItem.menuItem = menuItemNotInMenu.nome;
                            newOrderedItem.menuItemCategory = menuItemNotInMenu.nome_categoria;
                            newOrderedItem.price = menuItemNotInMenu.prezzo;
                            newOrderedItem.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItemNotInMenu.nome_categoria);
                            newOrderedItem.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItemNotInMenu.nome_categoria);

                            addMenuItemToStringKeyAndOrderedItemArrayValueMap(orderedItemsByCategoriesMap, menuItemNotInMenu.nome_categoria, newOrderedItem);

                        }

                    }

                }

            };

        }

        //add the order to the Array
        ordersArray.push({
            numeroOrdineProgressivoGiornaliero: order.numero_ordinazione_progressivo_giornaliero,
            dateAndTime: order.data_e_ora,
            orderInfo: {
                tableNumber: order.numero_tavolo,
                isFrittiPrimaDellaPizza: order.is_fritti_prima_della_pizza,
                isSiDividonoLaPizza: order.is_si_dividono_le_pizze,
                slicedIn: order.pizze_divise_in,
                note: order.note,
                numeroBambini: order.numero_bambini,
                numeroAdulti: order.numero_adulti
            },
            orderedItems: Object.fromEntries(orderedItemsByCategoriesMap),
        })

    };


    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(ordersArray), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}