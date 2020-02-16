const {
  Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
const cheerio = require('cheerio')
const axios = require('axios')
const db = require('./db.js')

const isRecipe = (i, el) => {
    const json = JSON.parse(cheerio(el).html())
    return json["@type"] === "Recipe"
}

const saveRecipe = async (json) => {
    const parsed = JSON.parse(json)
    const recipes = await db('recipes').insert({
        title: parsed.name,
        json: json
    }, ['id'])
    return recipes[0].id
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
                : reject("No recipe found")
        }
        catch(err) {
            reject(err)
        }
    })
}


const parseUrl = (url) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
            workerData: url
        })
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`))
            }
        })
    })
}
const addRecipe = async (url) => {
    let recipe
    try {
        recipe = await parseUrl(url)
    }
    catch(err) {
        debugger
        return false
    }
    try {
        const recipeId = await saveRecipe(recipe)
        return recipeId
    }
    catch(err) {
        debugger
        return false
    }
}


if (isMainThread) {
    module.exports = addRecipe
} else {
    const url = workerData
    parse(url).then((recipeJson) => {
        if (recipeJson) {
            parentPort.postMessage(recipeJson)
        } else {
            throw new Error('No recipe found in structured data')
        }
    }, (err) => {
        throw new Error(err)
    })
}

