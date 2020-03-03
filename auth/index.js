const jwt = require('jsonwebtoken')

const config = require('../config.json')
const sendEmail = require('./mail')

const loginSecretKey = config.auth_secret

const jwtOptions = {
    issuer: config.host,
    audience: config.host,
    algorithm: 'HS256',
    expiresIn: '15m',
}

const generateToken = (uuid) => {
    return new Promise((resolve, reject) => {
        return jwt.sign(
            { sub: uuid },
            loginSecretKey,
            jwtOptions,
            (err, token) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(token)
                }
            },
        )
    })
}

const requestToken = (uuid, email) => {
    let authToken
    return new Promise((resolve, reject) => {
        generateToken(uuid, email).then((token) => {
            authToken = token
            return sendEmail(email, token)
        }, reject)
        .then(() => {
            return resolve(authToken)
        }, reject)
    })
}

const validateToken = (token, host) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, loginSecretKey, { issuer: host }, (err, decoded) => {
            if (err) {
                return reject(err)
            }
            return resolve(decoded.sub)
        })
    })
}

module.exports = { requestToken, validateToken }
