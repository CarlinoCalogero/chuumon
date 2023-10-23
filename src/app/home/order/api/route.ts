import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, DATABASE_STRING_SEPARATOR, addIngredientToMenuItemWithIngredients, addMenuItemInCategory } from "@/lib/utils";
import { MenuItemInfo } from "@/types/MenuItemInfo";
import { UnitaDiMisuraDatabaseTableRow } from "@/types/UnitaDiMisuraDatabaseTableRow";
import { IngredienteDatabaseTableRow } from "@/types/IngredienteDatabaseTableRow";
import { TableOrder } from "@/types/TableOrder";
import { DatabaseId } from "@/types/DatabaseId";
import { MenuItemsWithIngredients } from "@/types/MenuItemsWithIngredients";
import { CategoriesWithMenuItems } from "@/types/CategoriesWithMenuItems";
import { MenuItemsAndOneIngredient } from "@/types/MenuItemsAndOneIngredient";
import { OrderPagePostMethodType } from "@/types/OrderPagePostMethodType";
import { OrdinazioneDatabaseTableRow } from "@/types/OrdinazioneDatabaseTableRow";
import { OrderedItemByCategories } from "@/types/OrderedItemByCategories";
import { getOrderedItemsByCategoriesFromDatabase } from "@/lib/dbMethods";
import { TableOrderInfo } from "@/types/TableOrderInfo";

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

    var menuItemsAndIngredients = await db.all('SELECT mi.nome as "menuItem", mi.prezzo as "prezzo", cat.nome as "categoria", i.nome as "ingrediente" FROM compone as c join ingrediente as i on i.id=c.id_ingrediente right join menu_item as mi on mi.id=c.id_menu_item join categoria as cat on cat.nome=mi.nome_categoria') as MenuItemsAndOneIngredient[]

    var menuItemsWithIngredients: MenuItemsWithIngredients = {};
    var categoriesWithMenuItems: CategoriesWithMenuItems = {};


    menuItemsAndIngredients.forEach(menuItemAndOneIngredient => {
        // add in menuItemsWithIngredients
        addIngredientToMenuItemWithIngredients(menuItemsWithIngredients, menuItemAndOneIngredient);

        // add in categoriesWithMenuItems
        addMenuItemInCategory(categoriesWithMenuItems, menuItemAndOneIngredient)
    });

    // Perform a database query to retrieve all items from the "items" table
    // stmt is an instance of `sqlite#Statement`
    // which is a wrapper around `sqlite3#Statement`
    const resultItem = {
        menuItemsWithIngredients: menuItemsWithIngredients,
        categoriesWithMenuItems: categoriesWithMenuItems,
        ingredienti: await db.all('SELECT * FROM ingrediente') as IngredienteDatabaseTableRow[],
        unitaDiMisura: await db.all('SELECT * FROM unita_di_misura') as UnitaDiMisuraDatabaseTableRow[]
    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(resultItem), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}

// Define the GET request handler function
export async function POST(request: Request, response: Response) {

    var orderPagePostMethodType: OrderPagePostMethodType = {
        whichPostBody: false, //true if we are placing an order, false if we are retrieving an order
        tableOrder: null,
        table: null
    };

    await request.json().then((data) => {
        orderPagePostMethodType = data;
    })

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    let postResult = {
        orderedItemsByCategories: null as OrderedItemByCategories | null,
        tableOrderInfo: null as TableOrderInfo | null
    }

    if (orderPagePostMethodType.whichPostBody && orderPagePostMethodType.tableOrder != null && orderPagePostMethodType.table == null) { //placing an order

        // stmt is an instance of `sqlite#Statement`
        // which is a wrapper around `sqlite3#Statement`
        const checkOrdinazione = await db.prepare('SELECT id, numero_ordinazione_progressivo_giornaliero FROM ordinazione WHERE numero_tavolo = ?')
        await checkOrdinazione.bind({ 1: orderPagePostMethodType.tableOrder.tableOrderInfo.tableNumber })
        let checkOrdinazioneResult: { id: string, numero_ordinazione_progressivo_giornaliero: string } | undefined = await checkOrdinazione.get()

        var nuovoNumeroProgressivoGiornaliero = 1;

        if (checkOrdinazioneResult == undefined) { // order must be created

            var maxNumeroProgressivoGiornaliero: undefined | { max: null | number } = await db.get('SELECT MAX(numero_ordinazione_progressivo_giornaliero) as max FROM ordinazione')

            if (maxNumeroProgressivoGiornaliero != undefined && maxNumeroProgressivoGiornaliero.max != null) {
                nuovoNumeroProgressivoGiornaliero = maxNumeroProgressivoGiornaliero.max + 1;
            }

        } else { // order is already created

            // This turns on support for foreign keys, which is necessary for ON DELETE CASCADE to work properly.
            await db.get("PRAGMA foreign_keys = ON");

            console.log("abbronzatissimo")

            const deleteOrder = await db.prepare('DELETE FROM ordinazione WHERE id=?')
            await deleteOrder.bind({ 1: checkOrdinazioneResult.id })
            let deleteOrderResult = await deleteOrder.get()

            nuovoNumeroProgressivoGiornaliero = Number(checkOrdinazioneResult.numero_ordinazione_progressivo_giornaliero);

        }

        console.log("piccolissimo")

        db.getDatabaseInstance().run("INSERT INTO ordinazione(numero_tavolo, data_e_ora, pick_up_time, nome_ordinazione, note, is_si_dividono_le_pizze, is_fritti_prima_della_pizza, numero_ordinazione_progressivo_giornaliero, pizze_divise_in, numero_bambini, numero_adulti)  VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [orderPagePostMethodType.tableOrder.tableOrderInfo.tableNumber, orderPagePostMethodType.tableOrder.dateAndTime, orderPagePostMethodType.tableOrder.tableOrderInfo.pickUpTime, orderPagePostMethodType.tableOrder.tableOrderInfo.nomeOrdinazione, orderPagePostMethodType.tableOrder.tableOrderInfo.note, orderPagePostMethodType.tableOrder.tableOrderInfo.isSiDividonoLaPizza, orderPagePostMethodType.tableOrder.tableOrderInfo.isFrittiPrimaDellaPizza, nuovoNumeroProgressivoGiornaliero, orderPagePostMethodType.tableOrder.tableOrderInfo.slicedIn, orderPagePostMethodType.tableOrder.tableOrderInfo.numeroBambini, orderPagePostMethodType.tableOrder.tableOrderInfo.numeroAdulti], async function (err) {

            if (err) {
                return console.error(err.message);
            }

            const ordinazioneLastId = this.lastID; // get the id of the last inserted row

            if (db != null && orderPagePostMethodType.tableOrder != null) {

                // add rowid to table for foreign key logic
                await db.run("UPDATE ordinazione SET id = ? WHERE rowid = ?", [ordinazioneLastId, ordinazioneLastId]);

                // link menuItems to order
                orderPagePostMethodType.tableOrder.orderedItemsByCategoriesArray.forEach(categoryWithOrderedItems => {

                    categoryWithOrderedItems.orderedItems.forEach(async (orderedItem) => {

                        const insertSql = "INSERT INTO contiene(id_ordinazione, id_menu_item, id_menu_item_not_in_menu, divisa_in, quantita, nome_unita_di_misura, consegnato) VALUES(?,?,?,?,?,?,?)";
                        const insertSql2 = "UPDATE contiene SET id = ? WHERE rowid = ?";

                        if (db != null) {

                            // menuItems were created anew or modified
                            if ((orderedItem.isWasMenuItemCreated || orderedItem.isWereIngredientsModified) && orderPagePostMethodType.tableOrder != null) {

                                console.log(orderedItem.menuItem)

                                db.getDatabaseInstance().run("INSERT INTO menu_item_not_in_menu(id_ordinazione,nome,prezzo,nome_categoria) VALUES(?,?,?,?)", [ordinazioneLastId, `${orderedItem.menuItem}${DATABASE_STRING_SEPARATOR}${orderPagePostMethodType.tableOrder.tableOrderInfo.tableNumber}${DATABASE_STRING_SEPARATOR}${orderPagePostMethodType.tableOrder.dateAndTime}`, orderedItem.price, orderedItem.menuItemCategory],
                                    async function (err) {
                                        if (err) {
                                            return console.error(err.message);
                                        }

                                        // get menuItemNotInMenuLastId
                                        const menuItemNotInMenuLastId = this.lastID;
                                        console.log(`Rows inserted to \"menu_item_not_in_menu\" table, ID ${menuItemNotInMenuLastId}`);

                                        if (db != null) {
                                            await db.run("UPDATE menu_item_not_in_menu SET id = ? WHERE rowid = ?", [menuItemNotInMenuLastId, menuItemNotInMenuLastId]);
                                        }

                                        // add ingredients to menuItem fuori menu
                                        orderedItem.ingredients.forEach(async (ingrediente) => {
                                            if (db != null) {
                                                const stmt = await db.prepare('SELECT id FROM ingrediente WHERE nome=?');
                                                await stmt.bind({ 1: ingrediente })
                                                const ingredientId: DatabaseId = await stmt.get()
                                                await db.run("INSERT INTO compone_fuori_menu(id_ingrediente,id_menu_item_not_in_menu) VALUES(?, ?)", [ingredientId?.id, menuItemNotInMenuLastId]);
                                            }
                                        });

                                        // add intollerances
                                        orderedItem.intolleranzaA.forEach(async (ingrediente) => {
                                            if (db != null) {
                                                const stmt = await db.prepare('SELECT id FROM ingrediente WHERE nome=?');
                                                await stmt.bind({ 1: ingrediente })
                                                const ingredientId: DatabaseId = await stmt.get()
                                                await db.run("INSERT INTO intolleranza(id_menu_item_not_in_menu,id_ingrediente) VALUES(?, ?)", [menuItemNotInMenuLastId, ingredientId?.id]);
                                            }
                                        });

                                        // place order
                                        if (db != null) {
                                            db.getDatabaseInstance().run(insertSql, [ordinazioneLastId, null, menuItemNotInMenuLastId, orderedItem.slicedIn, orderedItem.numberOf, orderedItem.unitOfMeasure, false], async function (err) {

                                                if (err) {
                                                    return console.error(err.message);
                                                }


                                                const id = this.lastID; // get the id of the last inserted row

                                                if (db != null) {

                                                    // add rowid to table for foreign key logic
                                                    await db.run(insertSql2, [id, id]);

                                                }


                                            });
                                        }

                                    });


                            } else { // menuItems were not created anew or modified

                                const stmt = await db.prepare('SELECT id FROM menu_item WHERE nome=?');
                                await stmt.bind({ 1: orderedItem.menuItem })
                                const menuItemId: DatabaseId = await stmt.get()

                                db.getDatabaseInstance().run(insertSql, [ordinazioneLastId, menuItemId?.id, null, orderedItem.slicedIn, orderedItem.numberOf, orderedItem.unitOfMeasure, false], async function (err) {

                                    if (err) {
                                        return console.error(err.message);
                                    }


                                    const id = this.lastID; // get the id of the last inserted row

                                    if (db != null) {

                                        // add rowid to table for foreign key logic
                                        await db.run(insertSql2, [id, id]);

                                    }


                                });

                            }


                        }


                    });

                });

            }


        });

    } else if (!orderPagePostMethodType.whichPostBody && orderPagePostMethodType.tableOrder == null && orderPagePostMethodType.table != null) { // retrieving data

        // stmt is an instance of `sqlite#Statement`
        // which is a wrapper around `sqlite3#Statement`
        const order = await db.prepare('SELECT * FROM ordinazione WHERE numero_tavolo = ?')
        await order.bind({ 1: orderPagePostMethodType.table.tableNumber })
        let result = await order.get() as OrdinazioneDatabaseTableRow;

        if (result != undefined) { //if false the table does not have an order yet

            let isTakeAway = false;
            if (result.pick_up_time != null)
                isTakeAway = true;

            postResult.tableOrderInfo = {
                tableNumber: result.numero_tavolo,
                isTakeAway: isTakeAway,
                nomeOrdinazione: result.nome_ordinazione,
                isFrittiPrimaDellaPizza: result.is_fritti_prima_della_pizza,
                isSiDividonoLaPizza: result.is_si_dividono_le_pizze,
                slicedIn: result.pizze_divise_in,
                pickUpTime: result.pick_up_time,
                note: result.note,
                numeroBambini: result.numero_bambini,
                numeroAdulti: result.numero_adulti
            }

            postResult.orderedItemsByCategories = await getOrderedItemsByCategoriesFromDatabase(db, result)

        }

    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(postResult), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}