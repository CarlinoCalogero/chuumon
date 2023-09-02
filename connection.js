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

// Serialize method ensures that database queries are executed sequentially
db.serialize(() => {
    db.run(`drop table if exists utenti`);
    // Create the items table if it doesn't exist
    db.run(
        `CREATE TABLE utenti (
            id INTEGER UNSIGNED AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(50) NOT NULL,
            CONSTRAINT ID_utenti PRIMARY KEY (id)
        )`,
        (err) => {
            if (err) {
                return console.error(err.message);
            }
            console.log("Created items table.");

            // Clear the existing data in the products table
            db.run(`DELETE FROM utenti`, (err) => {
                if (err) {
                    return console.error(err.message);
                }
                console.log("All rows deleted from utenti");

                // Insert new data into the products table
                const values1 = [
                    "admin",
                    "admin",
                ];

                const values2 = [
                    "user",
                    "user",
                ];

                const insertSql = `INSERT INTO utenti(username, password) VALUES(?, ?)`;

                hashPassword(values1[1]).then(function (hashedPassword) {
                    values1[1] = hashedPassword;
                    console.log(values1);
                    db.run(insertSql, values1, function (err) {
                        if (err) {
                            return console.error(err.message);
                        }
                        const id = this.lastID; // get the id of the last inserted row
                        console.log(`Rows inserted, ID ${id}`);
                    });
                }).then(() => {
                    hashPassword(values2[1]).then(function (hashedPassword) {
                        values2[1] = hashedPassword;
                        console.log(values2);
                        db.run(insertSql, values2, function (err) {
                            if (err) {
                                return console.error(err.message);
                            }
                            const id = this.lastID; // get the id of the last inserted row
                            console.log(`Rows inserted, ID ${id}`);
                        });
                    }).then(() => {
                        //   Close the database connection after all insertions are done
                        db.close((err) => {
                            if (err) {
                                return console.error(err.message);
                            }
                            console.log("Closed the database connection.");
                        });
                    });
                });


            });
        }
    );
});

function hashPassword(password) {
    return bcrypt.genSalt(10).then(function (salt) {
        return bcrypt.hash(password, salt).then(function (hash) {
            return hash;
        });
    });
}