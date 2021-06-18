// Defining packages required for this app
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs = require('fs');
const morgan = require('morgan');
const _ = require('lodash');
const chalk = require('chalk');
const path = require('path');
require('dotenv').config()

// Grabs the domain from .env
const domain = process.env.domain

// Spinning up an express app
const app = express();

// App.use statements
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'))
app.use(fileUpload({
    createParentPath: true
}));
app.use(express.static(__dirname + '/uploads'));

app.get('/', (req, res) => {
    res.send(JSON.stringify({"status": "200 OK", "app-name": "awex.ss.serv", "authentication": true}))
});

app.post('/ss', (req, res) => {
    if(req.query.secret === `${process.env.secret}`) {
        try {
            if(!req.files) {
                res.send(JSON.stringify({ status: false, message: 'No file uploaded' }));
            } else {
                if (!fs.existsSync('./uploads/')) {
                    return res.status(404).send(JSON.stringify({ "status": 404, "message": "The /uploads/ folder doesn't exist in the scripts root directory!"}))
                }
                let screenshot = req.files.sharex;
                
                screenshot.mv('./uploads/' + screenshot.name);
    
                res.send(`${domain}/uploads/${screenshot.name}`);
            }
        } catch (err) {
            res.status(500).send(err);
        }
    } else if (!req.query.secret || !req.query.secret === `${process.env.secret}`) {
        return res.status(403).send(JSON.stringify({"status": 403, "message": "A token parameter wasn't specified OR it was incorrect."}))
    }
});

app.get('/uploads/:id', (req, res) => {
    res.sendFile(__dirname + `/uploads/${req.params.id}`);
})

const httpServer = http.createServer(app);

const PORT = 5000;

httpServer.listen(PORT, () => {
  console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
  \nNeed help? Let me know on the issues page or via my dev Discord (https://awexxx.xyz/discord)!
  \nTo get started, read the readme and POST an image via ShareX!
  \nScript now running on`, chalk.red(`http://localhost:${PORT}/`, '\n--------------------------\n')));
});  