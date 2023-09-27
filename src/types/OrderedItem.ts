export type OrderedItem = {
    menuItem: string | null,
    menuItemCategory: string | null,
    price: number | null,
    originalIngredients: string[],
    ingredients: string[],
    removedIngredients: string[],
    addedIngredients: string[],
    intolleranzaA: string[],
    isWasMenuItemCreated: boolean,
    isWereIngredientsModified: boolean,
    isMenuItemAPizza: boolean,
    isCanMenuItemBeSlicedUp: boolean,
    slicedIn: number | null,
    numberOf: number | null,
    unitOfMeasure: string | null,
    consegnato: boolean
}