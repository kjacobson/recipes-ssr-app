const { Before, Given, When, Then, AfterAll } = require('cucumber')

const global = require('./global')

Before(async function() {
    const { mock, browser, page, server, teardown } = await global()
    this.mock = mock
    this.browser = browser
    this.page = page
    this.server = server
    this.teardown = teardown
})

Given('I am a logged-in user', async function() {
    // must be on an actual page to set a cookie
    await this.goToPage('login')
    this.setSessionCookie('j2%2Bx6trIMGGf7FCV72HBlTIs9FjarHGQtl0ZQtMr8DLzGxkOIo5CT1GCHdnLV46KlWAzstJjUQQ1argoSmHwW2jVoqRERW9B%2F%2FE%3D%3BC8DFBG9nyFLNy7pJ0NmSkxkg67lzQ1tN')
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

AfterAll(async function() {
    const { browser, teardown } = await global()
    await browser.close()
    await teardown()
    return
})
