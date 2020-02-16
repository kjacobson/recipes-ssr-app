'use strict';

const path = require('path')
const fs = require('fs')
const https = require('https')
const zlip = require('zlib')
const fastify = require('fastify')
const helmet = require('fastify-helmet')
const fastifyStatic = require('fastify-static')
const fastifyBody = require('fastify-formbody')
const uuid = require('uuid/v1')
const axios = require('axios')
const cheerio = require('cheerio')

const { head, footer, singleRecipe, showPage, importPage } = require('./templates')
const addRecipe = require('./scrape')
const db = require('./db.js')

const port = 3002

const app = fastify(
    {
        logger: true,
        // http2: true,
        https: {
            allowHTTP1: true,
            key: fs.readFileSync(__dirname + '/server.key'),
            cert: fs.readFileSync(__dirname + '/server.crt')
        }
    }
)
app.register(helmet)
// no compession middleware.
// would rather stream HTML than compress HTML
// and streaming + compression is likely slow
// CSS and JS should come gzipped from CDNs
// app.register((req, res, next) => {
//     httpContext.set('url', req.original_url)
//     httpContext.set('request_id', uuid())
//     httpContext.set('method', req.method)
//     next()
// })
app.register(fastifyStatic, {
    root: path.join(__dirname, 'static')
})
app.register(fastifyBody)

// for streaming gzip; likely not performant. TODO: test
const initStream = (res) => {
    const stream = zlib.createGzip()
    stream._flush = zlib.Z_SYNC_FLUSH
    stream.pipe(res)
    return stream
}


app.get('/', async (req, reply) => {
    reply.type('text/html')
    reply.res.write(head('en', 'All the recipes') + '<h1>All recipes</h1>')
    db('recipes').offset(0).limit(20).then(async (response) => {
        for (const recipe of response) {
            reply.res.write(await singleRecipe(recipe.json, true))
        }
        reply.res.write(footer())
        reply.sent = true
        reply.res.end()
    })
})

app.get('/recipes/:id', async (req, reply, params) => {
    reply.type('text/html')
    const response = await db.from('recipes').where('id', req.params.id)
    const recipe = response[0].json
    return showPage(recipe)
})

app.get('/recipes/import', (req, reply) => {
    reply.type('text/html')
    reply.send(importPage())
})

app.post('/recipes', async (req, reply) => {
    const { url } = req.body
    try {
        const recipeId = await addRecipe(url)
        reply.redirect('/recipes/' + recipeId)
    }
    catch(err) {
        reply.send('Error')
    }
})

app.listen(port, (error) => {
    if (error) {
        app.log.error(error)
        return process.exit(1)
    } else {
        app.log.info('Listening on port: ' + port + '.')
    }

//     process.on('SIGINT', () => {
//         /**
//          * We might see this signal in prod if pm2 restarts a process
//          * due to high memory usage, but we'll rely on other monitoring
//          * for this.
//          *
//          * If a process fails we won't see this.
//          */
//         app.log.info('SIGINT')
//         teardown()
//     })
//     process.on('SIGTERM', () => {
//         app.log.info('SIGTERM')
//         teardown()
//     })
})

const teardown = () => {
    app.log.info('Tearing down server')
    const logger = app.log
    app.close().then(() => {
        console.info('Successfully closed server connection')
    }, (err) => {
        console.error('Error closing server connection')
        process.exit(1)
    })
}
