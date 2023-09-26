import { OrderedItemByCategoryMap } from "./OrderedItemByCategoryMap";
import { TableOrderInfo } from "./TableOrderInfo";

export type Order = {
    numeroOrdineProgressivoGiornaliero: number,
    dateAndTime: Date,
    orderInfo: TableOrderInfo,
    orderedItems: OrderedItemByCategoryMap,
}