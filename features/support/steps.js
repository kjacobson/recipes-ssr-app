const puppeteer = require('puppeteer')
const { Before, Given, When, Then } = require('cucumber')

const HEADLESS = process.env.HEADLESS !== "false"

Before(async function() {
    this.browser = await puppeteer.launch({
        headless: HEADLESS,
        ignoreHTTPSErrors: true
    })
    this.page = await this.browser.newPage()
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
