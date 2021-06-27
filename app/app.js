////////////////////////////////////////////////////////////////
//   __  .__    .__         .__                               //
// _/  |_|  |__ |__| ______ |__| ______ ______   ____   ____  //
// \   __\  |  \|  |/  ___/ |  |/  ___/ \____ \ /  _ \ / ___\ //
//  |  | |   Y  \  |\___ \  |  |\___ \  |  |_> >  <_> ) /_/  >//
//  |__| |___|  /__/____  > |__/____  > |   __/ \____/\___  / //
//            \/        \/          \/  |__|         /_____/  //
////////////////////////////////////////////////////////////////

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const chalk = require('chalk');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const sqlite3 = require('sqlite3');
require('dotenv').config()

// Env Variables (easier to call when deving lmao)
const protocol = process.env.protocol;
const domain = process.env.domain;
const appname = process.env.appname;

// Define Express App
const app = express();

// Use this stuff dammit!
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'))
app.use(fileUpload({
    createParentPath: true
}));

app.get('/', (req, res) => {
    res.send({ "status": 200, "app-name": `${appname}` })
})

// if (process.env.sql === true) {
//     const pool = require(`./modules/db`);
//     app.set('pool', pool);
// }
// SQL support coming soon ;))

if (process.env.sqlite === `true` && !fs.existsSync(__dirname + '/storage.db')) {
    const datab = new sqlite3.Database(__dirname + '/storage.db');
    datab.run(`CREATE TABLE IF NOT EXISTS "screenshots" (
        "title"	TEXT UNIQUE,
        "date"	TEXT,
        "directurl"	TEXT UNIQUE,
        "url"	TEXT UNIQUE
    );`, (error, row) => {
        if(error) {
            console.log(error)
        }
        console.log('DB successfully created (this only happens on first launch or if the db gets deleted).')
    })
}

const db = new sqlite3.Database(__dirname + '/storage.db');

app.post('/post', (req, res) => {
    const header = req.get('secret');

    if(header === `${process.env.secret}`) {

    if(!req.files) {
        return res.status(500).send({ "status": 500, "message": "No files were sent."})
    } else if (!fs.existsSync(__dirname + '/uploads/')) {
        return res.status(500).send({ "status": 500, "message": "No uploads folder was detected in the root directory." })
    }

    try {
        let screenshot = req.files.sharex
        screenshot.mv(__dirname + '/uploads/' + screenshot.name)

        const date = new Date();
        let imgurl = `${protocol}://${domain}/upload?view=${screenshot.name}`
        let url = `${protocol}://${domain}/view?photo=${screenshot.name}`

        const insert = db.run(`INSERT INTO screenshots (date, title, url, directurl) VALUES ('${date}','${screenshot.name}','${url}','${imgurl}')`, (error, row) => {
            const data = db.run(`SELECT * FROM screenshots WHERE title='${screenshot.name}'`)
        })

        res.send(url)

    }
    catch(err) {
        console.log(err)
        }
    } else if (!header) {
        res.status(403).send({ "status": 403, "message": "No secret header was supplied." })
    } else if (header != process.env.secret) {
        res.status(403).send({ "status": 403, "message": "A secret header was supplied, but was incorrect." })
    }
})

app.delete('/delete/:id', (req, res) => {
    const header = req.get('secret');
    if(header === `${process.env.secret}`) {
        if(fs.existsSync(__dirname + `/uploads/${req.params.id}`)) {
            fs.unlink(__dirname + `/uploads/${req.params.id}`, (err) => {
                if(err) {
                    console.log(err)
                }
                db.run(`DELETE FROM screenshots WHERE title='${req.params.id}'`)
                console.log(chalk.red.bold`${req.params.id} was deleted.`)
            })
            res.status(200).send({ "status": 200, "message": `${req.params.id} was successfully deleted.`})
        } else if (!fs.existsSync(__dirname + `/uploads/${req.params.id}`)) {
            res.status(404).send({ "status": 404, "message": `${req.params.id} wasn't found on the server.`})
            console.log(chalk.red.bold`I couldn't find ${req.params.id}, sorry.`)
        }
    } else if (!header) {
        res.status(403).send({ "status": 403, "message": "No secret header was supplied."})
    } else if (header != process.env.secret) {
        res.status(403).send({ "status": 403, "message": "The secret header was found but doesn't match the one specified." })
    }
})

app.get('/screenshots', (req, res) => { // JSON Response of all screenshots
    if(req.query.title === undefined) {
        db.all('SELECT * FROM screenshots', (error, row) => {
            res.send({ "response": row });
            if(error) {
                console.log(error);
            }
        });
    } else if (req.query.title) {
        db.get(`SELECT * FROM screenshots WHERE title = '${req.query.title}'`, (error, row) => {
            res.send({ "response": row });
            if(error) {
                console.log(error);
            }
        });
    }
})


// STRICTLY File sending endpoints
app.get('/upload', (req, res) => {
    res.sendFile(__dirname + `/uploads/${req.query.view}`)
})

app.get('/view', (req, res) => {
    res.sendFile(__dirname + `/frontend/index.html`)
})

// Resource sending endpoints
app.get('/assets/js/:id', (req, res) => {
    res.sendFile(__dirname + `/frontend/assets/js/${req.params.id}`)
})

if (process.env.domain === undefined) {
    console.log(chalk.redBright.bold`The domain property in .env wasn't found! ` +  chalk.redBright`Either it wasn't provided or .env doesn't exist!`)
    process.exit(1);
} else if (process.env.protocol === undefined) {
    console.log(chalk.redBright.bold`The protocol property in .env wasn't found! `, chalk.redBright`Either it wasn't provided or .env doesn't exist!`)
    process.exit(1);
} else if (process.env.secret === `yoursupersecretmasterpasswordhere`) {
    console.log(chalk.redBright`Please change your secret from the default 'yoursupersecretmasterpasswordhere' to prevent possible comprimisations.`)
    process.exit(1);
} else if (process.env.secret === undefined) {
    console.log(chalk.redBright.bold`The secret property in .env wasn't found! ` + chalk.redBright`Either it wasn't provided or .env doesn't exist!`)
    process.exit(1);
}

const httpServer = http.createServer(app)
httpServer.listen(1337, () => {
    console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
    \nNeed help? Let me know on the issues page or via my dev Discord (https://awexxx.xyz/discord)!
    \nTo get started, read the readme and POST an image via ShareX!
    \nYour Settings: Protocol: ${protocol}, Domain: ${domain}
    \nScript now running on`, chalk.red(`http://localhost:1337/`, '\n--------------------------\n')));
    }); 
