export type OrderedItem = {
    menuItem: string | null,
    menuItemCategory: string | null,
    price: number | null,
    ingredients: string[],
    removedIngredients: string[],
    addedIngredients: string[],
    intolleranzaA: string[],
    isWereIngredientsModified: boolean,
    isMenuItemAPizza: boolean,
    isCanMenuItemBeSlicedUp: boolean,
    slicedIn: number | null,
    numberOf: number | null,
    unitOfMeasure: string | null
}