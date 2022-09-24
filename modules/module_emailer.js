let nodemailer = require('nodemailer');
let secretKeys = require('../modules/module_secretKeys');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: secretKeys.emailUser,
        pass: secretKeys.emailPassword
    }
});

module.exports = {
    sendEmail: function (toName, toEmail, type, subject, message, actionLink) {
        let html = getEmailContent(toName, type, message, actionLink);

        let mailOptions = {
            from: 'Develteam Notification <no-reply@develteam.com>',
            to: toEmail,
            subject: subject,
            text: 'Develteam new mail! Log into the site to check it out',
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("emailer still not working 555");
                console.log("Credentials: ");
                console.log(secretKeys.emailUser);
                console.log(secretKeys.emailPassword);
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    }
};

function getEmailContent(toName, type, message, actionLink) {
    let html;

    if (type === 'passwordRecover') {
        html = `<table style="width: 600px; margin: 0 auto; border: 1px #0e2835 solid; background-color: #ffffff; padding: 0;border-spacing: 0; border-collapse: collapse; font-size: 20px; font-family: Arial, sans-serif">
                <tr>
                    <td style="">
                        <img src="http://www.develteam.com/develteamEmailLogo.png">
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 40px 20px 40px 20px;">
                        Hello, ${toName}. You requested to update your password.
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: center;">
                        <a href="${actionLink}" style="color: #22729A; text-decoration: none; border-bottom: 1px #22729A solid; background-color: #ffffff; padding: 10px; border-radius: 10px;">Update Your Password</a>
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: left;">
                        <b>Please do not reply to this email</b>. <br/>It is unmonitored and ignored.
                    </td>
                </tr>
        </table>`;
    }

    if (type === 'newInvitation') {
        html = `<table style="width: 600px; margin: 0 auto; border: 1px #0e2835 solid; background-color: #ffffff; padding: 0;border-spacing: 0; border-collapse: collapse; font-size: 20px; font-family: Arial, sans-serif">
                <tr>
                    <td style="">
                        <img src="http://www.develteam.com/develteamEmailLogo.png">
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 40px 20px 40px 20px;">
                        Hello, ${toName}. You have been invited to join a Game Project!
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: center;">
                        <a href="http://www.develteam.com" style="color: #22729A; text-decoration: none; border-bottom: 1px #22729A solid; background-color: #ffffff; padding: 10px; border-radius: 10px;">Log in to view your Invitation</a>
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: left;">
                        <b>Please do not reply to this email</b>. <br/>It is unmonitored and ignored.
                    </td>
                </tr>
        </table>`;
    }

    if (type === 'newRequest') {
        html = `<table style="width: 600px; margin: 0 auto; border: 1px #0e2835 solid; background-color: #ffffff; padding: 0;border-spacing: 0; border-collapse: collapse; font-size: 20px; font-family: Arial, sans-serif">
                <tr>
                    <td style="">
                        <img src="http://www.develteam.com/develteamEmailLogo.png">
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 40px 20px 40px 20px;">
                        Hello, ${toName}. Another member has requested to join your Game Project!
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: center;">
                        <a href="http://www.develteam.com" style="color: #22729A; text-decoration: none; border-bottom: 1px #22729A solid; background-color: #ffffff; padding: 10px; border-radius: 10px;">Log in to view the Request</a>
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: left;">
                        <b>Please do not reply to this email</b>. <br/>It is unmonitored and ignored.
                    </td>
                </tr>
        </table>`;
    }

    if (type === 'newInboxConversation') {
        html = `<table style="width: 600px; margin: 0 auto; border: 1px #0e2835 solid; background-color: #ffffff; padding: 0;border-spacing: 0; border-collapse: collapse; font-size: 20px; font-family: Arial, sans-serif">
                <tr>
                    <td style="">
                        <img src="http://www.develteam.com/develteamEmailLogo.png">
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 40px 20px 40px 20px;">
                        Hello, ${toName}. You have new a Inbox Message!
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: center;">
                        <a href="http://www.develteam.com" style="color: #22729A; text-decoration: none; border-bottom: 1px #22729A solid; background-color: #ffffff; padding: 10px; border-radius: 10px;">Log in to view the message</a>
                    </td>
                </tr>
        
                <tr bgcolor="#e9f0f5" style="color: #0e2835">
                    <td style="padding: 20px 20px 100px 20px; text-align: left;">
                        <b>Please do not reply to this email</b>. <br/>It is unmonitored and ignored.
                    </td>
                </tr>
        </table>`;
    }

    return html;
}