import { ContieneDatabaseTableRow } from "@/types/ContieneDatabaseTableRow";
import { MenuItemDatabaseTableRow } from "@/types/MenuItemDatabaseTableRow";
import { OrderedItem } from "@/types/OrderedItem";
import { OrderedItemByCategories } from "@/types/OrderedItemByCategories";
import { OrdinazioneDatabaseTableRow } from "@/types/OrdinazioneDatabaseTableRow";
import { Database } from "sqlite";
import { addOrderedItemToOrderedItemByCategoriesObject, checkIfMenuItemCanBeSlicedUp, checkIfMenuItemIsAPizza } from "./utils";
import { MenuItemNotInMenuDatabaseTableRow } from "@/types/MenuItemNotInMenuDatabaseTableRow";

export async function getOrderedItemsByCategoriesFromDatabase(db: Database | null, order: OrdinazioneDatabaseTableRow) {

    var orderedItemsByCategories: OrderedItemByCategories = {};

    if (db != null) {

        // Perform a database query to retrieve all items from the "items" table
        // stmt is an instance of `sqlite#Statement`
        // which is a wrapper around `sqlite3#Statement`
        const stmt = await db.prepare('SELECT * FROM contiene WHERE id_ordinazione=?');
        await stmt.bind({ 1: order.id })
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
                        newOrderedItem.isWasMenuItemCreated = true;

                        addOrderedItemToOrderedItemByCategoriesObject(orderedItemsByCategories, newOrderedItem);

                    }

                }

            }

        };

    }

    return orderedItemsByCategories;

}