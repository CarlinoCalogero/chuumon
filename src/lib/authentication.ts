import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";
import { DATABASE_INFO } from "./utils";
import { cookies } from 'next/headers'

const MAX_INTEGER = 20;
const DAYS_INTERVAL = 1;
export const USER_TOKEN_COOKIE_NAME = "user_token_cookie";

type TokensDatabaseTableRowWithRowID = {
    rowid: number,
    userID: number,
    token: string,
    data_e_ora: Date
}

function getRandomString() {
    // base 36 (0-9a-z):
    return Math.random().toString(36).slice(2); // remove `0.`
}

function getRandomInt() {
    return Math.floor(Math.random() * MAX_INTEGER);
}

export function createToken() {

    let loops = getRandomInt();
    let result = '';

    for (let count = 0; count < loops; count++) {
        result = `${result}${getRandomString()}`
    }

    return result;
}

export async function deleteAllTokensOlderThanSpecifiedDays(db: Database | null) {

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    // stmt is an instance of `sqlite#Statement`
    // which is a wrapper around `sqlite3#Statement`
    let date: TokensDatabaseTableRowWithRowID | undefined = undefined;
    do {

        date = await db.get(`SELECT rowid,* FROM tokens WHERE DATE(data_e_ora, '+${DAYS_INTERVAL} days') <= datetime('now') LIMIT 1`)

        if (date != undefined) {

            const stmt = await db.prepare('DELETE FROM tokens WHERE rowid=?')
            await stmt.bind({ 1: date.rowid })
            let result = await stmt.get()

            console.log(result)

        }

    } while (date != undefined)
}

function getTokenCookie() {

    const cookieStore = cookies();
    let cookie = cookieStore.get(USER_TOKEN_COOKIE_NAME);
    let token = ''
    if (cookie != undefined)
        token = cookie.value;

    return token;

}

export async function getUserFromToken(db: Database | null) {

    // Check if the database instance has been initialized
    if (!db) {
        // If the database instance is not initialized, open the database connection
        db = await open({
            filename: `./${DATABASE_INFO}`, // Specify the database file path
            driver: sqlite3.Database, // Specify the database driver (sqlite3 in this case)
        });
    }

    let token = getTokenCookie();

    const user: { username: string } | undefined = await db.get('SELECT username from tokens as t join utenti as u on t.userID=u.rowid where t.token = ?', token)

    let username = ''
    if (user != undefined)
        username = user.username;

    return username;
}