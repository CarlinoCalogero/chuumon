const sqlite3 = require("sqlite3").verbose();
const bcrypt = require('bcrypt');

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
    });

})()

function checkIfFinished() {
    if (semaphore != numberOfInserts) {
        console.log("waiting");
    } else {
        console.log("wait finished");
        closeDb();
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