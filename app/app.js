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
const path = require('path')
require('dotenv').config()

// Env Variables (easier to call when deving lmao)
const protocol = process.env.protocol;
const domain = process.env.domain;
const appname = process.env.appname;

// Define Express App
const app = express();

// Use this stuff dammit!
app.use(bodyParser.json());
app.use(express.static(__dirname + '/frontend'))
app.use(cors());
app.use(morgan('dev'))
app.use(fileUpload({
    createParentPath: true
}));

if(!fs.existsSync(__dirname + '/storage.db')) {
    const datab = new sqlite3.Database(__dirname + '/storage.db');
    datab.run(`CREATE TABLE IF NOT EXISTS "screenshots" (
        "title"	TEXT UNIQUE,
        "date"	TEXT,
        "directurl"	TEXT UNIQUE,
        "url"	TEXT UNIQUE
    );`, (error, row) => {
        if(error) {
            console.log(error)
             return;
        }
        console.log('DB successfully created (this only happens on first launch or if the db gets deleted).')
    })
}

const db = new sqlite3.Database(__dirname + '/storage.db');

app.get('/', (req, res) => {
    res.send({ "status": 200, "app-name": `${appname}` })
})

app.post('/post', (req, res) => {
    const header = req.get('secret');
    if (header === `${process.env.secret}`) {
        if (!req.files) {
            return res.status(500).send({ "status": 500, "message": "No files were sent with your request." })
        } else if (!fs.existsSync(__dirname + '/uploads/')) {
            return res.status(500).send({ "status": 500, "message": "The uploads directory doesn't exist." })
        }

        try {
            let screenshot = req.files.sharex
            screenshot.mv(__dirname + '/uploads/' + screenshot.name.toLowerCase())

            // Date & URL Stortage
            let date = new Date();
            let est = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
            let imgurl = `${protocol}://${domain}/upload?view=${screenshot.name.toLowerCase()}`;
            let url = `${protocol}://${domain}/view?photo=${screenshot.name.toLowerCase()}`;

            const insert = db.run(`INSERT INTO screenshots (date, title, url, directurl) VALUES ('${est}','${screenshot.name.toLowerCase()}','${url}','${imgurl}')`, (error, row) => {
                if (error) {
                    console.log(error)
                }
            })

            res.send(url)
        }
        catch(err) {
            return res.status(500).send({ "status": 500, "errors": err.name, "message": `Something went wrong while running POST tasks for ${screenshot.name}.`})
        }
    }
})

app.get('/view', (req, res) => {
    if(req.query.photo) {
        try {
            const scd = db.get(`SELECT * FROM screenshots WHERE title='${req.query.photo}'`, (error, row) => {
                if(error) {
                    console.log(error)
                }

                if(!row) {
                    return res.status(404).send({ "status": 404, "message": "That photo was not found." })
                }

                const filePath = path.resolve(__dirname, './frontend/', 'viewer.html');
        
                // read in the index.html file
                fs.readFile(filePath, 'utf8', function (err,data) {
                  if (err) {
                    return console.log(err);
                  }
                  
                  // replace the special strings with server generated strings
                  data = data.replace(/\$OG_TITLE/g, `Screenshot from ${row.date}`);
                  data = data.replace(/\$OG_BIGIMG/g, `${row.directurl}`)
                  data = data.replace(/\$OG_DATE/g, `${row.date}`)
                  data = data.replace(/\$OG_TITLE/g, `Screenshot from ${row.date}`)
                  data = data.replace(/\$OG_URL/g, `${row.url}`)
                  data = data.replace(/\$OG_SITENAME/g, `${process.env.appname}`)
                  data = data.replace(/\$OG_COLOR/g, `${process.env.color}`)
                  result = data.replace(/\$OG_IMAGE/g, `${row.directurl}`);
                  res.send(result);
                });
            })
        }
        catch(err) {
            console.log(err)
            return res.status(500).send( { "status": 500, "errors": err.name } )
        }
    } else {
        return res.status(404).send({ "status": 404, "message": "You need to provide a photo to search." })
    }
})

app.get('/profile', (req, res) => {
    db.all(`SELECT * FROM screenshots`, (error, row) => {

        if (error) {
            console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
        } else if (!row) {
            const html = `<h3>No files were found in your table</h3>`
            result = data.replace(/\$OG_DATA/g, `${html}`);
            return res.send(result);
        }

        const filePath = path.resolve(__dirname, './frontend/', 'profile.html');
        
        // read in the index.html file
        fs.readFile(filePath, 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          
          permittedValues = [];
          for(i = 0; i < row.length; i++) {
              permittedValues[i] = `<img src="` + row[i].directurl + '"><h3>Image Name: ' + row[i].title + '</h3>'
          }
  
          const html = permittedValues.join(`<br>`)

          data = data.replace(/\$OG_SITENAME/g, `${process.env.appname}`)
          result = data.replace(/\$OG_DATA/g, `${html}`)

          res.send(result);
        });
    })
})

app.get(`/screenshots`, (req, res) => {
    if (req.query.title === undefined) {
        db.all(`SELECT * FROM screenshots`, (error, row) => {
            if(error) {
                console.log(error)
                return res.send({ "status": 500, "errors": error.message, "message": "Something went wrong while running database tasks to display data." })
            }
            res.send({ "response": row });
            })
    } else if (req.query.title != undefined) {
            db.get(`SELECT * FROM screenshots WHERE title = '${req.query.title}'`, (error, row) => {
                if(error) {
                    console.log(error)
                    return res.send({ "status": 500, "errors": error.message, "message": "Something went wrong while running database tasks to display data." })
                }
                res.send({ "response": row})
            })
    }
})

app.get('/screenshots/selectone', (req, res) => {
    if (req.query.title && req.query.field) {
        db.get(`SELECT ${req.query.field} FROM screenshots WHERE title='${req.query.title}'`, (error, row) => {
            return res.status(200).send({ "status": 200, "response": row })
        })
    }
});

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

// STRICTLY File sending endpoints
app.get('/upload', (req, res) => {
    res.download(__dirname + `/uploads/${req.query.view}`)
})

app.get('/assets/js/:id', (req, res) => {
    res.sendFile(__dirname + `/frontend/assets/js/${req.params.id}`)
})

const httpServer = http.createServer(app)
    httpServer.listen(process.env.port, () => {
    console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
    \nNeed help? Let me know on the issues page!
    \nTo get started, read the readme and POST an image via ShareX!
    \nYour Settings: Protocol: ${protocol}, Domain: ${domain}
    \nScript now running on`, chalk.red(`${protocol}://${domain}:${process.env.port}/`, '\n--------------------------\n')));
    }); 