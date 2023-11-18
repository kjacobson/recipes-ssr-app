const nodemailer = require("nodemailer")

const config = require("../config.js")
const emailTemplate = require("./emailtemplate")

let transporter

const init = async () => {
    if (config.smtp.useNodeMailer) {
        const testAccount = await nodemailer.createTestAccount()
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        })
    } else {
        const transportConfig = {
            name: 'www.recipegrab.com',
            host: config.smtp.host,
            port: config.smtp.port,
            secure: (config.smtp.port === 465),
            secureConnection: (config.smtp.port === 465),
            auth: {
                user: config.smtp.user,
                pass: config.smtp.password
            },
            logger: true,
            debug: true,
        }
        console.log("Initializing email transport with config:", transportConfig)
        transporter = nodemailer.createTransport(transportConfig)
    }
}

const emailContents = (email, token) => {
    const url  = `${config.protocol}://${config.external_host}${config.external_port ? `:${config.external_port}` : ''}/verify?token=${token}`
    console.debug("Login URL:", url)
    return emailTemplate(url)
}

const sendEmail = (email, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const info = await transporter.sendMail({
                from: '"Recipe Grab" <logins@recipegrab.com>',
                to: email,
                subject: "Your one-time login link",
                html: emailContents(email, token)
            })

            console.log("Message sent: %s", info.messageId)

            if (config.smtp.useNodeMailer) {
                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
            }
            return resolve()
        }
        catch(err) {
            console.error("Something went wrong sending an email", err)
            return reject(err)
        }
    })
}

init()

module.exports = sendEmail
