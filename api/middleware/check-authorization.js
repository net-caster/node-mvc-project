const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.get('Authorization') || req.cookies.access_token;

    if (!token) {
        const error = new Error("Authorization failed");
        error.statusCode = 401;
        console.log(error);
        res.redirect('/login');
        throw error;
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
        err.statusCode = 500;
        console.log(err);
        res.redirect('/login');
        throw err;
    }
    if (!decodedToken) {
        const error = new Error("Authorization failed");
        error.statusCode = 401;
        console.log(error);
        res.redirect('/login');
        throw error;
    }
    console.log(decodedToken.exp);
    req.userId = decodedToken.userId;
    next();
};