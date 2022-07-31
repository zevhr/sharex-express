const express = require('express');
const db = require('./db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { secret, frontend, appc } = require('../../config.json');
const router = express.Router();

router.get('/viewer', async (req, res) => {
    if (!req.query.file) return res.render('404', {filename: req.query.file});
    var fileExtension = path.extname(req.query.file).replace('.', '');
    var filePath = path.resolve(__dirname, '../static/uploads', fileExtension, req.query.file);

    if (!fs.existsSync(filePath)) return res.status(404).render('404', { filename: req.query.file, settings: frontend });
    var metadata = await db.query("SELECT * FROM content WHERE title='" + req.query.file + "'");
    if(!metadata[0]) return res.status(404).render('404', { filename: req.query.file, settings: frontend });

    switch (fileExtension) {
        case 'txt':
            fs.readFile(path.resolve(filePath), 'utf-8', async (e, d) => {
                if (e) return res.status(500).render('404', {filename: req.query.file, settings: frontend});
                else return res.status(200).render('viewer', {data: metadata[0], settings: frontend, content: d});
            })
        break;
        case 'png' || 'jpg' || 'gif':
            return res.status(200).render('viewer', {data: metadata[0], settings: frontend});
        break;
        case 'gif':
            return res.status(200).render('viewer', {data:metadata[0], settings: frontend})
        break;
        case 'json':
            fs.readFile(path.resolve(filePath), 'utf-8', async (e, d) => {
                if (e) return res.status(500).render('404', {filename: req.query.file, settings: frontend});
                return res.status(200).json(JSON.parse(d));
            })
        break;
    }

})

router.get('/profile', async (req, res) => {
    if (!req.query.token || req.query.token != secret) return res.status(401).json({"status":401});

    axios(frontend.domain + "/api/metadata", {
        method: 'get',
        headers: {
            'content-type': 'application/json',
            'accept': 'application/json',
            'secret': secret
        }
    })
    .then(async function(response) {
        if (response.status == 200) {
            return res.render('profile', { frontend, query: req.query, data: response.data })
        } else return res.status(500).json({"status":500,"message":"The API didn't respond to the latest request."});
    })
})

// Upload handler
var allowed_extensions = new Set(['png', 'jpg', 'txt', 'json', 'gif']);
router.post('/upload', async (req, res) => {
    // all the glorious checks
    var header = req.get('secret');
    if (!req.files) return res.status(400).json({"status":400,"message":"No content sent with request"});
    else if (!header || header != secret) return res.status(401).json({"status":401});

    // the good stuff
    var fileExtension = path.extname(req.files.sharex.name).replace('.', '');
    if (!allowed_extensions.has(fileExtension)) return res.status(400).json({"status":400,"message":"File is of an unsupported type"});

    try {
        // get the date, move the file, insert the metadata
        var date = new Date();
        if (appc.expiry) var offsetDate = new Date(date.getTime() + 12*60*60*1000).getTime();
        else offsetDate = null;

        db.query("INSERT IGNORE INTO content VALUES (?,?,?,?,?)", [req.files.sharex.name, date.toUTCString(), `${frontend.domain}/viewer?file=${req.files.sharex.name}`, fileExtension, offsetDate]);
        req.files.sharex.mv(path.resolve(__dirname, '../static/uploads', fileExtension, req.files.sharex.name));
    } catch (e) {
        console.log(e)
        return res.status(500).json({"status":500,"message":"Uh oh! Something went wrong."})
    }

    // aaand done :tada:
    return res.status(200).json({"status":200,"message":"Successfully uploaded content to server", "url":`${frontend.domain}/viewer?file=${req.files.sharex.name}`});
})

module.exports = router;