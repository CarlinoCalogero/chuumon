import mysql from 'mysql2/promise'

export async function query() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'chuumon'
    });

    try {
        const [results] = await connection.execute('SELECT * FROM pizza');
        connection.end();
        return results;
    } catch (error: any) {
        throw Error(error.message)
        return { error };
    }
}