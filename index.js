////////////////////////////////////////////////////////////////
//   __  .__    .__         .__                               //
// _/  |_|  |__ |__| ______ |__| ______ ______   ____   ____  //
// \   __\  |  \|  |/  ___/ |  |/  ___/ \____ \ /  _ \ / ___\ //
//  |  | |   Y  \  |\___ \  |  |\___ \  |  |_> >  <_> ) /_/  >//
//  |__| |___|  /__/____  > |__/____  > |   __/ \____/\___  / //
//            \/        \/          \/  |__|         /_____/  //
////////////////////////////////////////////////////////////////

const express = require('express');
const upload = require('express-fileupload');
const path = require('path');
const chalk = require('chalk');
const cron = require('node-cron');
const fs = require('fs');
const db = require('./app/utils/db');
const { frontend, appc } = require('./config.json');

require('./app/utils/db');
const app = express();

// view configuration
app.set('views', path.resolve(__dirname, "app/views"));
app.set('view engine', 'ejs');

// middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(express.static(path.resolve(__dirname, "app/static")));
app.use(upload({
    createParentPath: true
}));

// routes
app.use('/api', require('./app/utils/api'));
app.use('/', require('./app/utils/intake'));

if (!frontend || !appc) {
    console.log(`Uh oh! You didn't properly configure the app. Check config.json!`) 
    process.exit(0);
} 

if (appc.expiry) {
    cron.schedule('* 12 * * *', async () => {
        var d = await db.query("SELECT * FROM content WHERE expiresAt < ?", [new Date().getTime()]);
        if (d.length != 0) {
            d.forEach(function(file) {
                var filePath = path.resolve(__dirname, 'app/static/uploads', file.type, file.title)
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                db.query("DELETE FROM content WHERE title=?", [file.title]);
            })
        }
    });
}

// default route
app.get('/', (req, res) => {
    if(frontend.redirect === false || !frontend.redirect) {
        return res.send({ "status": 200, "message": "ShareX-Express is running successfully!" })
    } else {
        return res.redirect(frontend.redirect)
    }
})

app.get('*', async (req, res) => {
    return res.render('404', { filename: null, settings: frontend });
})

app.listen(appc.port, () => {
    console.log(chalk.red`\n--------------------------`, chalk.green.bold(`\nAwex's ShareX Express Script -- Welcome!
    \nNeed help? Let me know on the issues page!
    \nTo get started, read the readme and POST an image via ShareX!
    \nYour Settings: Domain: ${frontend.domain}, Port: ${appc.port}`,
    '\n--------------------------\n'));
})