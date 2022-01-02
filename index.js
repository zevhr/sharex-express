////////////////////////////////////////////////////////////////
//   __  .__    .__         .__                               //
// _/  |_|  |__ |__| ______ |__| ______ ______   ____   ____  //
// \   __\  |  \|  |/  ___/ |  |/  ___/ \____ \ /  _ \ / ___\ //
//  |  | |   Y  \  |\___ \  |  |\___ \  |  |_> >  <_> ) /_/  >//
//  |__| |___|  /__/____  > |__/____  > |   __/ \____/\___  / //
//            \/        \/          \/  |__|         /_____/  //
////////////////////////////////////////////////////////////////

const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const sql3 = require('sqlite3');
require('dotenv').config();

require('./app/utils/db')();
const app = express();

app.set('views', path.resolve(__dirname, "app", "views"));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static(path.resolve(__dirname, "app", "static")));
app.use(cors());
app.use(morgan('dev'));
app.use(fileUpload({
    createParentPath: true
}));

var settings = { 
    "appname": `${process.env.appname}`,
    "domain": `${process.env.domain}`, 
    "port": process.env.port, 
    "redirectto": `${process.env.redirect}`, 
    "customization": { 
        "embedColor": `${process.env.color}`,
        "description": `${process.env.description}`
        }
    } 

const db = new sql3.Database(`${__dirname}/app/storage.db`);

// Routes

const api = require('./app/utils/api');
app.use('/api/', api)

app.get('/', (req, res) => {
    if(process.env.redirect === 'no_redirect') {
        return res.send({ "status": 200, "message": "ShareX-Express is running successfully!" })
    } else {
        return res.redirect(process.env.redirect)
    }
})

// Posting handler
var allowed_extensions = new Set([ "png", "jpg", "txt", "json" ])
app.post('/post', (req, res) => {
    const header = req.get('secret');
    var fileExtension = path.extname(req.files.sharex.name).replace('.', '');

    if(!header || header !== process.env.secret) {
        return res.status(401).send({ "status": 401, "message": "Secret not provided or invalid"})
    } else if(!allowed_extensions.has(fileExtension)) {
        return res.status(400).send({ "status": 400, "message": `File type ${fileExtension} is not supported with ShareX-Express.`, "supported_extensions": allowed_extensions })
    } else {

        // Ensure file was sent
        if (!req.files) {
            console.log(chalk.redBright.bold(`No files were uploaded with that!`))
            return res.status(500).send({ "status": 500, "message": "No files were sent with your request." })
        } else if (!fs.existsSync(path.resolve(__dirname, 'app', 'static', 'uploads'))) {
            console.log(chalk.redBright.bold(`The uploads directory doesn't exist!`))
            return res.status(500).send({ "status": 500, "message": "The uploads directory doesn't exist." })
        }

        let file = req.files.sharex;
        let est = Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        let fileurl = `${process.env.domain}/uploads/${fileExtension}/${file.name.toLowerCase()}`
        let url = `${process.env.domain}/viewer?file=${file.name.toLowerCase()}`;

        file.mv(path.resolve(__dirname, 'app', 'static', 'uploads', fileExtension + '/' + file.name.toLowerCase()));

        db.run(`INSERT INTO files (date, title, url, directurl, type) VALUES ($date,$title,$url,$directurl,$type)`, {
            $date: est,
            $title: file.name.toLowerCase(),
            $url: url,
            $directurl: fileurl,
            $type: fileExtension
        }, (error, row) => {
            if (error) {
                console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, I couldn't insert ${file.name} into the database.`})
            } else {
                return res.send(url)
            }
        })
    }
})

// Viewer
app.get('/viewer', (req, res) => {
    if (req.query.file) {
        db.get(`SELECT * FROM files WHERE title=?`, req.query.file, (error, row) => {
            if(error) {
                console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, I couldn't fetch ${req.query.file} from the database.`})
            } else if(!row) {
                return res.render('404', { settings, filename: req.query.file });
            } else {
                const fileExtension = path.extname(req.query.file).replace('.', '');
                if(fileExtension === 'txt') {
                    var data = fs.readFileSync(path.resolve(__dirname, 'app', 'static', 'uploads', 'txt', req.query.file), 'utf8')
                    return res.render('viewer', { settings, row, type: 'text', data: data})
                } else if (fileExtension === 'png' || fileExtension === 'jpg') {
                    return res.render('viewer', { settings, row, type: 'img' })
                } else if (fileExtension === 'json') {
                    var data = fs.readFileSync(path.resolve(__dirname, 'app', 'static', 'uploads', 'json', req.query.file), 'utf8')
                    return res.status(200).send(data)
                }
            }
        })
    } else {
        return res.status(404).send({ "status": 404, "message": "You need to provide a photo that exists on the server."})
    }
})

app.get('/profile', async (req, res) => {
    var { data } = await axios.get(`${process.env.domain}/api/metadata`, {
        headers: { secret: process.env.secret }
    })

    if(!req.query.secret || !req.query.secret === process.env.secret) {
        return res.status(401).send({ 'status': 401 });
    } else {
        return res.render('profile', { settings, query: req.query, data })
    }
})


app.listen(process.env.port, () => {
    console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
    \nNeed help? Let me know on the issues page!
    \nTo get started, read the readme and POST an image via ShareX!
    \nYour Settings: Domain: ${process.env.domain}, Port: ${process.env.port}
    \nScript now running on`, chalk.red(`${process.env.domain}/`, '\n--------------------------\n')));
})