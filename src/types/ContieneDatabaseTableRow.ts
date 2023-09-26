export type ContieneDatabaseTableRow = {
    id_ordinazione: number,
    id_menu_item: number | null,
    id_menu_item_not_in_menu: number | null,
    divisa_in: number | null,
    quantita: number,
    nome_unita_di_misura: string,
    consegnato: boolean
}