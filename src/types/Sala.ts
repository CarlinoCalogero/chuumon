import { Table } from "./Table"

export type Sala = {
    currentMaxTableNumber: number,
    tableNumbersArray: number[],
    tables: Table[]
}