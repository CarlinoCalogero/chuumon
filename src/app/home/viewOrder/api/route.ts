import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, addOrderedItemToOrderedItemByCategoriesObject, checkIfMenuItemCanBeSlicedUp, checkIfMenuItemIsAPizza } from "@/lib/utils";
import { Order } from "@/types/Order";
import { ArgumentsUsedForUpdatingConsegnatoInAnOrder } from "@/types/ArgumentsUsedForUpdatingConsegnatoInAnOrder";
import { DatabaseId } from "@/types/DatabaseId";
import { getUserFromToken } from "@/lib/authentication";
import { OrdinazioneDatabaseTableRow } from "@/types/OrdinazioneDatabaseTableRow";
import { getOrderedItemsByCategoriesFromDatabase } from "@/lib/dbMethods";

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

        const ordersFromDatabase = await db.all('SELECT * FROM ordinazione') as OrdinazioneDatabaseTableRow[];

        // console.log("orders", orders)

        for (const order of ordersFromDatabase) {

            let orderedItemsByCategories = await getOrderedItemsByCategoriesFromDatabase(db, order);

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

        const stmt = await db.prepare('SELECT * FROM ordinazione WHERE numero_ordinazione_progressivo_giornaliero=?');
        await stmt.bind({ 1: argumentsUsedForUpdatingConsegnatoInAnOrder.numeroOrdineProgressivoGiornaliero })
        const ordinazioneRowIdAndTableNumber: OrdinazioneDatabaseTableRow | undefined = await stmt.get()

        // menu item was created
        if (argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.isWasMenuItemCreated || argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.isWereIngredientsModified) {

            const stmt2 = await db.prepare('SELECT id FROM menu_item_not_in_menu WHERE nome=?');
            await stmt2.bind({ 1: argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.menuItem })
            const menuItemNotInMenuID: DatabaseId = await stmt2.get()

            if (menuItemNotInMenuID != undefined && ordinazioneRowIdAndTableNumber != undefined) {
                const result = await db.run("UPDATE contiene SET consegnato=? WHERE id_ordinazione=? AND id_menu_item_not_in_menu=?", [argumentsUsedForUpdatingConsegnatoInAnOrder.consegnato, ordinazioneRowIdAndTableNumber.id, menuItemNotInMenuID.id])
            }


        } else { // menu item was not created

            const stmt3 = await db.prepare('SELECT id FROM menu_item WHERE nome=?');
            await stmt3.bind({ 1: argumentsUsedForUpdatingConsegnatoInAnOrder.orderedItem.menuItem })
            const menuItemID: DatabaseId = await stmt3.get()

            if (menuItemID != undefined && ordinazioneRowIdAndTableNumber != undefined) {
                const result = await db.run("UPDATE contiene SET consegnato=? WHERE id_ordinazione=? AND id_menu_item=?", [argumentsUsedForUpdatingConsegnatoInAnOrder.consegnato, ordinazioneRowIdAndTableNumber.id, menuItemID.id])
            }

        }

    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify("miao"), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}