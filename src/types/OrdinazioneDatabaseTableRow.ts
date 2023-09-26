export type OrdinazioneDatabaseTableRow = {
    numero_tavolo: number,
    data_e_ora: Date,
    note: string | null,
    is_si_dividono_le_pizze: boolean,
    numero_ordinazione_progressivo_giornaliero: number,
    pizze_divise_in: number | null,
    numero_bambini: number | null,
    numero_adulti: number
}