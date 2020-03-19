const { Before, Given, When, Then, AfterAll } = require('cucumber')

const global = require('./global')
const mockUsers = require('../mocks/users')
const mocks = require('../mocks/')

const mockRequests = {
    get : (mockName) => {
        const mock = mocks[mockName]
        return {
            url : `/recipes/${mock.id}/`,
            responseBody : mock,
            statusCode: 200
        }
    }
}

Before(async function() {
    const { nock, mock, browser, page, server, teardown } = await global()
    this.nock = nock
    this.mock = mock
    this.browser = browser
    this.page = page
    this.server = server
    this.teardown = teardown
})

Given('I am a logged-in user', async function() {
    // must be on an actual page to set a cookie
    await this.goToPage('login')
    return await this.setSessionCookie(mockUsers.userWithRecipes.session_cookie)
})

Given('a mocked {string} request to {string} responding with a {int} status and body:', async function(method, url, statusCode, response) {
    this.mock[method](url).delay(200).reply(statusCode, response)
})

Given('a mocked {string} request to {string} responding with a {int} status', async function(method, url, statusCode) {
    this.mock[method](url).delay(200).reply(statusCode)
})

Given('a mocked create recipe POST request', async function() {
    this.mock.post(`/users/${mockUsers.userWithRecipes.id}/recipes/`)
        .delay(200)
        .reply(201, {
            id: mocks["scraped recipe"].id
        })
})

Given('a mocked {string} request for the {string}', async function(method, mockName) {
    const mock = mockRequests[method](mockName)
    this.mock[method](mock.url)
        .delay(200)
        .reply(mock.statusCode, mock.responseBody)
})

Given('a mocked recipe scrape request', async function() {
    this.nock('https://www.simplyrecipes.com').get('/recipes/chile_verde/')
        .replyWithFile(200, __dirname + '/../mocks/mockrecipepage.html', {
            'Content-Type': 'text/html',
        })
})

Given('a mocked failed recipe scrape request', async function() {
    this.nock('https://cooking.nytimes.com').get('/recipes/1020083-creamy-white-bean-and-fennel-casserole')
        .replyWithFile(200, __dirname + '/../mocks/mockrecipenojson.html', {
            'Content-Type': 'text/html',
        })
})

Given('a mocked request for an external page that can\'t be found', async function() {
    this.nock('http://cooking.nytimes.com').get('/foo')
        .reply(404)
})

Given(/^I am on the "(.*)" page$/, async function(pageName) {
    return await this.goToPage(pageName)
})

When('I navigate to the {string} {string} details page', async function(pageType, id) {
    return await this.goToPage(pageType + " details", id)
})

When('I enter the text {string} into the text field with the name {string}', async function(text, fieldName) {
    return await this.enterText(text, fieldName)
})

When('I press the button with text {string}', async function(buttonText) {
    return await this.pressButton(buttonText)
})

Then('I should be on/redirected to the {string} page', async function(pageName) {
    return await this.shouldBeOnPage(pageName)
})

Then('I should be on/redirected to the {string} page for the {string}', async function(pageName, mockName) {
    const mock = mocks[mockName]
    const id = mock.id
    return await this.shouldBeOnPage(pageName, id)
})

Then('I should see an h1 with the text {string}', async function(text) {
    return await this.verifyElementText("h1", text)
})

Then('I should see the text {string} inside the element matching selector {string}', async function(text, selector) {
    return await this.verifyElementText(selector, text)
})

Then('the field with the name {string} should be in a {string} state', async function(fieldName, validity) {
    return await this.verifyFormFieldValidity(fieldName, validity)
})

AfterAll(async function() {
    const { browser, teardown, nock } = await global()
    await browser.close()
    await teardown()
})
