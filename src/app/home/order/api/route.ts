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

    var tableOrder: TableOrder = {
        dateAndTime: new Date(),
        tableOrderInfo: {
            tableNumber: -1,
            isTakeAway: false,
            nomeOrdinazione: null,
            isFrittiPrimaDellaPizza: false,
            isSiDividonoLaPizza: false,
            slicedIn: null,
            pickUpTime: null,
            note: null,
            numeroBambini: null,
            numeroAdulti: null
        },
        orderedItemsByCategoriesArray: []
    };

    await request.json().then((data) => {
        tableOrder = data;
    })

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    // await db.run("delete from ordinazione");
    // await db.run("delete from menu_item_not_in_menu");

    var maxNumeroProgressivoGiornaliero: undefined | { max: null | number } = await db.get('SELECT MAX(numero_ordinazione_progressivo_giornaliero) as max FROM ordinazione')
    var nuovoNumeroProgressivoGiornaliero = 1;

    if (maxNumeroProgressivoGiornaliero != undefined && maxNumeroProgressivoGiornaliero.max != null) {
        nuovoNumeroProgressivoGiornaliero = maxNumeroProgressivoGiornaliero.max + 1;
    }


    await db.run("INSERT INTO ordinazione(numero_tavolo, data_e_ora, pick_up_time, nome_ordinazione, note, is_si_dividono_le_pizze, is_fritti_prima_della_pizza, numero_ordinazione_progressivo_giornaliero, pizze_divise_in, numero_bambini, numero_adulti)  VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [tableOrder.tableOrderInfo.tableNumber, tableOrder.dateAndTime, tableOrder.tableOrderInfo.pickUpTime, tableOrder.tableOrderInfo.nomeOrdinazione, tableOrder.tableOrderInfo.note, tableOrder.tableOrderInfo.isSiDividonoLaPizza, tableOrder.tableOrderInfo.isFrittiPrimaDellaPizza, nuovoNumeroProgressivoGiornaliero, tableOrder.tableOrderInfo.slicedIn, tableOrder.tableOrderInfo.numeroBambini, tableOrder.tableOrderInfo.numeroAdulti]);

    // get ordinazioneLastId
    const ordinazioneLastId: DatabaseRowId = await db.get('SELECT last_insert_rowid() as rowid')

    // link menuItems to order
    tableOrder.orderedItemsByCategoriesArray.forEach(categoryWithOrderedItems => {

        categoryWithOrderedItems.orderedItems.forEach(async (orderedItem) => {

            const insertSql = "INSERT INTO contiene(id_ordinazione,id_menu_item,id_menu_item_not_in_menu,divisa_in,quantita,nome_unita_di_misura,consegnato) VALUES(?,?,?,?,?,?,?)";

            if (db != null) {

                // menuItems were created anew or modified
                if (orderedItem.isWasMenuItemCreated || orderedItem.isWereIngredientsModified) {

                    db.getDatabaseInstance().run("INSERT INTO menu_item_not_in_menu(nome,prezzo,nome_categoria) VALUES(?,?,?)", [`${orderedItem.menuItem}${DATABASE_STRING_SEPARATOR}${tableOrder.tableOrderInfo.tableNumber}${DATABASE_STRING_SEPARATOR}${tableOrder.dateAndTime}`, orderedItem.price, orderedItem.menuItemCategory],
                        function (err) {
                            if (err) {
                                return console.error(err.message);
                            }

                            // get menuItemNotInMenuLastId
                            const menuItemNotInMenuLastId = this.lastID;
                            console.log(`Rows inserted to \"menu_item_not_in_menu\" table, ID ${menuItemNotInMenuLastId}`);

                            // add ingredients to menuItem fuori menu
                            orderedItem.ingredients.forEach(async (ingrediente) => {
                                if (db != null) {
                                    const stmt = await db.prepare('SELECT rowid FROM ingrediente WHERE nome=?');
                                    await stmt.bind({ 1: ingrediente })
                                    const ingredientId: DatabaseRowId = await stmt.get()
                                    await db.run("INSERT INTO compone_fuori_menu(id_ingrediente,id_menu_item_not_in_menu) VALUES(?, ?)", [ingredientId?.rowid, menuItemNotInMenuLastId]);
                                }
                            });

                            // add intollerances
                            orderedItem.intolleranzaA.forEach(async (ingrediente) => {
                                if (db != null) {
                                    const stmt = await db.prepare('SELECT rowid FROM ingrediente WHERE nome=?');
                                    await stmt.bind({ 1: ingrediente })
                                    const ingredientId: DatabaseRowId = await stmt.get()
                                    await db.run("INSERT INTO intolleranza(id_menu_item_not_in_menu,id_ingrediente) VALUES(?, ?)", [menuItemNotInMenuLastId, ingredientId?.rowid]);
                                }
                            });

                            // place order
                            if (db != null) {
                                db.run(insertSql, [ordinazioneLastId?.rowid, null, menuItemNotInMenuLastId, orderedItem.slicedIn, orderedItem.numberOf, orderedItem.unitOfMeasure, false]);
                            }

                        });


                } else { // menuItems were not created anew or modified

                    const stmt = await db.prepare('SELECT rowid FROM menu_item WHERE nome=?');
                    await stmt.bind({ 1: orderedItem.menuItem })
                    const menuItemId: DatabaseRowId = await stmt.get()

                    await db.run(insertSql, [ordinazioneLastId?.rowid, menuItemId?.rowid, null, orderedItem.slicedIn, orderedItem.numberOf, orderedItem.unitOfMeasure, false]);

                }


            }


        });

    });

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify("miao"), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}