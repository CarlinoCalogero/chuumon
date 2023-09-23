import { OrderedItemsByCategoriesArray } from "./OrderedItemsByCategoriesArray"
import { TableOrderInfo } from "./TableOrderInfo"

export type TableOrder = {
    dateAndTime: Date,
    tableOrderInfo: TableOrderInfo,
    orderedItemsByCategoriesArray: OrderedItemsByCategoriesArray
  }