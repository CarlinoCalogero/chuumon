import { SalaWithTables } from "./SalaWithTables"
import { Table } from "./Table"

export type Sala = {
    currentMaxTableNumber: number,
    tableNumbersArray: number[],
    saleWithTables: SalaWithTables
}