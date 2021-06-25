require('dotenv').config();
const express = require('express');
const HELPERS = require('../Helpers/Helpers');

const router = express.Router();

// create contact page
router.contactFormPost = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    console.log(inputs);

    let create_obj = {
        uuid : await HELPERS.getKnexUuid(knex),
        name : inputs.name,
        email : inputs.email,
        message_text : inputs.text,
        status : 1,
        created_at : HELPERS.datetime()
    }

    await knex('contacts').insert(create_obj).then(async response=>{
        if (response){
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

            await HELPERS.sendMail(process.env.ADMIN_EMAIL , 'admin_contact', {
                'to_name': "Admin",
                "from_name" : inputs.name,
                "email" : inputs.email,
                "text" : inputs.text,
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
    }).catch(err=>console.log(err))

    return res.json({status,message})
}

module.exports = router;