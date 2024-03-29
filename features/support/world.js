const expect = require('chai').expect
const { setWorldConstructor } = require('cucumber')

const config = require('../../config.js')

const URL_MAP = {
    home : "/",
    signup : "/signup",
    login : "/login",
    logout : "/logout",
    recipes : "/recipes",
    "check email" : "/login-pending",
    "import recipe" : "/recipes/import",
    "recipe details" : (recipeId) => {
        return `/recipes/${recipeId}`
    }
}

const urlFromName = (pageName, id) => {
    const protocol = config.use_ssl ? 'https://' : 'http://'
    const host = config.host
    const port = config.port !== undefined ? `:${config.port}` : ''
    let path = URL_MAP[pageName]
    if (typeof path === "function") {
        path = path(id)
    }

    return protocol + host + port + path
}

class World {

    async setSessionCookie(val) {
        return await this.page.setCookie({
            name: 'session',
            value: val,
            secure: true,
            httpOnly: true,
            path: '/',
            domain: 'localhost'
        })
    }

    async goToPage(pageName, id) {
        return await this.page.goto(urlFromName(pageName, id));
    }

    async enterText(text, fieldName) {
        await this.page.waitForSelector(`input[name="${fieldName}"]`)
        return await this.page.type(`input[name="${fieldName}"]`, text)
    }

    async pressButton(text) {
        const [button] = await this.page.$x(`//button[contains(., '${text}')]`)
        return await button.click()
    }

    async shouldBeOnPage(pageName, id) {
        await this.page.waitForNavigation()
        return expect(urlFromName(pageName, id)).equal(await this.page.url())
    }

    async verifyElementText(selector, text) {
        await this.page.waitForSelector(selector)
        const element = await this.page.$(selector)
        const textContent = await this.page.evaluate(element => element.textContent, element)
        return expect(textContent.trim()).to.contain(text)
    }

    async verifyFormFieldValidity(fieldName, validity) {
        await this.page.waitForSelector(`input[name="${fieldName}"]:${validity}`)
    }

}

setWorldConstructor(World)
