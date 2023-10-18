import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO, convertJavaScriptDateTimeToSQLLiteDateTime } from "@/lib/utils";
import { checkPassword } from "@/lib/encrypt";
import { User } from "@/types/User";
import { USER_TOKEN_COOKIE_NAME, createToken, deleteAllTokensOlderThanSpecifiedDays, getUserFromToken } from "@/lib/authentication";

type UserWithRowId = {
    rowid: number,
    username: string,
    password: string,
}

// Let's initialize it as null initially, and we will assign the actual database instance later.
var db: Database | null = null;

// Define the GET request handler function
export async function GET() {

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    let user = await getUserFromToken(db);

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(user), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });

}

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

    // removes old tokens
    await deleteAllTokensOlderThanSpecifiedDays(db);

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

    let token: string = "";

    if (isLogin) {
        // implementation of token-based authentication

        const databaseTokens: { token: string }[] = await db.all('SELECT token FROM tokens');
        token = createToken();

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

        await db.run("INSERT INTO tokens(userID, token, data_e_ora)  VALUES(?, ?, ?)", [databaseUser?.rowid, token, convertJavaScriptDateTimeToSQLLiteDateTime()]);
    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(isLogin), {
        headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `${USER_TOKEN_COOKIE_NAME}=${token}; Max-Age=${24 * 3600}; HttpOnly`
        },
        status: 200,
    });
}