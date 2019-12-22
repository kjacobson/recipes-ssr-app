const fs = require('fs')
const cheerio = require('cheerio')
const axios = require('axios')
const db = require('./db.json')

const args = process.argv.slice(2)

const isRecipe = (i, el) => {
    const json = JSON.parse(cheerio(el).html())
    return json["@type"] === "Recipe"
}

const addRecipe = (i, el) => {
    const json = JSON.parse(cheerio(el).html())
    console.log(json)
    json.id = db.length;
    db.recipes.push(json)
}

const parse = async (url) => {
    const resp = await axios.get(url)
    const $ = cheerio.load(resp.data)
    const scripts = $('script[type*="ld+json"]')
    scripts.filter(isRecipe).map(addRecipe)
}

const init = async () => {
    for (const url of args) {
        await parse(url)
    }
    fs.writeFileSync('./db.json', JSON.stringify(db))
}

init()
