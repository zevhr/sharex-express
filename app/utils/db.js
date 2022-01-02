const sqlite3 = require('sqlite3');
const path = require('path');
module.exports = () => {
    var db = new sqlite3.Database(`${__dirname}/../storage.db`);
        db.run(`CREATE TABLE IF NOT EXISTS "files" (
            "title"	TEXT,
            "date"	TEXT,
            "directurl"	TEXT UNIQUE,
            "url"	TEXT UNIQUE,
            "type" TEXT
        );`, (error, row) => {
            if(error) {
                console.log(`An error occurred in database creation! If this happens again, create an issue on GitHub.\n`, error)
                process.exit();
            }
        })
}