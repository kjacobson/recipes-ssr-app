const {
  Worker, isMainThread, parentPort, workerData, SHARE_ENV
} = require('worker_threads');
const cheerio = require('cheerio')
const axios = require('axios')

const errors = require('./errors')


const isRecipe = (item) => {
    return item["@type"] === "Recipe"
}

const extractRecipe = (i, el) => {
    const json = JSON.parse(cheerio(el).html())

    if (Array.isArray(json)) {
        const recipes = json.filter(isRecipe)
        if (recipes.length) {
            return recipes[0]
        }
    } else
    if (isRecipe(json)) {
        return json
    }
    return null
}

const parse = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await axios.get(url, {
                headers : {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:72.0) Gecko/20100101 Firefox/72.0'
                }
            })
            const $ = cheerio.load(resp.data)
            const scripts = $('script[type*="ld+json"]')
            if (!scripts || !scripts.length) {
                return reject(errors.NO_RECIPE_DATA.message)
            }
            const recipes = scripts.map(extractRecipe).filter(r => r !== null)
            return recipes.length
                ? resolve(JSON.stringify(recipes[0]))
                : reject(errors.NO_RECIPE_DATA.message)
        }
        catch(err) {
            console.log(err)
            return reject(errors.FAILED_TO_FETCH.message)
        }
    })
}

const extractRecipeData = (url) => {
    const worker = new Worker(__filename, {
        workerData: url,
        env: SHARE_ENV
    })
    worker.stdout.on('data', console.log)
    return new Promise((resolve, reject) => {
        worker.on('message', (data) => {
            if (data.error) {
                return reject(data.message)
            }
            return resolve({
                json: data,
                parsedJson: JSON.parse(data)
            })
        })
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`))
            }
        })
    })
}

if (isMainThread) {
    module.exports = extractRecipeData
} else {
    if (process.env.NODE_ENV === 'test') {
        const nock = require('nock')

        nock('https://www.simplyrecipes.com').get('/recipes/chile_verde/')
            .replyWithFile(200, __dirname + '/features/mocks/mockrecipepage.html', {
                'Content-Type': 'text/html',
            })
        nock('https://cooking.nytimes.com').get('/recipes/1020083-creamy-white-bean-and-fennel-casserole')
            .replyWithFile(200, __dirname + '/features/mocks/mockrecipenojson.html', {
                'Content-Type': 'text/html',
            })

        nock('http://cooking.nytimes.com').get('/foo')
            .reply(404)
    }

    const url = workerData
    parse(url).then((recipeJson) => {
        parentPort.postMessage(recipeJson || { error: true, message: errors.NO_RECIPE_DATA.message})
    }, (err) => {
        parentPort.postMessage({ error: true, message: errors.NO_RECIPE_DATA.message})
    })
}

