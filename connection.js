const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');

var menu = JSON.parse(fs.readFileSync('./src/content/menu.json'));

console.log(menu);

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

var numberOfInserts = 5;
var semaphore = 0;

(async () => {

    const adminPassword = await hashPassword("admin");
    console.log("admin: ", adminPassword);
    const userPassword = await hashPassword("user");
    console.log("user: ", userPassword);

    // Serialize method ensures that database queries are executed sequentially
    db.serialize(() => {

        //****** UTENTI ******//
        db.run(`drop table if exists utenti`);
        // Create utenti table if it doesn't exist
        db.run(
            `CREATE TABLE utenti (
            username VARCHAR(50) NOT NULL,
            password VARCHAR(50) NOT NULL
        )`,
            (err) => {
                if (err) {
                    return console.error(err.message);
                }

                // Clear the existing data in the products table
                db.run(`DELETE FROM utenti`, (err) => {
                    if (err) {
                        return console.error(err.message);
                    }

                    // Insert new data into the products table
                    const user1 = [
                        "admin",
                        adminPassword,
                    ];

                    const user2 = [
                        "user",
                        userPassword,
                    ];

                    const insertSql = `INSERT INTO utenti(username, password) VALUES(?, ?)`;

                    insertIntoDatabase(insertSql, user1);
                    insertIntoDatabase(insertSql, user2);

                });
            }
        );

        //****** TAVOLO ******//
        db.run(`drop table if exists tavolo`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE tavolo (
            tableNumber INTEGER UNSIGNED NOT NULL,
            numberOfMergedTables INTEGER UNSIGNED NOT NULL,
            top FLOAT NOT NULL,
            left FLOAT NOT NULL,
            rotate FLOAT NOT NULL,
            CONSTRAINT unique_tavolo UNIQUE (tableNumber)
        )`,
            (err) => {
                if (err) {
                    return console.error(err.message);
                }

                // Clear the existing data in the products table
                db.run(`DELETE FROM tavolo`, (err) => {
                    if (err) {
                        return console.error(err.message);
                    }

                    // Insert new data into the products table
                    const table1 = [
                        1,
                        1,
                        159,
                        91,
                        0
                    ];

                    const table2 = [
                        2,
                        1,
                        85,
                        363,
                        0
                    ];

                    const table3 = [
                        3,
                        2,
                        291,
                        457,
                        -33.3916
                    ]

                    const insertSql = `INSERT INTO tavolo(tableNumber, numberOfMergedTables, top, left, rotate) values(?,?,?,?,?)`;

                    insertIntoDatabase(insertSql, table1);
                    insertIntoDatabase(insertSql, table2);
                    insertIntoDatabase(insertSql, table3);

                });
            }
        );

        //****** CATEGORIA ******//
        db.run(`drop table if exists categoria`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE categoria (
                nome VARCHAR(50),
                CONSTRAINT nome_categoria PRIMARY KEY (nome)
            )`);

        //****** INGREDIENTE ******//
        db.run(`drop table if exists ingrediente`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE ingrediente (
                nome VARCHAR(50) NOT NULL,
                CONSTRAINT unique_ingrediente UNIQUE (nome)
            )`);

        //****** UNITA' DI MISURA ******//
        db.run(`drop table if exists unita_di_misura`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE unita_di_misura (
                nome VARCHAR(50),
                CONSTRAINT nome_unita_di_misura PRIMARY KEY (nome)
            )`);

        //****** MENU_ITEM ******//
        db.run(`drop table if exists menu_item`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE menu_item (
                nome varchar(50) NOT NULL,
                prezzo FLOAT NOT NULL,
                nome_categoria VARCHAR(50) NOT NULL,
                CONSTRAINT unique_menu_item UNIQUE (nome),
                CONSTRAINT menu_item_categoria FOREIGN KEY (nome_categoria) REFERENCES categoria (nome) ON DELETE RESTRICT ON UPDATE CASCADE
            )`,
            (err) => {
                if (err) {
                    return console.error(err.message);
                }

                db.serialize(() => {

                    //****** COMPONE ******//
                    db.run(`drop table if exists compone`);
                    // Create tables table if it doesn't exist
                    db.run(
                        `CREATE TABLE compone (
                            id_ingrediente INTEGER UNSIGNED NOT NULL,
                            id_menu_item INTEGER UNSIGNED NOT NULL,
                            quantita INTEGER,
                            nome_unita_di_misura VARCHAR(50),
                            CONSTRAINT primary_key_compone PRIMARY KEY (id_ingrediente, id_menu_item),
                            CONSTRAINT compone_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingrediente (id) ON DELETE RESTRICT ON UPDATE CASCADE,
                            CONSTRAINT compone_menu_item FOREIGN KEY (id_menu_item) REFERENCES menu_item (id) ON DELETE CASCADE ON UPDATE CASCADE,
                            CONSTRAINT quantita_unita_di_misura FOREIGN KEY (nome_unita_di_misura) REFERENCES unita_di_misura (nome) ON DELETE RESTRICT ON UPDATE CASCADE
                        )`,
                        (err) => {
                            if (err) {
                                return console.error(err.message);
                            }

                            db.serialize(() => {

                                //****** ORDINAZIONE ******//
                                db.run(`drop table if exists ordinazione`);
                                // Create tables table if it doesn't exist
                                db.run(
                                    `CREATE TABLE ordinazione (
                                        numero_tavolo INTEGER UNSIGNED NOT NULL,
                                        data_e_ora DATETIME NOT NULL,
                                        note varchar(250),
                                        is_si_dividono_le_pizze BOOLEAN NOT NULL,
                                        numero_ordinazione_progressivo_giornaliero INTEGER UNSIGNED NOT NULL,
                                        pizze_divise_in INTEGER UNSIGNED,
                                        numero_bambini INTEGER UNSIGNED,
                                        numero_adulti INTEGER UNSIGNED NOT NULL,
                                        CONSTRAINT unique_ordinazione UNIQUE (numero_tavolo , data_e_ora),
                                        CHECK (pizze_divise_in IS NULL OR pizze_divise_in = 4 OR pizze_divise_in = 6 OR pizze_divise_in = 8)
                                    )`,
                                    (err) => {
                                        if (err) {
                                            return console.error(err.message);
                                        }

                                        db.serialize(() => {

                                            //****** CONTIENE ******//
                                            db.run(`drop table if exists contiene`);
                                            // Create tables table if it doesn't exist
                                            db.run(
                                                `CREATE TABLE contiene (
                                                    id_ordinazione INTEGER UNSIGNED NOT NULL,
                                                    id_menu_item INTEGER UNSIGNED NOT NULL,
                                                    quantita INTEGER NOT NULL,
                                                    nome_unita_di_misura VARCHAR(50) NOT NULL,
                                                    consegnato BOOLEAN NOT NULL,
                                                    CONSTRAINT unique_contiene UNIQUE (id_ordinazione , id_menu_item),
                                                    CONSTRAINT contiene_ordinazione FOREIGN KEY (id_ordinazione)
                                                        REFERENCES ordinazione (id)
                                                        ON DELETE CASCADE ON UPDATE CASCADE,
                                                    CONSTRAINT contiene_menu_item FOREIGN KEY (id_menu_item)
                                                        REFERENCES menu_item (id)
                                                        ON DELETE RESTRICT ON UPDATE CASCADE,
                                                    CONSTRAINT contiene_unita_di_misura FOREIGN KEY (nome_unita_di_misura)
                                                        REFERENCES unita_di_misura (nome)
                                                        ON DELETE RESTRICT ON UPDATE CASCADE
                                                )`,
                                                (err) => {
                                                    if (err) {
                                                        return console.error(err.message);
                                                    }

                                                    db.serialize(() => {

                                                        //****** INTOLLERANZA ******//
                                                        db.run(`drop table if exists intolleranza`);
                                                        // Create tables table if it doesn't exist
                                                        db.run(
                                                            `CREATE TABLE intolleranza (
                                                                id_contiene INTEGER UNSIGNED NOT NULL,
                                                                id_ingrediente INTEGER UNSIGNED NOT NULL,
                                                                CONSTRAINT primary_key_intolleranza PRIMARY KEY (id_contiene, id_ingrediente),
                                                                CONSTRAINT intolleranza_contiene FOREIGN KEY (id_contiene) REFERENCES contiene (id) ON DELETE CASCADE ON UPDATE CASCADE,
                                                                CONSTRAINT intolleranza_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingrediente (id) ON DELETE RESTRICT ON UPDATE CASCADE
                                                            )`,
                                                            (err) => {
                                                                if (err) {
                                                                    return console.error(err.message);
                                                                }

                                                                //add menu here
                                                                menu.forEach(menuEntry => {
                                                                    insertCategoriaIntoDataBase(menuEntry);
                                                                });
                                                            }
                                                        );

                                                    })
                                                }
                                            );

                                        })
                                    }
                                );

                            })
                        }
                    );

                })
            }
        );

    });

})()

function checkIfFinished() {
    if (semaphore != numberOfInserts) {
        console.log("waiting");
    } else {
        console.log("wait finished");
        //closeDb();
    }
}

function closeDb() {
    //   Close the database connection after all insertions are done
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("Closed the database connection.");
    });
}

async function hashPassword(password) {
    var salt = await bcrypt.genSalt(10);
    console.log(salt);
    var hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
    return hashedPassword;
}

function insertIntoDatabase(insertSql, value) {
    db.run(insertSql, value, function (err) {
        if (err) {
            return console.error(err.message);
        }
        const id = this.lastID; // get the id of the last inserted row
        console.log(`Rows inserted, ID ${id}`);
        semaphore++;
        checkIfFinished();
    });
}

function insertCategoriaIntoDataBase(menuEntry) {

    var categoryName = menuEntry.categoryName;

    db.run("INSERT INTO categoria(nome) VALUES (?)", categoryName, function (err) {
        if (err) {
            return console.error(err.message);
        }
        const id = this.lastID; // get the id of the last inserted row
        console.log(`Rows inserted, ID ${id}`);

        if (menuEntry.entries != null) {

            menuEntry.entries.forEach(categoryEntry => {
                insertCategoryEntryIntoDataBase(categoryName, categoryEntry);
            });

        }

    });

}

function insertCategoryEntryIntoDataBase(categoryName, categoryEntry) {

    if (categoryEntry.subEntries == null && categoryEntry.price != null) {

        insertMenuEntryIntoDataBase(categoryEntry.name, categoryEntry.price, categoryName)

    } else {

        categoryEntry.subEntries.forEach(categorySubEntry => {
            insertMenuEntryIntoDataBase(categoryEntry.name + " " + categorySubEntry.name, categorySubEntry.price, categoryName)
        });
    }



}

function insertMenuEntryIntoDataBase(categoryEntryName, categoryEntryPrice, categoryName) {

    console.log([categoryEntryName, Number(categoryEntryPrice.replace("€", "")), categoryName]);

    db.run("INSERT INTO menu_item(nome, prezzo, nome_categoria) VALUES (?, ?, ?)", [categoryEntryName, Number(categoryEntryPrice.replace("€", "")), categoryName], function (err) {
        if (err) {
            return console.error(err.message);
        }
        const id = this.lastID; // get the id of the last inserted row
        console.log(`Rows inserted, ID ${id}`);

    });


}