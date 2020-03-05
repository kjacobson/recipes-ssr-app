const { Before, Given, When, Then, AfterAll } = require('cucumber')

const global = require('./global')
const mockUsers = require('../mocks/users')
const mockRecipes = require('../mocks/recipes')

const mockRequests = {
    "create recipe" : {
        post : {
            url : `/users/${mockUsers.userWithRecipes.id}/recipes/`,
            responseBody : {
                id: mockRecipes[1].id
            },
            statusCode : 201
        }
    },
    "recipe details" : {
        get : {
            url : `/recipes/${mockRecipes[1].id}/`,
            responseBody : mockRecipes[1],
            statusCode: 200
        }
    }
}
const mockTypes = {
    user : mockUsers,
    recipe : mockRecipes
}
const ordinals = {
    first : 0,
    second : 1,
    third : 2
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

Given('A mocked {string} request to {string} responding with a {int} status and body:', async function(method, url, statusCode, response) {
    this.mock[method](url).delay(500).reply(statusCode, response)
})

Given('A mocked {string} {string} request', async function(requestType, method) {
    const mock = mockRequests[requestType][method]
    this.mock[method](mock.url)
        .delay(500)
        .reply(mock.statusCode, mock.responseBody)
})

Given('A mocked recipe scrape request', async function() {
    this.nock('https://www.simplyrecipes.com').get('/recipes/chile_verde/')
        .replyWithFile(200, __dirname + '../mocks/mockrecipepage.html', {
            'Content-Type': 'text/html',
        })
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

Then('I should be redirected to the {string} page for the {string} {string}', async function(pageName, mockNumber, mockType) {
    const mock = mockTypes[mockType][ordinals[mockNumber]]
    const id = mock.id
    return await this.shouldBeOnPage(pageName, id)
})

Then('I should see an h1 with the text {string}', async function(text) {
    return await this.verifyElementText("h1", text)
})

AfterAll(async function() {
    const { browser, teardown, nock } = await global()
    await browser.close()
    await teardown()
})
