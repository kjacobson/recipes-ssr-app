const nock = require('nock')
const puppeteer = require('puppeteer')

const server = require('../../index')
const config = require('../../config.js')

const HEADLESS = process.env.HEADLESS !== "false"
const apiBaseUrl = config.api.protocol + '://' + config.api.host

let initialized = false
let _mock
let _browser
let _page
let _server

module.exports = async () => {
    if (!initialized) {
        _server = await server.start()
        _mock = nock(apiBaseUrl)
        _browser = await puppeteer.launch({
            headless: HEADLESS,
            ignoreHTTPSErrors: true
        })
        _page = await _browser.newPage()

        initialized = true
    }
    return {
        nock : nock,
        mock : _mock,
        browser : _browser,
        page : _page,
        server : _server,
        teardown : server.teardown
    } 
}
