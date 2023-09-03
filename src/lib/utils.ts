export const DATABASE_INFO = "database.db";

export function removeNumberFromArray(array: number[], item: number) {

    if (array.length == 0)
        return [];

    var dummyArray = [...array];

    dummyArray.splice(dummyArray.indexOf(item), 1);

    return dummyArray;

}