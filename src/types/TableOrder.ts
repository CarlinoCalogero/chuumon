import { OrderedItemsByCategoriesArray } from "./OrderedItemsByCategoriesArray"
import { TableOrderInfo } from "./TableOrderInfo"

export type TableOrder = {
    tableNumber: number,
    tableOrderInfo: TableOrderInfo,
    orderedItemsByCategoriesArray: OrderedItemsByCategoriesArray
  }