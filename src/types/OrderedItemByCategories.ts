import { OrderedItem } from "./OrderedItem";

export type OrderedItemByCategories = Record<string, {
    insertedOrderedItemsNames: string[],
    orderedItems: OrderedItem[]
}>