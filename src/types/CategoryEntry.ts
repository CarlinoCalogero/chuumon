import { CategorySubEntry } from "./CategorySubEntry"

export type CategoryEntry = {
    name: string,
    description: null | string,
    subEntries: null | CategorySubEntry[],
    price: null | string
}