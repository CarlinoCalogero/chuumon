export const DATABASE_INFO = "database.db";

export const SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS = 200;

export function removeNumbersFromArray(array: number[], items: number[]) {

    if (array.length == 0)
        return [];

    var dummyArray = [...array];

    items.forEach(item => {
        dummyArray.splice(dummyArray.indexOf(item), 1);
    });

    return dummyArray;

}