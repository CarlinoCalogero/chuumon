import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, addOrderedItemToOrderedItemByCategoriesObject, checkIfMenuItemCanBeSlicedUp, checkIfMenuItemIsAPizza } from "@/lib/utils";
import { ContieneDatabaseTableRow } from "@/types/ContieneDatabaseTableRow";
import { MenuItemDatabaseTableRow } from "@/types/MenuItemDatabaseTableRow";
import { OrderedItem } from "@/types/OrderedItem";
import { MenuItemNotInMenuDatabaseTableRow } from "@/types/MenuItemNotInMenuDatabaseTableRow";
import { TableOrderInfo } from "@/types/TableOrderInfo";
import { OrderedItemByCategories } from "@/types/OrderedItemByCategories";
import { Order } from "@/types/Order";
import { ArgumentsUsedForUpdatingConsegnatoInAnOrder } from "@/types/ArgumentsUsedForUpdatingConsegnatoInAnOrder";
import { DatabaseRowId } from "@/types/DatabaseRowId";
import { getUserFromToken } from "@/lib/authentication";

type OrdinazioneDatabaseTableRowWithRowId = {
    rowid: number,
    numero_tavolo: number,
    data_e_ora: Date,
    pick_up_time: Date | null,
    nome_ordinazione: string | null,
    note: string | null,
    is_si_dividono_le_pizze: boolean,
    is_fritti_prima_della_pizza: boolean,
    numero_ordinazione_progressivo_giornaliero: number,
    pizze_divise_in: number | null,
    numero_bambini: number | null,
    numero_adulti: number
}

type OrdinazioneRowIdAndTableNumber = {
    rowid: number,
    numero_tavolo: number
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

    let user = await getUserFromToken(db);
    let ordersArray: Order[] = [];

    if (user != '') {

        const ordersFromDatabase = await db.all('SELECT rowid,* FROM ordinazione') as OrdinazioneDatabaseTableRowWithRowId[];

        // console.log("orders", orders)

        for (const order of ordersFromDatabase) {

            var orderedItemsByCategories: OrderedItemByCategories = {};

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
                            unitOfMeasure: orderedItem.nome_unita_di_misura,
                            consegnato: orderedItem.consegnato
                        }

                        // it is a not created anew or modified menuItem
                        if (orderedItem.id_menu_item != null) {

                            // Perform a database query to retrieve all items from the "items" table
                            // stmt is an instance of `sqlite#Statement`
                            // which is a wrapper around `sqlite3#Statement`
                            const stmt = await db.prepare('SELECT rowid,* FROM menu_item WHERE rowid=?');
                            await stmt.bind({ 1: orderedItem.id_menu_item })
                            const menuItem: MenuItemDatabaseTableRow | undefined = await stmt.get()

                            // console.log("menuItem", menuItem)

                            if (menuItem != undefined) {

                                // get ingredients

                                const stmt1 = await db.prepare('SELECT i.nome FROM compone as c join ingrediente as i on c.id_ingrediente=i.rowid where c.id_menu_item=?');
                                await stmt1.bind({ 1: menuItem.rowid })
                                const ingredientsArray: { nome: string }[] | undefined = await stmt1.all()

                                // console.log("ingredientsArray", ingredientsArray)

                                if (ingredientsArray != undefined) {

                                    ingredientsArray.forEach(ingredient => {
                                        newOrderedItem.ingredients.push(ingredient.nome)
                                    });

                                }

                                // fill in fields
                                newOrderedItem.menuItem = menuItem.nome;
                                newOrderedItem.menuItemCategory = menuItem.nome_categoria;
                                newOrderedItem.price = menuItem.prezzo
                                newOrderedItem.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItem.nome_categoria);
                                newOrderedItem.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItem.nome_categoria);

                                addOrderedItemToOrderedItemByCategoriesObject(orderedItemsByCategories, newOrderedItem);

                            }

                        }

                        // it is a created anew or modified menuItem
                        if (orderedItem.id_menu_item_not_in_menu != null) {

                            // Perform a database query to retrieve all items from the "items" table
                            // stmt is an instance of `sqlite#Statement`
                            // which is a wrapper around `sqlite3#Statement`
                            const stmt = await db.prepare('SELECT rowid,* FROM menu_item_not_in_menu WHERE rowid=?');
                            await stmt.bind({ 1: orderedItem.id_menu_item_not_in_menu })
                            const menuItemNotInMenu: MenuItemNotInMenuDatabaseTableRow | undefined = await stmt.get()

                            // console.log("menuItemNotInMenu", menuItemNotInMenu)

                            if (menuItemNotInMenu != undefined) {

                                // get ingredients

                                const stmt1 = await db.prepare('SELECT i.nome FROM compone_fuori_menu as c join ingrediente as i on c.id_ingrediente=i.rowid where c.id_menu_item_not_in_menu=?');
                                await stmt1.bind({ 1: menuItemNotInMenu.rowid })
                                const ingredientsArray: { nome: string }[] | undefined = await stmt1.all()

                                // console.log("ingredientsArray", ingredientsArray)

                                if (ingredientsArray != undefined) {

                                    ingredientsArray.forEach(ingredient => {
                                        newOrderedItem.ingredients.push(ingredient.nome)
                                    });

                                }

                                // get intolleranze

                                const stmt2 = await db.prepare('SELECT i.nome FROM intolleranza as c join ingrediente as i on c.id_ingrediente=i.rowid where c.id_menu_item_not_in_menu=?');
                                await stmt2.bind({ 1: menuItemNotInMenu.rowid })
                                const intolleranzaArray: { nome: string }[] | undefined = await stmt2.all()

                                // console.log("ingredientsArray", ingredientsArray)

                                if (intolleranzaArray != undefined) {

                                    intolleranzaArray.forEach(ingredient => {
                                        newOrderedItem.intolleranzaA.push(ingredient.nome)
                                    });

                                }

                                // fill in fields
                                newOrderedItem.menuItem = menuItemNotInMenu.nome;
                                newOrderedItem.menuItemCategory = menuItemNotInMenu.nome_categoria;
                                newOrderedItem.price = menuItemNotInMenu.prezzo;
                                newOrderedItem.isMenuItemAPizza = checkIfMenuItemIsAPizza(menuItemNotInMenu.nome_categoria);
                                newOrderedItem.isCanMenuItemBeSlicedUp = checkIfMenuItemCanBeSlicedUp(menuItemNotInMenu.nome_categoria);

                                addOrderedItemToOrderedItemByCategoriesObject(orderedItemsByCategories, newOrderedItem);

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
                    isTakeAway: order.numero_tavolo == null ? true : false,
                    nomeOrdinazione: order.nome_ordinazione,
                    isFrittiPrimaDellaPizza: order.is_fritti_prima_della_pizza,
                    isSiDividonoLaPizza: order.is_si_dividono_le_pizze,
                    slicedIn: order.pizze_divise_in,
                    pickUpTime: order.pick_up_time,
                    note: order.note,
                    numeroBambini: order.numero_bambini,
                    numeroAdulti: order.numero_adulti
                },
                orderedItems: orderedItemsByCategories,
            })

        };

    }

    const resultItem = {
        user: user,
        ordersArray: ordersArray
    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(resultItem), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}

// Define the GET request handler function
export async function POST(request: Request, response: Response) {

    let argumentsUsedForUpdatingConsegnatoInAnOrder: ArgumentsUsedForUpdatingConsegnatoInAnOrder = {
        numeroOrdineProgressivoGiornaliero: -1,
        orderedItem: null,
        consegnato: false,
    }

    await request.json().then((data) => {
        argumentsUsedForUpdatingConsegnatoInAnOrder = data;
    })

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    if (db != null && argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem != null) {

        const stmt = await db.prepare('SELECT rowid, numero_tavolo FROM ordinazione WHERE numero_ordinazione_progressivo_giornaliero=?');
        await stmt.bind({ 1: argumentsUsedForUpdatingConsegnatoInAnOrder.numeroOrdineProgressivoGiornaliero })
        const ordinazioneRowIdAndTableNumber: OrdinazioneRowIdAndTableNumber | undefined = await stmt.get()

        // menu item was created
        if (argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.isWasMenuItemCreated || argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.isWereIngredientsModified) {

            const stmt2 = await db.prepare('SELECT rowid FROM menu_item_not_in_menu WHERE nome=?');
            await stmt2.bind({ 1: argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.menuItem })
            const menuItemNotInMenuID: DatabaseRowId = await stmt2.get()

            const result = await db.run("UPDATE contiene SET consegnato=? WHERE id_ordinazione=? AND id_menu_item_not_in_menu=?", [argumentsUsedForUpdatingConsegnatoInAnOrder.consegnato, ordinazioneRowIdAndTableNumber, menuItemNotInMenuID])

        } else { // menu item was not created

            const stmt3 = await db.prepare('SELECT rowid FROM menu_item WHERE nome=?');
            await stmt3.bind({ 1: argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.menuItem })
            const menuItemID: DatabaseRowId = await stmt3.get()

            const result = await db.run("UPDATE contiene SET consegnato=? WHERE id_ordinazione=? AND id_menu_item=?", [argumentsUsedForUpdatingConsegnatoInAnOrder.consegnato, ordinazioneRowIdAndTableNumber?.rowid, menuItemID?.rowid])

        }

    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify("miao"), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}