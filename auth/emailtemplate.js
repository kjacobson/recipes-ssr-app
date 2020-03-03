module.exports = (url) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <title>Your unique, one-time login link</title>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <style type="text/css">
                /* CLIENT-SPECIFIC STYLES */
                body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                img { -ms-interpolation-mode: bicubic; }

                /* RESET STYLES */
                img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                table { border-collapse: collapse !important; }
                body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

                /* iOS BLUE LINKS */
                a[x-apple-data-detectors] {
                    color: inherit !important;
                    text-decoration: none !important;
                    font-size: inherit !important;
                    font-family: inherit !important;
                    font-weight: inherit !important;
                    line-height: inherit !important;
                }

                /* GMAIL BLUE LINKS */
                u + #body a {
                    color: inherit;
                    text-decoration: none;
                    font-size: inherit;
                    font-family: inherit;
                    font-weight: inherit;
                    line-height: inherit;
                }

                /* SAMSUNG MAIL BLUE LINKS */
                #MessageViewBody a {
                    color: inherit;
                    text-decoration: none;
                    font-size: inherit;
                    font-family: inherit;
                    font-weight: inherit;
                    line-height: inherit;
                }

                /* These rules set the link and hover states, making it clear that links are, in fact, links. */
                /* Embrace established conventions like underlines on links to keep emails accessible. */
                a { color: #B200FD; font-weight: 600; text-decoration: underline; }
                a:hover { color: #1a1a1a !important; text-decoration: none !important; }

                /* These rules adjust styles for desktop devices, keeping the email responsive for users. */
                /* Some email clients don't properly apply media query-based styles, which is why we go mobile-first. */
                @media screen and (min-width:600px) {
                    h1 { font-size: 48px !important; line-height: 48px !important; }
                    .intro { font-size: 24px !important; line-height: 36px !important; }
                }
            </style>
          </head>
          <body style="margin: 0 !important; padding: 0 !important;">
            <!-- This ghost table is used to constrain the width in Outlook. The role attribute is set to presentation to prevent it from being read by screenreaders. -->
            <!--[if (gte mso 9)|(IE)]>
            <table cellspacing="0" cellpadding="0" border="0" width="720" align="center" role="presentation"><tr><td>
            <![endif]-->
            <div role="article" aria-label="An email from Your Brand Name" lang="en" style="background-color: white; color: #2b2b2b; font-family: Georgia, serif; font-size: 18px; font-weight: 400; line-height: 28px; margin: 0 auto; max-width: 720px; padding: 40px 20px 40px 20px;">
                
                <header>
                    <h1 style="color: #1a1a1a; font-family: Verdana, sans-serif; font-size: 32px; font-weight: 800; line-height: 32px; margin: 48px 0; text-align: center;">
                        Your one-time login link
                    </h1>
                </header>

                <main>
                    <!-- This div is purely presentational, providing a container for the message. -->
                    <div style="background-color: ghostwhite; border-radius: 4px; padding: 24px 48px;">
                        <!-- This ghost table is used solely for padding in Word-based Outlook clients. -->
                        <!--[if (gte mso 9)|(IE)]>
                        <table cellspacing="0" cellpadding="0" border="0" width="720" align="center" role="presentation"><tr><td style="background-color: ghostwhite; padding: 24px 48px 24px 48px;">
                        <![endif]-->

                        <p>
                            To verify your account, please click the link below or copy and paste it into your brower: 
                        </p>
                        <a href="${url}" style="color: #4b88c2; text-decoration: underline;">${url}</a>

                        <!--[if (gte mso 9)|(IE)]>
                        </td></tr></table>
                        <![endif]-->
                    </div>
                </main>

                <footer>
                    <!-- Since this is a transactional email, you aren't required to include opt-out language. -->
                    <p style="font-size: 16px; font-weight: 400; line-height: 24px; margin-top: 48px;">
                        Thanks for using Recipe Grab
                    </p>
                </footer>

            </div>
            <!--[if (gte mso 9)|(IE)]>
            </td></tr></table>
            <![endif]-->
          </body>
        </html>
    `
}
