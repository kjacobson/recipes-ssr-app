const assert = require('assert')
const { setWorldConstructor } = require('cucumber')

const config = require('../../config')

const URL_MAP = {
    home : "/",
    signup : "/signup",
    login : "/login",
    logout : "/logout",
    recipes : "/recipes",
    "check email" : "/login-pending",
    "import recipe" : "/recipes/import"
}

const urlFromName = (pageName) => {
    const protocol = config.use_ssl ? 'https://' : 'http://'
    const host = config.host

    return protocol + host + URL_MAP[pageName]
}

class World {

    async setSessionCookie(val) {
        await this.page.setCookie({
            name: 'session',
            value: val,
            secure: true,
            httpOnly: true,
            path: '/',
            domain: 'localhost'
        })
    }

    async goToPage(pageName) {
        await this.page.goto(urlFromName(pageName));
    }

    async enterText(text, fieldName) {
        await this.page.waitForSelector(`input[name="${fieldName}"]`)
        await this.page.type(`input[name="${fieldName}"]`, text)
    }

    async pressButton(text) {
        const [button] = await this.page.$x(`//button[contains(., '${text}')]`)
        await button.click()
    }

    async shouldBeOnPage(pageName) {
        await this.page.waitForNavigation()
        assert.equal(await this.page.url(), urlFromName(pageName))
    }

    async verifyElementText(selector, text) {
        await this.page.waitForSelector(selector)
        const element = await this.page.$(selector)
        const textContent = await this.page.evaluate(element => element.textContent, element)
        assert.equal(textContent, text)
    }

}

setWorldConstructor(World)
