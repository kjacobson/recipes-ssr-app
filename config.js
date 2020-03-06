const env = process.env.NODE_ENV || 'development'

const config = require(`./config/${env}.json`)


module.exports = Object.assign({}, config, {
    isProd : env === 'production' || env === 'staging',
    isDev : env === 'development' || env === 'test'
})
