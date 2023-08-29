import mysql from 'mysql2/promise'

export async function miao() {
    const connection = await mysql.createConnection(
        {
            host: 'localhost',
            database: 'chuumon',
            user: 'root',
            password: 'root',
            //rowsAsArray: true
        }
    );

    // execute will internally call prepare and query
    const [rows, fields] = await connection.execute('SELECT * FROM pizza');

    return rows
}