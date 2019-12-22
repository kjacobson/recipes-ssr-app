'use strict';

const path = require('path')
const fs = require('fs')
const https = require('https')
const zlip = require('zlib')
const fastify = require('fastify')
const helmet = require('fastify-helmet')
const fastifyStatic = require('fastify-static')
const uuid = require('uuid/v1')
const axios = require('axios')

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

// for streaming gzip; likely not performant. TODO: test
const initStream = (res) => {
    const stream = zlib.createGzip()
    stream._flush = zlib.Z_SYNC_FLUSH
    stream.pipe(res)
    return stream
}

const htmlEscape = (str='') => {
    return str.replace(/&/g, '&amp;')
        .replace(/>/g, '&gt;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/`/g, '&#96;')
}

const htmlTagger = (strings, values) => {
    const raw = strings.raw

    let result = ''

    values.forEach((val, i) => {
        let lit = raw[i]
        if (Array.isArray(val)) {
            val = val.join('')
        }
        if (lit.endsWith('!')) {
            val = htmlEscape(val)
            lit = lit.slice(0, -1)
        }
        result += lit
        result += val
    })
    result += raw[raw.length-1]
    return result
}

const H = (strings, ...values) => {
    return htmlTagger(strings, values)
}

const asyncH = async (strings, ...values) => {
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            resolve(
                htmlTagger(strings, values)
            )
        })
    })
}

const head = (lang, title) => {
    return H`
        <!doctype html>
        <html lang="${lang}">
            <head>
                <meta charset="utf-8">
                <title>!${title}</title>
                <meta name="description" content="">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="preload" href="index.css" as="style">
                <link rel="stylesheet" href="index.css">
            </head>
            <body>
                <main>
    `
}

const footer = () => {
    return H`</main></body></html>`
}

const ingredient = (ingredient) => {
    return H`<li>!${ingredient}</li>`
}

const ingredientList = (ingredients) => {
    return H`<ul>
        ${ ingredients.map(ingredient) }
    </ul>`
}

const instructionItem = (instruction) => {
    if (instruction.name) { debugger }
    return instruction.name && instruction.itemListElement
        ? H`<h3>!${instruction.name}:</h3>${instruction.itemListElement.map(instructionItem)}`
        : H`<li>!${instruction.text}</li>`;
}

const singleRecipe = (recipe) => {
    return asyncH`
        <article>
            <h1>!${(recipe.name || '')}</h1>
            <strong>!${recipe.author ? recipe.author.name : ''}</strong>

            <p>!${recipe.description || ''}</p>

            <h2>Ingredients:</h2>
            ${recipe.recipeIngredient 
                ? ingredientList(recipe.recipeIngredient)
                : ''
            }

            <h2>Instructions:</h2>
            <ol>
                ${recipe.recipeInstructions ? recipe.recipeInstructions.map(instructionItem) : ''}
            </ol>
        </article>
    `
}

const show = (recipe) => {
    return H`${singleRecipe(recipe)}`
}

app.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/html; charset=UTF-8')
    reply.res.write(head('en', 'All the recipes') + '<h1>All recipes</h1>')
    axios('http://localhost:3004/recipes/').then(async (response) => {
        for (const recipe of response.data) {
            reply.res.write(await singleRecipe(recipe))
        }
        reply.res.write(footer())
        reply.sent = true
        reply.res.end()
    })
})

app.get('/recipes/:id', (req, reply, params) => {
    reply.header('Content-Type', 'text/html; charset=UTF-8')
    axios('http://localhost:3004/recipes/7/').then((response) => {
        reply.res.write(head('en', response.data.name))
        reply.res.write(show(response.data))
        reply.res.write(footer())
        reply.sent = true
        reply.res.end()
    })
})

app.listen(port, (error) => {
    if (error) {
        app.log.error(error)
        return process.exit(1)
    } else {
        app.log.info('Listening on port: ' + port + '.')
    }

    process.on('SIGINT', () => {
        /**
         * We might see this signal in prod if pm2 restarts a process
         * due to high memory usage, but we'll rely on other monitoring
         * for this.
         *
         * If a process fails we won't see this.
         */
        app.log.info('SIGINT')
        teardown()
    })
    process.on('SIGTERM', () => {
        app.log.info('SIGTERM')
        teardown()
    })
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
