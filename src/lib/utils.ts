import { CategoriaConIngredientiCheLaDefiniscono } from "@/types/CategoriaConIngredientiCheLaDefiniscono";

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

export const OGNI_INGREDIENTE_AGGIUNTO_COSTA_EURO = 1;

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