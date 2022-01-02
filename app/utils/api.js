const express = require('express');
const sql3 = require('sqlite3');
const path = require('path');
const fs = require('fs');
const verifyToken = require('./verify')
const db = new sql3.Database(path.resolve(__dirname, '../', 'storage.db'));

const router = express.Router();

router.delete('/delete/:title', verifyToken, (req, res) => {
    var fileExtension = path.extname(req.params.title)
    db.run(`DELETE FROM files WHERE title=? AND type=?`, [
        req.params.title,
        fileExtension.replace('.', '')
    ], (error, row) => {
        if (error) {
            console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
            return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, something went wrong when deleting that photo from the database.`})
        } else {
            fs.unlinkSync(path.resolve(__dirname, '../', 'static', 'uploads', fileExtension.replace('.', ''), req.params.title));
            return res.send({ "status": 200 })
        }
    })
})

router.get('/metadata/:file*?', verifyToken, (req, res) => {
    if(!req.params.file) {
        db.all(`SELECT * FROM files`, (error, data) => {
            if (error) {
                console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, something went wrong when querying the database.`})
            } else return res.send({ data })
        })
    } else {
        db.get(`SELECT * FROM files WHERE title=?`, req.params.file, (error, data) => {
            if(error) {
                console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, something went wrong when querying the database.`})
            } else if (!data) {
                return res.status(404).send({ "status": 404, "message": "No data for that file."})
            } else {
                return res.status(200).send({ data })
            }
        })
    }
})

router.patch(`/metadata/:file`, verifyToken, (req, res) => {
    if(!req.query.title) {
        return res.status(400).send({ "status": 400, "message": "No new title was provided." });
    }

    var fileExtension = path.extname(req.params.file);

    db.get('SELECT * FROM files WHERE title=? AND type=?', [
        req.params.file,
        fileExtension.replace('.', '')
    ], (error, row) => {
        if (error) {
            console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
            return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, something went wrong when querying the database.`})
        } else if (!row) {
            return res.status(404).send({ "status": 404, "message": "That photo doesn't exist on the server." });
        } else {
            db.run(`UPDATE files SET title=?, directurl=?, url=? WHERE title=? AND type=?`, [
                req.query.title + fileExtension,
                `${process.env.domain}/uploads/${fileExtension.replace('.', '')}/${req.query.title + fileExtension}`,
                `${process.env.domain}/viewer?file=${req.query.title + fileExtension}`,
                req.params.file,
                fileExtension.replace('.', '')
            ], (error) => {
                if(error) {
                    if(error.message.includes(`UNIQUE`)) {
                        console.log(`${req.query.title + fileExtension} already exists on the server!`)
                        // return res.status(500).send({ "status": 500, "message": "A file with the same name and file extension exists on the server."})
                    } else {
                        console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                        return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, something went wrong when querying the database.`})
                    }
                }
            })

            fs.renameSync(path.resolve(__dirname, '../', 'static', 'uploads', fileExtension.replace('.', ''), req.params.file), path.resolve(__dirname, '../', 'static', 'uploads', fileExtension.replace('.', ''), req.query.title + fileExtension))
            return res.send({ "status": 200, "newUrl": `${process.env.domain}/viewer?file=${req.query.title + fileExtension}` })
        }
    })
})

module.exports = router;