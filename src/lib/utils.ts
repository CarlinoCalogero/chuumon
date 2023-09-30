import { CategoriaConIngredientiCheLaDefiniscono } from "@/types/CategoriaConIngredientiCheLaDefiniscono";
import { CategoriesWithMenuItems } from "@/types/CategoriesWithMenuItems";
import { MenuItemInfo } from "@/types/MenuItemInfo";
import { MenuItemsWithIngredients } from "@/types/MenuItemsWithIngredients";
import { MenuItemsAndOneIngredient } from "@/types/MenuItemsAndOneIngredient";
import { Order } from "@/types/Order";
import { OrderedItem } from "@/types/OrderedItem";
import { OrderedItemByCategories } from "@/types/OrderedItemByCategories";
import { OrderedItemsByCategoriesArray } from "@/types/OrderedItemsByCategoriesArray";
import { CategoriesAndMenuItems } from "@/types/CategoriesAndMenuItems";

export const DATABASE_INFO = "database.db";

export const SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS = 200;

export const FARINE_SPECIALI: CategoriaConIngredientiCheLaDefiniscono = {
    nomeCategoria: "farine speciali",
    ingredientiCheDefinisconoLaCategoria: ["farina di canapa sativa", "farina di curcuma"]
}
export const PINSE_ROMANE: CategoriaConIngredientiCheLaDefiniscono = {
    nomeCategoria: "pinse romane",
    ingredientiCheDefinisconoLaCategoria: ["mix farina di soia"]
}
export const PIZZE_ROSSE: CategoriaConIngredientiCheLaDefiniscono = {
    nomeCategoria: "rosse",
    ingredientiCheDefinisconoLaCategoria: ["pomodoro"]
}
export const PIZZE_BIANCHE: CategoriaConIngredientiCheLaDefiniscono = {
    nomeCategoria: "bianche",
    ingredientiCheDefinisconoLaCategoria: ["mozzarella"]
}
export const CALZONI: CategoriaConIngredientiCheLaDefiniscono = {
    nomeCategoria: "calzoni al forno",
    ingredientiCheDefinisconoLaCategoria: []
}

export const PIZZE_CATEGORIES = ["classiche", FARINE_SPECIALI.nomeCategoria, PINSE_ROMANE.nomeCategoria, PIZZE_ROSSE.nomeCategoria, PIZZE_BIANCHE.nomeCategoria, "speciali"]
export const CATEGORIE_OLTRE_ALLA_PIZZA_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO = [CALZONI.nomeCategoria]
export const CATEGORIE_CREA = {
    pizza: "pizza",
    calzone: "calzone"
}
export const CATEGORIE_CREA_ARRAY = [CATEGORIE_CREA.pizza, CATEGORIE_CREA.calzone]

export const UNITA_DI_MISURA = {
    intera: "intera",
    pezzi: "pezzi"
}

export const SLICED_IN_OPTIONS_ARRAY = [2, 4, 6, 8]

export const OGNI_INGREDIENTE_AGGIUNTO_COSTA_EURO = 1;
export const COPERTO_COSTA_EURO = {
    adulti: 1,
    bambini: 0.5
};

export const DATABASE_STRING_SEPARATOR = "_";

export function removeNumbersFromArray(array: number[], items: number[]) {

    if (array.length == 0)
        return [];

    var dummyArray = [...array];

    items.forEach(item => {
        dummyArray.splice(dummyArray.indexOf(item), 1);
    });

    return dummyArray;

}

export function checkIfMenuItemIsAPizza(menuItemCategory: string) {

    if (menuItemCategory == '')
        return false

    for (var count = 0; count < PIZZE_CATEGORIES.length; count++) {
        var currentPizzaCategoria = PIZZE_CATEGORIES[count];
        if (currentPizzaCategoria.toUpperCase() == menuItemCategory.toUpperCase())
            return true
    }

    return false;
}

export function checkIfMenuItemCanBeSlicedUp(menuItemCategory: string) {

    if (menuItemCategory == '')
        return false

    for (var count = 0; count < CATEGORIE_OLTRE_ALLA_PIZZA_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO.length; count++) {
        var currentSlicedUpItemCategory = CATEGORIE_OLTRE_ALLA_PIZZA_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO[count];
        if (currentSlicedUpItemCategory.toUpperCase() == menuItemCategory.toUpperCase())
            return true
    }

    return false;
}

export function addIngredientToMenuItemWithIngredients(menuItemsWithIngredients: MenuItemsWithIngredients, menuItemsAndOneIngredient: MenuItemsAndOneIngredient) {

    if (menuItemsAndOneIngredient.menuItem in menuItemsWithIngredients) {
        menuItemsWithIngredients[menuItemsAndOneIngredient.menuItem].ingredienti.push(menuItemsAndOneIngredient.ingrediente);
    } else {
        var insert: MenuItemInfo = {
            categoria: menuItemsAndOneIngredient.categoria,
            prezzo: menuItemsAndOneIngredient.prezzo,
            ingredienti: [menuItemsAndOneIngredient.ingrediente]
        }
        menuItemsWithIngredients[menuItemsAndOneIngredient.menuItem] = insert;
    }

}

export function addMenuItemInCategory(categoriesWithMenuItems: CategoriesWithMenuItems, menuItemsAndOneIngredient: MenuItemsAndOneIngredient) {

    if (menuItemsAndOneIngredient.categoria in categoriesWithMenuItems && !categoriesWithMenuItems[menuItemsAndOneIngredient.categoria].includes(menuItemsAndOneIngredient.menuItem)) {
        categoriesWithMenuItems[menuItemsAndOneIngredient.categoria].push(menuItemsAndOneIngredient.menuItem)
    } else {
        categoriesWithMenuItems[menuItemsAndOneIngredient.categoria] = [menuItemsAndOneIngredient.menuItem];
    }

}

export function addOrderedItemToOrderedItemByCategoriesObject(orderedItemsByCategories: OrderedItemByCategories, orderedItem: OrderedItem) {

    if (orderedItem.menuItemCategory == null || orderedItem.menuItem == null)
        return;

    if (orderedItem.menuItemCategory in orderedItemsByCategories && !orderedItemsByCategories[orderedItem.menuItemCategory].insertedOrderedItemsNames.includes(orderedItem.menuItem)) {
        orderedItemsByCategories[orderedItem.menuItemCategory].insertedOrderedItemsNames.push(orderedItem.menuItem);
        orderedItemsByCategories[orderedItem.menuItemCategory].orderedItems.push(orderedItem);
    } else {
        orderedItemsByCategories[orderedItem.menuItemCategory] = {
            insertedOrderedItemsNames: [orderedItem.menuItem],
            orderedItems: [orderedItem]
        };
    }

}

export function getArrayFromOrderedItemsByCategoriesObject(orderedItemsByCategories: OrderedItemByCategories) {

    let orderedItemsByCategoriesArray: OrderedItemsByCategoriesArray = []

    for (const [category, orderedItems] of Object.entries(orderedItemsByCategories)) {

        orderedItemsByCategoriesArray.push({
            categoria: category,
            orderedItems: orderedItems.orderedItems
        });

    }

    return orderedItemsByCategoriesArray;

}

export function getCategoriesAndMenuItemsObjectFromCategoriesWithMenuItemsObject(categoriesWithMenuItems: CategoriesWithMenuItems) {

    let categoriesAndMenuItems: CategoriesAndMenuItems = {
        categories: [],
        menuItems: []
    }

    for (const [category, menuItems] of Object.entries(categoriesWithMenuItems)) {

        categoriesAndMenuItems.categories.push(category);
        categoriesAndMenuItems.menuItems = [...categoriesAndMenuItems.menuItems, ...menuItems]

    }

    return categoriesAndMenuItems;

}

export function getMenuItemsFromCategoryFromCategoriesWithMenuItemsObject(categoriesWithMenuItems: CategoriesWithMenuItems, categoryName: string) {

    if (categoryName in categoriesWithMenuItems)
        return categoriesWithMenuItems[categoryName]

    return [];
}

export function getMenuItemPriceFromMenuItemsWithIngredientsObject(menuItemsWithIngredients: MenuItemsWithIngredients, menuItemName: string) {

    if (menuItemName in menuItemsWithIngredients)
        return menuItemsWithIngredients[menuItemName].prezzo;

    return 0;
}

export function getMenuItemIngredientsFromMenuItemsWithIngredientsObject(menuItemsWithIngredients: MenuItemsWithIngredients, menuItemName: string) {

    if (menuItemName in menuItemsWithIngredients)
        return menuItemsWithIngredients[menuItemName].ingredienti

    return [];
}

export function getMenuItemCategoryFromMenuItemsWithIngredientsObject(menuItemsWithIngredients: MenuItemsWithIngredients, menuItemName: string) {

    if (menuItemName in menuItemsWithIngredients)
        return menuItemsWithIngredients[menuItemName].categoria

    return '';

}

export function getObjectDeepCopy(object: any) {
    return JSON.parse(JSON.stringify(object));
}