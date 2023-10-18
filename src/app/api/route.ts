import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO } from "@/lib/utils";
import { checkPassword } from "@/lib/encrypt";
import { User } from "@/types/User";
import { createToken } from "@/lib/authentication";

type UserWithRowId = {
    rowid: number,
    username: string,
    password: string,
}

// Let's initialize it as null initially, and we will assign the actual database instance later.
var db: Database | null = null;

// Define the GET request handler function
export async function POST(request: Request, response: Response) {

    var user: User = {
        username: '',
        password: '',
    };

    await request.json().then((data) => {
        user = data;
    })

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    // Perform a database query to retrieve all items from the "items" table
    // stmt is an instance of `sqlite#Statement`
    // which is a wrapper around `sqlite3#Statement`
    const stmt = await db.prepare('SELECT rowid, * FROM utenti WHERE username=?');
    await stmt.bind({ 1: user.username })
    const databaseUser: UserWithRowId | undefined = await stmt.get()

    var isLogin = false;

    if (databaseUser != undefined) {
        isLogin = await checkPassword(user.password, databaseUser.password);
    }

    if (isLogin) {
        // implementation of token-based authentication

        const databaseTokens: { token: string }[] = await db.all('SELECT token FROM tokens');
        let token = createToken();

        if (databaseTokens.length != 0) {

            let isTokenNotUnique = true;

            do {

                let isTokenUnique = true;
                let count = 0;
                while (isTokenUnique && count < databaseTokens.length) {
                    if (databaseTokens[count].token == token) {
                        isTokenUnique = false;
                        token = createToken();
                    }
                    count++
                }

                if (isTokenUnique)
                    isTokenNotUnique = false

            } while (isTokenNotUnique)

        }

        await db.run("INSERT INTO tokens(userID, token)  VALUES(?, ?)", [databaseUser?.rowid, token]);
    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(isLogin), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}