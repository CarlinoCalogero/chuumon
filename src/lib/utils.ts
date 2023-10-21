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
import { HoursAndMinutesInSeconds } from "@/types/HoursAndMinutesInSeconds";

export const DATABASE_INFO = "database.db";

export const USERS = {
    admin: "admin",
    user: "user"
}

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

export const CREATED_MENU_ITEM_SUFFIX = "FUORI MENU"

export const EDITED_MENU_ITEM_SUFFIX = "CON MODIFICHE"

export const TAKE_AWAY_ORDER_SECTION_NUMBER_TRIGGER = -1;

export const MAX_TAKE_AWAY_ORDER_TIME = "06:00"

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
        if (menuItemsAndOneIngredient.ingrediente != null)
            menuItemsWithIngredients[menuItemsAndOneIngredient.menuItem].ingredienti.push(menuItemsAndOneIngredient.ingrediente);
    } else {
        let ingredient: string[] = [];

        if (menuItemsAndOneIngredient.ingrediente != null)
            ingredient = [menuItemsAndOneIngredient.ingrediente]

        let insert: MenuItemInfo = {
            categoria: menuItemsAndOneIngredient.categoria,
            prezzo: menuItemsAndOneIngredient.prezzo,
            ingredienti: ingredient
        }
        menuItemsWithIngredients[menuItemsAndOneIngredient.menuItem] = insert;
    }

}

export function addMenuItemInCategory(categoriesWithMenuItems: CategoriesWithMenuItems, menuItemsAndOneIngredient: MenuItemsAndOneIngredient) {

    if (menuItemsAndOneIngredient.categoria in categoriesWithMenuItems) {
        if (!categoriesWithMenuItems[menuItemsAndOneIngredient.categoria].includes(menuItemsAndOneIngredient.menuItem))
            categoriesWithMenuItems[menuItemsAndOneIngredient.categoria].push(menuItemsAndOneIngredient.menuItem)
    } else {
        categoriesWithMenuItems[menuItemsAndOneIngredient.categoria] = [menuItemsAndOneIngredient.menuItem];
    }

}

export function addOrderedItemToOrderedItemByCategoriesObject(orderedItemsByCategories: OrderedItemByCategories, orderedItem: OrderedItem) {

    if (orderedItem.menuItemCategory == null || orderedItem.menuItem == null)
        return;

    if (orderedItem.menuItemCategory in orderedItemsByCategories) {
        if (!orderedItemsByCategories[orderedItem.menuItemCategory].insertedOrderedItemsNames.includes(orderedItem.menuItem)) {
            orderedItemsByCategories[orderedItem.menuItemCategory].insertedOrderedItemsNames.push(orderedItem.menuItem);
            orderedItemsByCategories[orderedItem.menuItemCategory].orderedItems.push(orderedItem);
        }
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

export function putIngredientsTogether(ingredientsArray: string[]) {

    let separator = ",";
    let returnText = ""

    ingredientsArray.forEach(ingredient => {
        if (returnText != "") {
            returnText = `${returnText}${separator} ${ingredient}`
        } else {
            returnText = ingredient;
        }

    });

    return returnText;

}

export function getPercentage(totalItems: number, iterestedItems: number) {

    // 100 : totalItems = x : iterestedItems
    return (100 * iterestedItems) / totalItems;
}

export function getTimeAsString(inputDate: Date = new Date()) {
    let date = new Date(inputDate)
    // if no date is specified gets current Date
    return normalizeNumber(date.getHours()) + ":" + normalizeNumber(date.getMinutes())
}

export function normalizeNumber(inputNumber: number) {
    if (inputNumber > -1 && inputNumber < 10)
        return '0' + inputNumber
    return inputNumber
}

export function convertHHMMStringTimeFormatToDateObject(inputStringDate: string) {
    let timeArray = inputStringDate.split(":");

    if (timeArray.length != 2)
        return null;

    let returnDate = new Date();
    returnDate.setHours(Number(timeArray[0]))
    returnDate.setMinutes(Number(timeArray[1]))
    return returnDate;
}

export function getSameDayTimeDifference(inputPastDate: Date, inputFutureDate: Date) {

    let pastDate = new Date(inputPastDate);
    let futureDate = new Date(inputFutureDate);

    // if not the same day do nothing
    if (!((pastDate.getFullYear() == futureDate.getFullYear()) && (pastDate.getMonth() == futureDate.getMonth()) && (pastDate.getDay() == futureDate.getDay())))
        return "Ordine Vecchio";

    let pastDateInSeconds = getSecondsFromTimeDate(pastDate);
    let futureDateInSeconds = getSecondsFromTimeDate(futureDate);

    let minutes = futureDateInSeconds.minutes - pastDateInSeconds.minutes;
    if ((futureDateInSeconds.hours > pastDateInSeconds.hours) && minutes < 0)
        minutes = minutes * -1

    let differenceBetweenDatesInSeconds = {
        hours: futureDateInSeconds.hours - pastDateInSeconds.hours,
        minutes: minutes
    };

    return fromSecondsToHoursAndMinutes(differenceBetweenDatesInSeconds)
}

export function getSecondsFromTimeDate(inputDate: Date) {
    let date = new Date(inputDate);
    let hoursAndMinutesInSeconds: HoursAndMinutesInSeconds = {
        hours: date.getHours() * 3600,
        minutes: date.getMinutes() * 60
    }
    return hoursAndMinutesInSeconds;
}

export function fromSecondsToHoursAndMinutes(dateInSeconds: HoursAndMinutesInSeconds) {
    let hours = dateInSeconds.hours / 3600
    let minutes = dateInSeconds.minutes / 60;
    if (hours < 0 || minutes < 0) {
        hours = hours * -1;
        minutes = minutes * -1;
        return "-" + hours + "h" + minutes + "min"
    }

    return hours + "h" + minutes + "min"
}

export function convertJavaScriptDateTimeToSQLLiteDateTime(inputDate: Date = new Date()) {
    let returnDate = new Date(inputDate);
    let tempDate = returnDate.toISOString().replace("T", " ");
    return tempDate.substring(0, tempDate.indexOf("."));
}