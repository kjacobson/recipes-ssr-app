const {
  Worker, isMainThread, parentPort, workerData
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
            const recipes = scripts.map(extractRecipe).filter(r => r !== null)
            return recipes.length
                ? resolve(JSON.stringify(recipes[0]))
                : reject(errors.NO_RECIPE_DATA)
        }
        catch(err) {
            console.log(err)
            return reject(errors.UNKNOWN_ERROR)
        }
    })
}

const extractRecipeData = (url) => {
    const worker = new Worker(__filename, {
        workerData: url
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
    const url = workerData
    parse(url).then((recipeJson) => {
        parentPort.postMessage(recipeJson || { error: true, message: errors.NO_RECIPE_DATA})
    }, (err) => {
        parentPort.postMessage({ error: true, message: errors.NO_RECIPE_DATA})
    })
}

