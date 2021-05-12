const express = require('express');
const HELPERS = require('../Helpers/Helpers');
const MD5 = require('md5');
const cryptoString = require('crypto-random-string');
const jwt = require('jsonwebtoken');
const router = express.Router();

//this below function is to check email
router.checkEmail = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    await knex('users').where('email', inputs.email).where('status', '!=', 4).then(response => {
        if (response.length > 0) {
            status = 300;
            message = 'Email Already Exist In System!';
        } else {
            status = 200;
            message = 'You can add this email';

        }
    }).catch(err => HELPERS.consoleLog('error occured while check for duplicate email during signup ' + err));

    return res.json({ status, message })
}

//this below function is for sign-up
router.signUp = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    await knex('users').where('email', inputs.email).where('status', '!=', 4).then(response => {
        if (response.length > 0) {
            status = 300;
            message = 'Email Already Exist In System!';
        }
    }).catch(err => HELPERS.consoleLog('error occured while check for duplicate email during signup ' + err));

    if (status == 500) {
        let random_string = cryptoString({ length: 12 });
        let user_uuid = await HELPERS.getKnexUuid(knex);
        let create_obj = {
            uuid: user_uuid,
            first_name : inputs.username,
            username: inputs.username,
            email: inputs.email,
            password: MD5(inputs.password),
            email_verification_token: random_string,
            status: 1, //verification pending
            created_at: HELPERS.datetime(),
            ip_address : inputs.ip_address,
            country_name : inputs.country_name,
            region_name : inputs.region_name
        }

        await knex('users').insert(create_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Check Email To Verify Your Account!';
            }
        }).catch(err => HELPERS.consoleLog('Error occured while creating user' + err));

        await HELPERS.sendMail(inputs.email, 'email_verification', {
            username: inputs.username,
            url: process.env.APP_URL_REACT + `verifyUser/${random_string}/${user_uuid}`,
            button_text: 'Verify Email'
        }, 'Verify your email').then(response => {
            if (response) {
                status = 200;
                message = 'Check Email To Verify Your Account!'
            }
        }).catch(err => console.log(err))
    }

    return res.json({ status, message })
}

//this below route is used to verify email
router.verifyUser = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { token, uuid } = req.params;
    let user_data = {};

    await knex('users').where('uuid', uuid).where('email_verification_token', token).where('status', 1).then(response => {
        if (response.length > 0) {
            user_data = response[0];
        }
    }).catch(err => HELPERS.consoleLog('Error occured while fetching user on verify' + err))

    if (Object.keys(user_data).length > 0) {
        let update_obj = {
            status: 2,//verify user
            updated_by: user_data.id,
            updated_at: HELPERS.datetime(),
            email_verification_token: ''
        }

        await knex('users').where('id', user_data.id).update(update_obj).then(response => {
            if (response) {
                status = 200;
                message = 'User has been verified successfully!';
            }
        }).catch(err => HELPERS.consoleLog('Error occured while verify user' + err))

    }
    return res.json({ status, message })
}


// this below function is used to login the user
router.login = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let user_data = {};

    await knex('users').where('email', inputs.email).where('password', MD5(inputs.password)).then(response => {
        if (response.length > 0) {
            if (response[0].status == 1) {
                status = 100;
                message = 'Please verify your email'
            } else if (response[0].status == 2) {
                user_data = response[0];
                status = 200;
                message = 'Logged In successfully!';
                user_data['token'] = jwt.sign({ user_data }, 'Fiverr clone');
            }
        } else {
            status = 400;
            message = 'Incorrect email and password!';
        }
    }).catch(err => HELPERS.consoleLog('Error occured while logging in' + err))

    return res.json({ status, message, user_data })
}

// Reset password for user
router.resetPassword = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let random_string = cryptoString({ length: 8 });
    let user_data = {};


    await knex('users').where('email', inputs.email).where('status', 2).then(response => {
        if (response.length > 0) {
            user_data = response[0];
        }
    }).catch(err => console.log(err));

    if (Object.keys(user_data).length > 0) {
        await knex('users').where('email', inputs.email).where('status', 2).update({
            forgot_password_token: random_string,
        }).then(async response => {
            if (response) {
                console.log(response);
                status = 200;
                message = 'Reset token added successfully!'
                await HELPERS.sendMail(user_data.email, 'reset_password', {
                    username: user_data.username,
                    url: process.env.APP_URL_REACT + `reset/${random_string}/${user_data.uuid}`,
                    button_text: 'Reest Password'
                }, 'Reset Your Password').then(response => {
                    if (response) {
                        status = 200;
                        message = 'Email has been sent to you on the given email'
                    }
                }).catch(err => console.log(err))
            } else {
                status = 500;
                message = 'No email found in system '
            }
        }).catch(err => console.log(err))
    }



    return res.json({ status, message })
}

//this below function is for reset password verification
router.verifyEmailReset = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { token, uuid } = req.params;

    await knex('users').where('uuid', uuid).where('forgot_password_token', token).where('status', 2).then(response => {
        if (response.length > 0) {
            status = 200;
            message = 'User has been verified successfully!';
        }
    }).catch(err => HELPERS.consoleLog('Error occured while fetching user on verify' + err))

    return res.json({ status, message })
}

//this below will reset the password
router.reset_password_input = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    await knex('users').where('uuid', inputs.uuid).where('forgot_password_token', inputs.token).update({
        password: MD5(inputs.password),
        forgot_password_token: ''
    }).then(response => {
        status = 200;
        message = 'Password has been reset successfully!';
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

module.exports = router;