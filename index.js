'use strict';

const path = require('path')
const fs = require('fs')
const https = require('https')
const fastify = require('fastify')
const axios = require('axios')
const helmet = require('fastify-helmet')
const rTracer = require('cls-rtracer')
const fastifySecureSession = require('fastify-secure-session')
const fastifyStatic = require('fastify-static')
const fastifyBody = require('fastify-formbody')

const config = require('./config.json')
const { requestToken, validateToken } = require('./auth/index')

const {
    head,
    footer,
    singleRecipe,
    showPage,
    importPage,
    loginPage,
    signupPage,
    importRecipeNav
} = require('./templates')
const extractRecipeData = require('./scrape')
const errors = require('./errors')

const cookieOptions = {
    path: '/',
    secure: true,
    httpOnly: true
}
const apiUrlBase = `${config.api_protocol}://${config.api_host}`

const app = fastify(
    {
        logger: true,
        ignoreTrailingSlash: true,
        https: {
            allowHTTP1: true,
            key: fs.readFileSync(__dirname + '/server.key'),
            cert: fs.readFileSync(__dirname + '/server.crt') 
        }
    }
)
app.register(helmet)
app.register(fastifySecureSession, {
    // adapt this to point to the directory where secret-key is located
    key: fs.readFileSync(path.join(__dirname, 'secret-key')),
    cookie: cookieOptions
})
if (process.env.NODE_ENV !== 'production') {
    app.register(fastifyStatic, {
        root: path.join(__dirname, 'static')
    })
}
app.register(fastifyBody)
// app.register(rTracer.fastifyMiddleware())


const authenticationMiddleware = (request, reply, next) => {
    const uuid = request.session.get('uuid')
    if (!uuid) {
        return reply.redirect(401, '/login')
    } else {
        request.uuid = uuid
        next()
    }
}
    

const getFlash = function(type) {
    let flash = this.session.get('flash')
    let ret

    if (flash && type) {
        ret = flash[type] || []
        delete flash[type]
        this.session.set('flash', flash)
    } else {
        ret = flash
        this.session.set('flash', {})
    }
    return ret
}

app.decorateRequest('setFlash', function(type='info', val) {
    const flash = this.session.get('flash') || {}
    flash[type] = flash[type] || []
    flash[type].push(val)
    this.session.set('flash', flash)
})
app.decorateRequest('getFlash', getFlash)
app.decorateReply('getFlash', getFlash)

const saveRecipe = async (url, title, json) => {
    return axios.post(apiUrlBase + '/recipes/', {
        url,
        title,
        json
    })
}

app.get('/recipes/', { preHandler: authenticationMiddleware }, (req, reply) => {
    reply.type('text/html')
    reply.res.write(head({
        lang: 'en',
        title: 'All recipes',
        h1: 'All recipes',
        nav: importRecipeNav()
    }))
    axios.get(`${apiUrlBase}/users/${req.uuid}/recipes?offset=0&count=20`).then(async (response) => {
        for (const recipe of response.data) {
            reply.res.write(await singleRecipe(recipe.id, recipe.json, true))
        }
        reply.res.write(footer())
        reply.sent = true
        reply.res.end()
    }, (err) => {
        console.error(err)
        reply.res.write(errors.UNKNOWN_ERROR)
        reply.sent = true
        reply.res.end()
    })
})

app.get('/recipes/:id', { preHandler: authenticationMiddleware }, (req, reply, params) => {
    reply.type('text/html')
    axios.get(`${apiUrlBase}/recipes/${req.params.id}/`).then(response => {
        const recipe = response.data
        reply.send(showPage(recipe))
    }, (err) => {
        reply.send(errors.UNKNOWN_ERROR)
    })
})

app.get('/recipes/import', { preHandler: authenticationMiddleware }, (req, reply) => {
    const errors = req.getFlash('error')

    reply.type('text/html')
    reply.send(
        importPage(errors)
    )
})

app.post('/recipes', { preHandler: authenticationMiddleware }, (req, reply) => {
    const { url } = req.body
    extractRecipeData(url)
        .then((recipe) => {
            const { json, parsedJson } = recipe
            return saveRecipe(url, parsedJson.name, json)
        })
        .then((response) => {
            if (response.data) {
                reply.redirect(303, '/recipes/' + response.data.id)
            } else {
                reply.send(errors.UNKNOWN_ERROR)
            }
        })
        .catch((err) => {
            req.setFlash('error', err)
            reply.redirect(303, '/recipes/import')
        })
})

app.get('/signup', (req, reply) => {
    reply.type('text/html')
    reply.send(signupPage())
})

app.post('/users', (req, reply) => {
    const { email } = req.body
    axios.post(apiUrlBase + '/users', {
        email
    }).then(response => {
        const uuid = response.data
        requestToken(uuid, email).then(token => {
            reply.send('Check your email')
        }, err => {
            console.error(err)
        })
    }, err => {
        console.error(err)
        req.setFlash('error', err)
        reply.redirect(303, '/signup')
    })
})

app.get('/login', (req, reply) => {
    reply.type('text/html')
    reply.send(loginPage())
})

app.post('/login', (req, reply) => {
    const { email } = req.body
    axios.get(apiUrlBase + '/users-by-email?email=' + email).then(response => {
        const uuid = response.data
        requestToken(uuid, email).then(token => {
            console.log(token)
            reply.send('Check your email')
        }, err => {
            console.error(err)
        })
    }, err => {

    })
})

app.get('/logout', (req, reply) => {
    req.session.delete()

    reply.redirect(303, '/login')
})

app.get('/verify', (req, reply) => {
    const token = req.query.token
    if (token) {
        validateToken(token, req.hostname).then((uuid) => {
            req.session.set('uuid', uuid)
            reply.redirect(303, '/recipes')
        }, err => {
            console.error(err)
            reply.code(401).type('text/html').send("That login link looks to be invalid")
        })
    } else {
        console.log("no token")
        reply.code(404).type('text/html').send("That login link looks to be invalid")
    }
})

app.listen(config.port, (error) => {
    if (error) {
        app.log.error(error)
        return process.exit(1)
    } else {
        app.log.info('Listening on port: ' + config.port + '.')
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
