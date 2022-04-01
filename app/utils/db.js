const sqlite3 = require('sqlite3');
const path = require('path');
module.exports = () => {
    var db = new sqlite3.Database(`${__dirname}/../storage.db`);
        db.run(`CREATE TABLE IF NOT EXISTS "files" (
            "title"	TEXT,
            "date"	TEXT,
            "url"	TEXT UNIQUE,
            "extension" TEXT,
            "type" TEXT
        );`, (error, row) => {
            if(error) {
                console.log(`An error occurred in database creation! If this happens again, create an issue on GitHub.\n`, error)
                process.exit();
            }
        })

        db.run(`CREATE TABLE IF NOT EXISTS "links" (
            "url"	TEXT,
            "id"    TEXT,
            "date" TEXT,
            "shortened" TEXT
        );`, (error, row) => {
            if(error) {
                console.log(`An error occurred in database creation! If this happens again, create an issue on GitHub.\n`, error)
                process.exit();
            }
        })
}