import { OrderedItem } from "./OrderedItem"

export type ArgumentsUsedForUpdatingConsegnatoInAnOrder = {
    numeroOrdineProgressivoGiornaliero: number,
    orderedItem: OrderedItem | null,
    consegnato: boolean, 
}