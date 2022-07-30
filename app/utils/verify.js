const { secret } = require('../../config.json');
module.exports = async (req, res, next) => {
    const header = req.get('secret');
    if(!header || header !== secret) {
        return res.status(401).send({ "status": 401, "message": "The secret wasn't supplied or was incorrect."})
    } else next();
}