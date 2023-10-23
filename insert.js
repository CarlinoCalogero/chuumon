const sqlite3 = require("sqlite3").verbose();
const fs = require('fs');

var menu = JSON.parse(fs.readFileSync('./src/content/menu.json'));

// Connecting to or creating a new SQLite database file
const db = new sqlite3.Database(
    `./database.db`,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {

        if (err) {
            return console.error(err.message);
        }
        console.log("Connected to the SQlite database.");
    }
);

// when inserting rows in this way do not activate foreign key control

(async () => {

    //add menu here
    for (let count = 0; count < menu.length; count++) {
        insertCategoriaIntoDataBase(menu[count]);
    }

})()

function closeDatabase() {

    //  Close the database connection after all insertions are done
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Closed the database connection.");
    });

}

function insertCategoriaIntoDataBase(menuEntry) {

    var categoryName = menuEntry.categoryName;

    db.run("INSERT INTO categoria(nome) VALUES (?)", categoryName.toLowerCase());

    if (menuEntry.entries != null) {

        for (let count = 0; count < menuEntry.entries.length; count++) {
            insertCategoryEntryIntoDataBase(categoryName, menuEntry.entries[count]);
        }

    }

}

function insertCategoryEntryIntoDataBase(categoryName, categoryEntry) {

    if (categoryEntry.subEntries == null && categoryEntry.price != null) {

        insertMenuEntryIntoDataBase(categoryEntry.name, categoryEntry.price, categoryName, categoryEntry.description)

    } else {

        for (let count = 0; count < categoryEntry.subEntries.length; count++) {
            let subEntry = categoryEntry.subEntries[count];
            insertMenuEntryIntoDataBase(categoryEntry.name + " " + subEntry.name, subEntry.price, categoryName, categoryEntry.description)
        }

    }

}

function insertMenuEntryIntoDataBase(categoryEntryName, categoryEntryPrice, categoryName, categoryEntryDescription) {

    db.run("INSERT INTO menu_item(nome, prezzo, nome_categoria) VALUES (?, ?, ?)", [categoryEntryName.toLowerCase(), Number(categoryEntryPrice.replace("€", "")), categoryName.toLowerCase()], function (err) {

        if (err) {
            return console.error(err.message);
        }

        const id = this.lastID; // get the id of the last inserted row

        // add rowid to table for foreign key logic
        db.run("UPDATE menu_item SET id = ? WHERE rowid = ?", [id, id]);

        if (categoryEntryDescription != null) {

            var ingredientsArray = categoryEntryDescription.split(",");

            for (let count = 0; count < ingredientsArray.length; count++) {
                let ingredient = ingredientsArray[count];
                addIngredientToDataBase(ingredient.trim(), id)
            }

        }

    });

}

function addIngredientToDataBase(ingredient, menuEntryID) {

    ingredient = ingredient.toLowerCase();

    db.run("INSERT INTO ingrediente(nome) VALUES (?)", ingredient, function (err) {

        if (err) {

            // ingredient already exists

            db.get('SELECT id FROM ingrediente WHERE nome = ?', ingredient, (err, row) => {

                if (err) {
                    return console.error(err.message);
                }

                addComponeToDataBase(row.id, menuEntryID)
            });

        } else {

            // ingredient does not already exists

            const id = this.lastID; // get the id of the last inserted row

            // add rowid to table for foreign key logic
            db.run("UPDATE ingrediente SET id = ? WHERE rowid = ?", [id, id]);

            addComponeToDataBase(id, menuEntryID)

        }

    });

}

function addComponeToDataBase(ingredientID, menuEntryID) {

    db.run("INSERT INTO compone(id_ingrediente, id_menu_item) VALUES (?, ?)", [Number(ingredientID), Number(menuEntryID)]);

}