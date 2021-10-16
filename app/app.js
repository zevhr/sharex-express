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
const chalk = require('chalk');
const morgan = require('morgan');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const axios = require('axios').default;
require('dotenv').config({ path: __dirname + '/.env' })

const app = express();

app.use(express.json());
app.use(express.static(__dirname + '/frontend'));
app.use(cors());
app.use(morgan('dev'));
app.use(fileUpload({
    createParentPath: true
}));

// Database creation for the cool data storage stuff ;p
var db = new sqlite3.Database(__dirname + '/storage.db');
    if(!fs.existsSync(__dirname + '/storage.db')) {
        db.run(`CREATE TABLE IF NOT EXISTS "screenshots" (
            "title"	TEXT UNIQUE,
            "date"	TEXT,
            "directurl"	TEXT UNIQUE,
            "url"	TEXT UNIQUE
        );`, (error, row) => {
            if(error) {
                console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                return;
            }
            console.log('DB successfully created (this only happens on first launch or if the db gets deleted).')
        })
    }

    // Endpoints
    app.get('/', (req, res) => {
        if (process.env.redirect === 'no_redirect' || !process.env.redirect) {
            return res.send({ "status": 200, "app-name": `${appname}` })
        } else {
            return res.redirect(process.env.redirect)
        }
    })

    app.get('/settings', (req, res) => {
        res.send({ "status": 200, 
        "settings": { 
            "appname": `${process.env.appname}`,
            "domain": `${process.env.domain}`, 
            "port": process.env.port, 
            "redirectto": `${process.env.redirect}`, 
            "customization": { 
                "embedColor": `${process.env.color}`,
                "dadjoke": process.env.dadjoke
                }
            } 
        })
    })

    app.post('/post', async (req, res) => {
        const header = req.get('secret');
        if (header === `${process.env.secret}`) {
            if (!req.files) {
                console.log(chalk.redBright.bold(`No files were uploaded with that!`))
                return res.status(500).send({ "status": 500, "message": "No files were sent with your request." })
            } else if (!fs.existsSync(__dirname + '/frontend/uploads/')) {
                console.log(chalk.redBright.bold(`The uploads directory doesn't exist!`))
                return res.status(500).send({ "status": 500, "message": "The uploads directory doesn't exist." })
            }

            let screenshot = req.files.sharex
            screenshot.mv(__dirname + '/frontend/uploads/' + screenshot.name.toLowerCase());

            // Data stuff lul
            let est = Date().toLocaleString(`en-US`, { timeZone: `America/New_York` });
            let imgurl = `${process.env.protocol}://${process.env.domain}/uploads/${screenshot.name.toLowerCase()}`
            let url = `${process.env.protocol}://${process.env.domain}/view?photo=${screenshot.name.toLowerCase()}`;

            const insert = db.run(`INSERT INTO screenshots (date, title, url, directurl) VALUES ('${est}','${screenshot.name.toLowerCase()}','${url}','${imgurl}')`, (error, row) => {
                if (error) {
                    console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                    return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, I couldn't insert ${screenshot.name} into the database.`})
                } else {
                    return res.send(url)
                }
            })
        }
    })

    app.get('/view', async (req, res) => {
        if(req.query.photo) {
                const scd = db.get(`SELECT * FROM screenshots WHERE title='${req.query.photo}'`, (error, row) => {
                    if(error) {
                        console.log(`An error occurred! If this happens again, create an issue on GitHub.\n`, error)
                        return res.status(500).send({ "status": 500, "error": error.message, "message": `Sorry, something went wrong when querying the database.`})
                    }
    
                    if(!row) {
                        return res.redirect(`/notfound.html?filename=${req.query.photo}`)
                    }
    
                    var filePath = `${__dirname + '/frontend/' + 'viewer.html'}`
            
                    // read in the index.html file
                    fs.readFile(filePath, 'utf8', async function (err,data) {
                      if (err) {
                        console.log(err);
                        return res.status(500).send({ "status": 500, "filepath": filePath, "error": err.message, "message": `Sorry, something went wrong when trying to look for viewer.html. I've provided the filepath to this file, make sure it exists!`})
                      }
                      
                      // Dynamic meta tags, has to be server-side since crawlers don't generally run javascript
                      if (process.env.dadjoke === 'true') {
                          const dadjoke = await axios.get(`https://icanhazdadjoke.com`, {
                              method: 'GET',
                              headers: { 'Accept': 'application/json', 'user-agent': 'Awex - ShareX-Express (https://github.com/awexxx/sharex-express), hello!' }
                          })
                        
                          data = data.replace(/\$OG_TITLE/g, `${dadjoke.data.joke}`);
                      } else {
                        data = data.replace(/\$OG_TITLE/g, `Screenshot from ${row.date}`);
                      }
    
                      data = data.replace(/\$OG_DATE/g, `Screenshot taken on ${row.date}`)
                      data = data.replace(/\$OG_URL/g, `${row.url}`)
                      data = data.replace(/\$OG_SITENAME/g, `${row.title} >> ${process.env.appname}`)
                      data = data.replace(/\$OG_COLOR/g, `${process.env.color}`)
                      result = data.replace(/\$OG_IMAGE/g, `${row.directurl}`);
                      res.send(result);
                    });
                })
        } else {
            return res.status(404).send({ "status": 404, "message": "You need to provide a photo to search." })
        }
    })

    app.delete(`/delete/:id`, async (req, res) => {
            const header = req.get('secret');
        if(header === `${process.env.secret}`) {
            const filepath = `${__dirname}/frontend/uploads/${req.params.id}`

            if (fs.existsSync(filepath)) {
                fs.unlink(filepath, (err) => {
                    if(err) {
                        return res.status(500).send({ "status": 500, "error": err.message, "message": "Sorry, something went wrong when trying to delete that screenshot"})
                    } else {
                        db.run(`DELETE FROM screenshots WHERE title='${req.params.id}'`)
                        return res.send({ "status": 200, "message": `${req.params.id} was successfully deleted.`})
                    }
                })
                
            } else if (!fs.existsSync(filepath)) {
                return res.status(404).send({ "status": 404, "message": `Sorry, ${req.params.id} wasn't found on the server.`})
            }

        } else {
            return res.status(401).send({ "status": 401, "error": "Make sure you supplied an authorization error OR it's the correct one!" })
        }
    })

    if (!fs.existsSync(__dirname + `/.env`)) {
        console.log(chalk.redBright.bold(`.env doesn't exist in ${__dirname}! Create it using .env.sample!`))
        return process.exit(0)
    } else {
        app.listen(process.env.port, () => {
        console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
        \nNeed help? Let me know on the issues page!
        \nTo get started, read the readme and POST an image via ShareX!
        \nYour Settings: Domain: ${process.env.domain}, Port: ${process.env.port}
        \nScript now running on`, chalk.red(`${process.env.domain}/`, '\n--------------------------\n')));
        }); 
    }
