const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
const cheerio = require('cheerio')
const axios = require('axios')

const errors = require('./errors')


const isRecipe = (i, el) => {
    const json = JSON.parse(cheerio(el).html())
    return json["@type"] === "Recipe"
}

const parse = (url) => {
    return new Promise(async (resolve, reject) => {
        try {
            const resp = await axios.get(url)
            const $ = cheerio.load(resp.data)
            const scripts = $('script[type*="ld+json"]')
            const firstRecipe = scripts.filter(isRecipe)[0]
            return firstRecipe
                ? resolve(cheerio(firstRecipe).html())
                : reject(errors.NO_RECIPE_DATA)
        }
        catch(err) {
            return reject(errors.UNKNOWN_ERROR)
        }
    })
}

const extractRecipeData = (url) => {
    const worker = new Worker(__filename, {
        workerData: url
    })
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

