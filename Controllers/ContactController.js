require('dotenv').config();
const express = require('express');
const HELPERS = require('../Helpers/Helpers');

const router = express.Router();

// create contact page
router.contactFormPost = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    console.log(inputs);

    let create_obj = {
        uuid: await HELPERS.getKnexUuid(knex),
        name: inputs.name,
        email: inputs.email,
        message_text: inputs.text,
        status: 1,
        created_at: HELPERS.datetime()
    }

    await knex('contacts').insert(create_obj).then(async response => {
        if (response) {
            status = 200;
            message = 'Contact application has been saved successfully!';

            await HELPERS.sendMail(inputs.email, 'contact', {
                'to_name': inputs.name,
            }, 'Contact Application Has Been Submitted').then(response => {
                if (response) {
                    status = 200;
                    message = 'Contact application has been saved successfully!'
                } else {
                    status = 200;
                    message = 'Contact application has been saved successfully!'
                }
            }).catch(err => console.log(err))

            await HELPERS.sendMail(process.env.ADMIN_EMAIL, 'admin_contact', {
                'to_name': "Admin",
                "from_name": inputs.name,
                "email": inputs.email,
                "text": inputs.text,
            }, 'Contact Application Has Been Submitted').then(response => {
                if (response) {
                    status = 200;
                    message = 'Contact application has been saved successfully!'
                } else {
                    status = 200;
                    message = 'Contact application has been saved successfully!'
                }
            }).catch(err => console.log(err))
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// this below function is used to get the list of contacts
router.list = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let list = [];
    if (req.user_data.is_admin) {


        await knex('contacts').where('status','!=', 4).orderBy('id','desc').then(response => {
            if (response) {
                status = 200;
                message = 'Contact list has been fetched successfully!'
                list = response;
            }
        }).catch(err => console.log(err))


    } else {
        status = 403;
        message = 'You are not authorized to login'
    }
    return res.json({ status, message, list })
}

// this below function is used to update the contact
router.update = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let {id} = req.params;

    await knex('contacts').where('id',id).update({
        status : 2,
        reply_by : req.user_data.id,
        reply_at : HELPERS.current_date(),
        reply_reason : inputs.res
    }).then(response=>{
        if (response){
            status = 200;
            message = 'Contact list has been updated successfully!';
        }
    }).catch(err=>console.log(err))

    return res.json({status,message})
    
}

module.exports = router;