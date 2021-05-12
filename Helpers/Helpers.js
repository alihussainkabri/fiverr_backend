require('dotenv').config();
const moment = require('moment-timezone');
const FS = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const HBS = require('nodemailer-express-handlebars');
const MailConfig = require('../configs/MailConfig');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MailConfig.username,
        pass: MailConfig.password
    },
    tls: {
        rejectUnauthorized: false
    }
})

let options = {
    viewEngine: {
        extName: ".hbs",
        partialsDir: './views/emails',
        layoutsDir: './views/emails',
        defaultLayout: 'layout.hbs',
    },
    viewPath: './views/emails',
    extName: '.hbs'
}

async function sendMail(to, template, myContext, subject) {
    return new Promise(async function (resolve, reject) {
        try {
            transporter.use("compile", HBS(options));
            let info = await transporter.sendMail({
                from: MailConfig.username,
                to: to,
                subject: subject,
                template: template,
                context: myContext,
            })
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

function getKnexUuid(knex) {
    return new Promise(function (resolve, reject) {
        knex.raw('SELECT uuid() as uuid').then(response => {
            resolve(response[0][0]['uuid'])
        });
    });
}

function datetime() {
    return moment.tz(process.env.TIME_ZONE).format("YYYY-MM-DD HH:mm:ss");

}

function consoleLog(error) {
    return new Promise(async function (resolve, reject) {
        let path = "./public/logs";
        if (!FS.existsSync(path)) {
            FS.mkdirSync(path);
        }
        let today = moment().format("YYYY-MM-DD");
        let logFile = path + "/" + today + ".txt";
        if (!FS.existsSync(logFile)) {
            FS.createWriteStream(logFile);
        }
        let dateTime = moment().format("YYYY-MM-DD HH:mm:ss");
        let content = "\n";
        content += dateTime + "\n";
        content += error;
        content +=
            "\n-----------------------------------------------------------------------------\n";

        FS.appendFile(logFile, content, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve({ status: 200 });
            }
        });
    });
}

function grabProfilePercent(id) {
    return new Promise(async function (resolve, reject) {
        let current_percent = 10;

        await knex('users').where('id', id).then(response => {
            if (response.length > 0) {
                status = 200;
                message = 'Percent grab successfully!';
                let current_user = response[0];

                if (current_user.profile_image) {
                    current_percent = current_percent + 5;
                }

                if (current_user.description) {
                    current_percent = current_percent + 5;
                }

                if (current_user.story_line) {
                    current_percent = current_percent + 5;
                }

                if (current_user.personal_website) {
                    current_percent = current_percent + 5;
                }

                if (current_user.linkedin_url) {
                    current_percent = current_percent + 5;
                }

                if (current_user.phone_number_verification_status == 1) {
                    current_percent = current_percent + 5;
                }
            }
        }).catch(err => console.log(err))

        await knex('collegeuniversity_user').where('user_id', id).where('status', 1).then(response => {
            if (response.length > 0) {
                current_percent = current_percent + 15;
                status = 200;
                message = 'Percent grab successfully!';
            }
        }).catch(err => console.log(err))


        await knex('skills_user').where('user_id', id).where('status', 1).then(response => {
            if (response.length > 0) {
                current_percent = current_percent + 15;
                status = 200;
                message = 'Percent grab successfully!';
            }
        }).catch(err => console.log(err))


        await knex('language_user').where('user_id', id).where('status', 1).then(response => {
            if (response.length > 0) {
                current_percent = current_percent + 15;
                status = 200;
                message = 'Percent grab successfully!';
            }
        }).catch(err => console.log(err))


        await knex('certifications').where('user_id', id).where('status', 1).then(response => {
            if (response.length > 0) {
                current_percent = current_percent + 15;
                status = 200;
                message = 'Percent grab successfully!';
            }
        }).catch(err => console.log(err))

        resolve(current_percent);
    })
}

module.exports = {
    datetime,
    getKnexUuid,
    consoleLog,
    sendMail,
    grabProfilePercent
}