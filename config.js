const env = process.env.NODE_ENV || 'development'

module.exports = {
    port : process.env.PORT || 3002,
    host : process.env.HOST || "localhost",
    // we need to make sure the JWT is issued from the hostname
    // used to access the site in the browser
    external_port: process.env.EXTERNAL_PORT || 3002,
    external_host: process.env.EXTERNAL_HOST || "localhost",
    protocol: process.env.PROTOC0L || 'http',
    api : {
        host: process.env.API_HOST || "localhost",
        port: process.env.API_PORT || "3004",
        protocol: process.env.API_PROTOCOL || "http"
    },
    smtp : {
        host: process.env.SMTP_HOST || "email-smtp.us-west-2.amazonaws.com",
        port: process.env.SMTP_PORT || 465,
        user: process.env.SMTP_USER || "AKIARL32ID2A5OLQAD4G",
        password: process.env.SMTP_PASS || "BJBGih+bz6xUCUE8WVIyDZJSeLlJpqU4XvYQzX5luBIX",
        useNodeMailer: process.env.USE_NODE_MAILER || true
    },
    auth_secret: "0zCxCtaQ69nbCZCZJvg+6uKkqVpxKIwkB3fsHyL2Jso4yymHacPNhJw2ICQuY47ntjtSHrE2DvTcxILvu9Dw1ESyLmRHVmklJ8AxdpfM1uM7ZhFOXkLUOJ+dgrT0u0mQnTzqrA2CN9tnZxR6boQq3QOYpjUx1D0+s19PIpc4mgXTwe02wI5LuTeEDMHGCYha0mcP8rzEV4guD3sBbqM3jtm8/w8rvjWPdqb8bcGHnCWfCvdcKj4Vi0CNIJYc/yYqEdn1IMbbC7hdU9uOf0b+B4fzIr9fPGIJDxpb5at1AdTgdu/R6O6sdFPC9UhdobiADmw9LQyuHwNVR3zNOE0bDA==",
    cookie_secret_loc : "./secret-key",
    isProd : env === 'production' || env === 'staging',
    isDev : env === 'development' || env === 'test'
};
