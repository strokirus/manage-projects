const jwt = require('jsonwebtoken');
const AUTH = require('../config/auth.json');

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(401).json({ message: 'No token provided' });
        return false;
    }

    const parts = authorization.split(' ');

    if (!parts.length === 2) {
        res.status(401).json({ message: 'No token provided' });
        return false;
    }

    const [ scheme, token ] = parts;

    if (!scheme.startsWith('Bearer')) {
        res.status(401).json({ message: 'Token malformatted' });
        return false;
    }

    jwt.verify(token, AUTH.secret, (err, decoded) => {
        if (err) {
            res.status(401).json({ message: 'Invalid token' });
            return false;
        }

        req.email = decoded.email;

        return next();
    });

    return true;
};

const generateToken = (param, expiresIn = 86400) => (
    jwt.sign(param,
        AUTH.secret, {
        expiresIn,
    })
);

module.exports = {
    generateToken,
    authMiddleware,
}
