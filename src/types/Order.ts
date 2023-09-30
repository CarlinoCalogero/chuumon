import { OrderedItem } from "./OrderedItem";
import { OrderedItemByCategories } from "./OrderedItemByCategories";
import { TableOrderInfo } from "./TableOrderInfo";

export type Order = {
    numeroOrdineProgressivoGiornaliero: number,
    dateAndTime: Date,
    orderInfo: TableOrderInfo,
    orderedItems: OrderedItemByCategories,
}