const { setWorldConstructor } = require('cucumber')

const config = require('../../config')

const URL_MAP = {
    home : "/",
    signup : "/signup",
    login : "/login",
    logout : "/logout",
    recipes : "/recipes"
}

const urlFromName = (pageName) => {
    const protocol = config.use_ssl ? 'https://' : 'http://'
    const host = config.host

    return protocol + host + URL_MAP[pageName]
}

class World {
    async startup() {
        this.browser = await puppeteer.launch({ headless: HEADLESS })
        this.page = await this.browser.newPage()
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

    async verifyText(text, select) {

    }
}

setWorldConstructor(World)
