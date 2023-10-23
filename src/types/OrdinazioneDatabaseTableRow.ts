export type OrdinazioneDatabaseTableRow = {
    id: number,
    numero_tavolo: number,
    data_e_ora: Date,
    pick_up_time: Date | null,
    nome_ordinazione: string | null,
    note: string | null,
    is_si_dividono_le_pizze: boolean,
    is_fritti_prima_della_pizza: boolean,
    numero_ordinazione_progressivo_giornaliero: number,
    pizze_divise_in: number | null,
    numero_bambini: number | null,
    numero_adulti: number
}