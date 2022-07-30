const express = require('express');
const db = require('./db');
const path = require('path');
const fs = require('fs');
const verifyToken = require('./verify');
const { frontend, secret } = require('../../config.json');

const router = express.Router();

router.get('/delete/:title', async (req, res) => {
    if (!req.query.token || req.query.token != secret) return res.status(401).json({"status":401});

    var fileExtension = path.extname(req.params.title).replace('.', '');
    db.query("DELETE FROM content WHERE title=? AND type=?", [req.params.title, fileExtension]);
    return res.status(200).json({"status":200})
})

router.get('/metadata/:file*?', verifyToken, async (req, res) => {
    if(!req.params.file) {
        var data = await db.query("SELECT * FROM content");
        return res.status(200).json({"status":200,data});
    } else {
        var data = await db.query("SELECT * FROM content WHERE title=?", [req.params.file]);
        return res.status(200).json({"status":200,data});
    }
})

router.patch('/metadata/:file', verifyToken, async (req, res) => {
    if (!req.query.title) return res.status(400).json({"status":400,"message":"No title was provided"});

    var fileExtension = path.extname(req.params.file).replace('.', '');
    var filePath = path.resolve(__dirname, '../static/uploads', fileExtension, req.params.file);

    var metadata = await db.query("SELECT * FROM content WHERE title=? AND type=?", [req.params.file, fileExtension]);

    if(!metadata[0]) return res.status(404).json({"status":404,"message":"Uh oh. That file doesn't exist in the database."});
    else {
        db.query("UPDATE content SET title=?, url=? WHERE title=? AND type=?", [req.query.title + "." + fileExtension, `${frontend.domain}/viewer?file=${req.query.title + "." + fileExtension}`, req.params.file, fileExtension]);
        fs.renameSync(filePath, path.resolve(__dirname, '../', 'static', 'uploads', fileExtension, req.query.title + "." + fileExtension));
        return res.status(200).json({ "status": 200, "newUrl": `${process.env.domain}/viewer?file=${req.query.title + "." + fileExtension}` })
    }
})

module.exports = router;