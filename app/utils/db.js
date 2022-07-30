const sql = require('mysql2/promise');
const { database } = require('../../config.json');

const db = new sql.createPool({
    host: database.host,
    user: database.user,
    pass: database.pass,
    port: database.port,
    database: database.database
}) 

db.query("CREATE TABLE IF NOT EXISTS content (title text unique, date text, url text unique, type text)");

async function query(string, options) {
    var q = await db.query(string, options);
    return q[0];
}

module.exports = { query };