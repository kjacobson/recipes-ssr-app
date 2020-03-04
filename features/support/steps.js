const puppeteer = require('puppeteer')
const { Before, Given, When, Then, After } = require('cucumber')
const nock = require('nock')

const config = require('../../config.json')

const HEADLESS = process.env.HEADLESS !== "false"
const apiBaseUrl = config.api.protocol + '://' + config.api.host

Before(async function() {
    this.mock = nock(apiBaseUrl)
    this.browser = await puppeteer.launch({
        headless: HEADLESS,
        ignoreHTTPSErrors: true
    })
    this.page = await this.browser.newPage()
    await this.server
})

Given('A mocked {string} request to {string} responding with a {int} status and body:', async function(method, url, statusCode, response) {
    this.mock[method](url).delay(500).reply(statusCode, response)
})

Given(/^I am on the "(.*)" page$/, async function(pageName) {
    return await this.goToPage(pageName)
})

When('I enter the text {string} into the text field with the name {string}', async function(text, fieldName) {
    return await this.enterText(text, fieldName)
})

When('I press the button with text {string}', async function(buttonText) {
    return await this.pressButton(buttonText)
})

Then('I should be redirected to the {string} page', async function(pageName) {
    return await this.shouldBeOnPage(pageName)
})

Then('I should see an h1 with the text {string}', async function(text) {
    return await this.verifyElementText("h1", text)
})

After(async function() {
    await this.browser.close()
    await this.teardown()
    return
})
