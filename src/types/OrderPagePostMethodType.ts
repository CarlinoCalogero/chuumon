import { Table } from "./Table";
import { TableOrder } from "./TableOrder";

export type OrderPagePostMethodType = {
    whichPostBody: boolean, //true if we are placing an order, false if we are retrieving an order
    tableOrder: TableOrder | null,
    table: Table | null
}