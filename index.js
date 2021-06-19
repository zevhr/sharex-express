////////////////////////////////////////////
//            An Awex Project             //
//         ShareX Custom Uploader         //
////////////////////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const chalk = require('chalk');
const http = require('http');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

// Grabs your domain from .env
const domain = process.env.domain;

// Grabs the protocol field from .env
const protocol = process.env.protocol;

// Spin up an Express application
const app = express();

// Use this stuff dammit!
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'))
// app.use(express.static(__dirname + '/uploads'));
app.use(fileUpload({
    createParentPath: true
}));

app.get('/', (req, res) => {
    return res.status(200).send(JSON.stringify({ "status": 200, "app-name": "your-name-here", "authentication": true }))
});

app.get('/:id', (req, res) => {
    return res.sendFile(__dirname + `/ss/${req.params.id}.html`);
})

// Now, to the fun stuff..

app.post('/post', (req, res) => {
    console.log(`URL will be served as`, process.env.protocol)
    if(req.query.secret === `${process.env.secret}`) {
        if (protocol === `https`) {
            try {
                if(!req.files) {
                    res.send(JSON.stringify({ "status": 500, "message": "No file detected." }))
                } else {
                    if(!fs.existsSync('./uploads/')) {
                        return res.status(404).send(JSON.stringify({ "status": 404, "message": "The uploads folder was not found in the root directory of this server."}))
                    } else if (!fs.existsSync('./ss/')) {
                        return res.status(404).send(JSON.stringify({ "status": 404, "message": "The ss folder was not found in the root directory."}))
                    }

                    let screenshot = req.files.sharex;
                    screenshot.mv('./uploads/' + screenshot.name);
                    let imgurl = `https://${domain}/uploads/${screenshot.name}`
                    let url = `https://${domain}/${screenshot.name}`
                    res.send(url);

                    var date = new Date();
                    let htmlContent = `<html> <head> <title>Screenshot from ${date}</title> <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" integrity="undefined" crossorigin="anonymous"> --> <link rel="stylesheet" href="https://awexxx.xyz/assets/css/bootstrap.css"> <link rel="stylesheet" href="https://awexxx.xyz/assets/css/screenshot.css"> <meta content="Awex's Screenshot from ${date}" property="og:title"> <meta content="${url}" property="og:url"> <meta content="${imgurl}" property="og:image"> <meta content="${process.env.embedcolor}" data-react-helmet="true" name="theme-color"> <link type="application/json+oembed" href="${process.env.oembed}" /> </head> <body> <div class="container"> <h3 style="text-align:center;">Screenshot from:<br> ${date}</h3> <br> <div class="jumbotron"> <div style="text-align:center;"> <img src="${imgurl}"> </div> </div> <h3><i>Star/fork this project on <a href="https://github.com/awexxx/sharex-express">GitHub!</a></i></h3> </div> </body> </html>`;
                    fs.writeFile(__dirname + `/ss/${screenshot.name}.html`, htmlContent, (error) => { console.log(chalk.redBright('Error writing file! (If there is nothing after this, it is a bug!)', error)) });
                }
            }
            catch(err) {
                res.status(500).send(err)
            }
        } else if (protocol === `http`) {
            try {
                if(!req.files) {
                    res.send(JSON.stringify({ "status": 500, "message": "No file detected." }))
                } else {
                    if(!fs.existsSync('./uploads/')) {
                        return res.status(404).send(JSON.stringify({ "status": 404, "message": "The uploads folder was not found in the root directory of this server."}))
                    } else if (!fs.existsSync('./ss/')) {
                        return res.status(404).send(JSON.stringify({ "status": 404, "message": "The ss folder was not found in the root directory."}))
                    }

                    let screenshot = req.files.sharex;
                    screenshot.mv('./uploads/' + screenshot.name);
                    let imgurl = `http://${domain}/uploads/${screenshot.name}`
                    let url = `http://${domain}/${screenshot.name}`
                    res.send(url);

                    var date = new Date();
                    let htmlContent = `<html> <head> <title>Screenshot from ${date}</title> <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css" integrity="undefined" crossorigin="anonymous"> --> <link rel="stylesheet" href="https://awexxx.xyz/assets/css/bootstrap.css"> <link rel="stylesheet" href="https://awexxx.xyz/assets/css/screenshot.css"> <meta content="Awex's Screenshot from ${date}" property="og:title"> <meta content="${url}" property="og:url"> <meta content="${imgurl}" property="og:image"> <meta content="${process.env.embedcolor}" data-react-helmet="true" name="theme-color"> <link type="application/json+oembed" href="${process.env.oembed}" /> </head> <body> <div class="container"> <h3 style="text-align:center;">Screenshot from:<br> ${date}</h3> <br> <div class="jumbotron"> <div style="text-align:center;"> <img src="${imgurl}"> </div> </div> <h3><i>Star/fork this project on <a href="https://github.com/awexxx/sharex-express">GitHub!</a></i></h3> </div> </body> </html>`;
                    fs.writeFile(__dirname + `/ss/${screenshot.name}.html`, htmlContent, (error) => { console.log(chalk.redBright('Error writing file! (If there is nothing after this, it is a bug!)', error)) });
                }
            }
            catch(err) {
                res.status(500).send(err)
            }
        }
    }
})

    // Now slightly less cool :(
    app.get('/uploads/:id', (req, res) => {
        res.sendFile(__dirname + `/uploads/${req.params.id}`);
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

const httpServer = http.createServer(app);
const PORT = 5000;
httpServer.listen(PORT, () => {
console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
\nNeed help? Let me know on the issues page or via my dev Discord (https://awexxx.xyz/discord)!
\nTo get started, read the readme and POST an image via ShareX!
\nYour Settings: Protocol: ${protocol}, Domain: ${domain}, Embed Color ${process.env.embedcolor}
\nScript now running on`, chalk.red(`http://localhost:${PORT}/`, '\n--------------------------\n')));
}); 