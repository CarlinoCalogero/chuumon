export const DATABASE_INFO = "database.db";

export const SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS = 200;

export const PIZZE_CATEGORIES = ["classiche", "farine speciali", "pinse romane", "rosse", "bianche", "speciali"]
export const CATEGORIE_CHE_POSSONO_ESSERE_TAGLIATI_QUANDO_VENGONO_PORTATI_AL_TAVOLO = ["calzoni al forno"]

export const UNITA_DI_MISURA = {
    intera: "intera",
    pezzi: "pezzi"
}

export function removeNumbersFromArray(array: number[], items: number[]) {

    if (array.length == 0)
        return [];

    var dummyArray = [...array];

    items.forEach(item => {
        dummyArray.splice(dummyArray.indexOf(item), 1);
    });

    return dummyArray;

}