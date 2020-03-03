const nodemailer = require("nodemailer")

const config = require("../config.json")
const emailTemplate = require("./emailtemplate")

let transporter

const init = async () => {
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    })
}

const emailContents = (email, token) => {
    const url  = `https://${config.host}/verify?token=${token}`
    
    return emailTemplate(url)
}

const sendEmail = (email, token) => {
    return new Promise(async (resolve, reject) => {
        try {
            const info = await transporter.sendMail({
                from: '"Recipe Grab" <login@recipegrab.com>',
                to: email,
                subject: "Your one-time login link",
                html: emailContents(email, token)
            })

            console.log("Message sent: %s", info.messageId)
            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
            return resolve()
        }
        catch(err) {
            return reject(err)
        }
    })
}

init()

module.exports = sendEmail
