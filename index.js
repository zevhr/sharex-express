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
app.use(express.static(__dirname + '/uploads'));
app.use(fileUpload({
    createParentPath: true
}));

app.get('/', (req, res) => {
    return res.status(200).send(JSON.stringify({ "status": 200, "app-name": "your-name-here", "authentication": true }))
});

// Now, to the fun stuff..

app.post('/ss', (req, res) => {
    console.log(`URL will be served as`, process.env.protocol)
    if(req.query.secret === `${process.env.secret}`) {
        if (protocol === `https`) {
            try {
                if(!req.files) {
                    res.send(JSON.stringify({ "status": 500, "message": "No file detected." }))
                } else {
                    if(!fs.existsSync('./uploads/')) {
                        return res.status(404).send(JSON.stringify({ "status": 404, "message": "The uploads folder was not found in the root directory of this server."}))
                    }

                    let screenshot = req.files.sharex;
                    screenshot.mv('./uploads/' + screenshot.name);
                    res.send(`https://${domain}/uploads/${screenshot.name}`);
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
                    }

                    let screenshot = req.files.sharex;
                    screenshot.mv('./uploads/' + screenshot.name);
                    res.send(`http://${domain}/uploads/${screenshot.name}`);
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


const httpServer = http.createServer(app);
const PORT = process.env.port;
httpServer.listen(PORT, () => {
console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
\nNeed help? Let me know on the issues page or via my dev Discord (https://awexxx.xyz/discord)!
\nTo get started, read the readme and POST an image via ShareX!
\n Your Settings:
\n Protocol: ${protocol}
\n Domain: ${domain}
\nScript now running on`, chalk.red(`http://localhost:${PORT}/`, '\n--------------------------\n')));
}); 