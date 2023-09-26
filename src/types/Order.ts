import { OrderedItemByCategoryMap } from "./OrderedItemByCategoryMap";
import { TableOrderInfo } from "./TableOrderInfo";

export type Order = {
    orderInfo: TableOrderInfo,
    orderedItems: OrderedItemByCategoryMap,
}