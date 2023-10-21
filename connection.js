const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');

const SLICED_IN_OPTIONS_ARRAY = [2, 4, 6, 8] // same as in utils.ts file

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

(async () => {

    const adminPassword = await hashPassword("admin");
    const userPassword = await hashPassword("user");

    //  Serialize method ensures that database queries are executed sequentially
    db.serialize(() => {

        //****** UTENTI ******//
        db.run(`drop table if exists utenti`);
        // Create utenti table if it doesn't exist
        db.run(
            `CREATE TABLE utenti (
                username VARCHAR(50) NOT NULL,
                password VARCHAR(50) NOT NULL
            )`
        );

        // Insert new data into the users table
        const user1 = [
            "admin",
            adminPassword,
        ];

        const user2 = [
            "user",
            userPassword,
        ];

        let insertSql = `INSERT INTO utenti(username, password) VALUES(?, ?)`;

        db.run(insertSql, user1);
        db.run(insertSql, user2);

        //****** TOKENS ******//
        db.run(`drop table if exists tokens`);
        // Create tokens table if it doesn't exist
        db.run(
            `CREATE TABLE tokens (
                userID INTEGER UNSIGNED NOT NULL,
                token VARCHAR(255) NOT NULL,
                data_e_ora DATETIME NOT NULL,
                CONSTRAINT unique_token UNIQUE (token),
                CONSTRAINT unique_token_date UNIQUE (token, data_e_ora),
                CONSTRAINT userID_token FOREIGN KEY (userID) REFERENCES utenti (rowid) ON DELETE RESTRICT ON UPDATE CASCADE
            )`
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
            )`
        );

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

        insertSql = `INSERT INTO tavolo(tableNumber, numberOfMergedTables, top, left, rotate) values(?,?,?,?,?)`;

        db.run(insertSql, table1);
        db.run(insertSql, table2);
        db.run(insertSql, table3);

        //****** CATEGORIA ******//
        db.run(`drop table if exists categoria`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE categoria (
                nome VARCHAR(50),
                CONSTRAINT nome_categoria PRIMARY KEY (nome)
            )`
        );

        //****** INGREDIENTE ******//
        db.run(`drop table if exists ingrediente`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE ingrediente (
                nome VARCHAR(50) NOT NULL,
                CONSTRAINT unique_ingrediente UNIQUE (nome)
            )`
        );

        //****** UNITA' DI MISURA ******//
        db.run(`drop table if exists unita_di_misura`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE unita_di_misura (
                nome VARCHAR(50),
                CONSTRAINT nome_unita_di_misura PRIMARY KEY (nome)
            )`
        );

        insertSql = `INSERT INTO unita_di_misura(nome) VALUES (?)`;

        db.run(insertSql, ["intera"]);
        db.run(insertSql, ["pezzi"]);

        //****** MENU_ITEM_NOT_IN_MENU ******//
        db.run(`drop table if exists menu_item_not_in_menu`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE menu_item_not_in_menu (
                nome varchar(50) NOT NULL,
                prezzo FLOAT NOT NULL,
                nome_categoria VARCHAR(50) NOT NULL,
                CONSTRAINT unique_menu_item_not_in_menu UNIQUE (nome),
                CONSTRAINT menu_item_not_in_menu_categoria FOREIGN KEY (nome_categoria) REFERENCES categoria (nome) ON DELETE RESTRICT ON UPDATE CASCADE
            )`
        );

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
            )`
        );

        //****** COMPONE_FUORI_MENU ******//
        db.run(`drop table if exists compone_fuori_menu`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE compone_fuori_menu (
                id_ingrediente INTEGER UNSIGNED NOT NULL,
                id_menu_item_not_in_menu INTEGER UNSIGNED NOT NULL,
                CONSTRAINT primary_key_compone PRIMARY KEY (id_ingrediente, id_menu_item_not_in_menu),
                CONSTRAINT compone_ingrediente_fuori_menu FOREIGN KEY (id_ingrediente) REFERENCES ingrediente (id) ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT compone_menu_item_not_in_menu FOREIGN KEY (id_menu_item_not_in_menu) REFERENCES menu_item_not_in_menu (id) ON DELETE CASCADE ON UPDATE CASCADE
            )`
        );

        //****** COMPONE ******//
        db.run(`drop table if exists compone`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE compone (
                id_ingrediente INTEGER UNSIGNED NOT NULL,
                id_menu_item INTEGER UNSIGNED NOT NULL,
                CONSTRAINT primary_key_compone PRIMARY KEY (id_ingrediente, id_menu_item),
                CONSTRAINT compone_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingrediente (id) ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT compone_menu_item FOREIGN KEY (id_menu_item) REFERENCES menu_item (id) ON DELETE CASCADE ON UPDATE CASCADE
            )`
        );

        //****** PRENOTAZIONE ******//
        db.run(`drop table if exists prenotazione`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE prenotazione (
                numero_tavolo INTEGER UNSIGNED NOT NULL,
                ora TIME NOT NULL,
                nome_prenotazione varchar(250) NOT NULL,
                numero_persone INTEGER UNSIGNED NOT NULL,
                note varchar(250),
                CONSTRAINT unique_prenotazione UNIQUE (numero_tavolo),
                CONSTRAINT prenotazione_tavolo FOREIGN KEY (numero_tavolo) REFERENCES tavolo (id) ON DELETE CASCADE ON UPDATE CASCADE
            )`
        );

        //****** ORDINAZIONE ******//
        db.run(`drop table if exists ordinazione`);
        // Create tables table if it doesn't exist

        var checkSlicedPizza = ""

        for (let count = 0; count < SLICED_IN_OPTIONS_ARRAY.length; count++) {

            checkSlicedPizza = `${checkSlicedPizza} OR pizze_divise_in = ${SLICED_IN_OPTIONS_ARRAY[count]}`

        }

        db.run(
            `CREATE TABLE ordinazione (
                numero_tavolo INTEGER UNSIGNED,
                data_e_ora DATETIME NOT NULL,
                pick_up_time DATETIME,
                nome_ordinazione varchar(250),
                note varchar(250),
                is_si_dividono_le_pizze BOOLEAN NOT NULL,
                is_fritti_prima_della_pizza BOOLEAN NOT NULL,
                numero_ordinazione_progressivo_giornaliero INTEGER UNSIGNED NOT NULL,
                pizze_divise_in INTEGER UNSIGNED,
                numero_bambini INTEGER UNSIGNED,
                numero_adulti INTEGER UNSIGNED NOT NULL,
                CONSTRAINT unique_ordinazione UNIQUE (numero_tavolo , data_e_ora),
                CONSTRAINT unique_numero_ordinazione_progressivo_giornaliero UNIQUE (numero_ordinazione_progressivo_giornaliero),
                CONSTRAINT ordinazione_tavolo FOREIGN KEY (numero_tavolo) REFERENCES tavolo (id) ON DELETE CASCADE ON UPDATE CASCADE,
                CHECK (pizze_divise_in IS NULL ${checkSlicedPizza})
            )`
        );

        //****** CONTIENE ******//
        db.run(`drop table if exists contiene`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE contiene (
                id_ordinazione INTEGER UNSIGNED NOT NULL,
                id_menu_item INTEGER UNSIGNED,
                id_menu_item_not_in_menu INTEGER UNSIGNED,
                divisa_in INTEGER,
                quantita INTEGER NOT NULL,
                nome_unita_di_misura VARCHAR(50) NOT NULL,
                consegnato BOOLEAN NOT NULL,
                CONSTRAINT unique_contiene UNIQUE (id_ordinazione , id_menu_item),
                CONSTRAINT unique_contiene_not_in_menu UNIQUE (id_ordinazione , id_menu_item_not_in_menu),
                CONSTRAINT contiene_ordinazione FOREIGN KEY (id_ordinazione)
                    REFERENCES ordinazione (id)
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT contiene_menu_item FOREIGN KEY (id_menu_item)
                    REFERENCES menu_item (id)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT contiene_menu_item_not_in_menu FOREIGN KEY (id_menu_item_not_in_menu)
                    REFERENCES menu_item_not_in_menu (id)
                    ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT contiene_unita_di_misura FOREIGN KEY (nome_unita_di_misura)
                    REFERENCES unita_di_misura (nome)
                    ON DELETE RESTRICT ON UPDATE CASCADE
            )`
        );

        //****** INTOLLERANZA ******//
        db.run(`drop table if exists intolleranza`);
        // Create tables table if it doesn't exist
        db.run(
            `CREATE TABLE intolleranza (
                id_menu_item_not_in_menu INTEGER UNSIGNED NOT NULL,
                id_ingrediente INTEGER UNSIGNED NOT NULL,
                CONSTRAINT primary_key_intolleranza PRIMARY KEY (id_menu_item_not_in_menu, id_ingrediente),
                CONSTRAINT intolleranza_menu_item_not_in_menu FOREIGN KEY (id_menu_item_not_in_menu) REFERENCES menu_item_not_in_menu (id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT intolleranza_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingrediente (id) ON DELETE RESTRICT ON UPDATE CASCADE
            )`
        );

        //  Close the database connection after all insertions are done
        db.close((err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Closed the database connection.");
        });

    });

})()

async function hashPassword(password) {
    var salt = await bcrypt.genSalt(10);
    var hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}