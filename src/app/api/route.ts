import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { DATABASE_INFO } from "@/lib/utils";
import { checkPassword } from "@/lib/encrypt";
import { User } from "@/types/User";

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
    const stmt = await db.prepare('SELECT * FROM utenti WHERE username=?');
    await stmt.bind({ 1: user.username })
    const databaseUser: User | undefined = await stmt.get()

    var isLogin = false;

    if (databaseUser != undefined) {
        isLogin = await checkPassword(user.password, databaseUser.password);
    }

    // Return the items as a JSON response with status 200
    return new Response(JSON.stringify(isLogin), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}