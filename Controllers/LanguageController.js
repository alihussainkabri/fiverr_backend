const express = require('express');
const { default: knex } = require('knex');

const router = express.Router();

// this below will get all languages list
router.getLanguageList = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let language_list = [];
    
    await knex('languages').where('status',1).then(response=>{
        if (response){
            status = 200;
            language_list = response;
            message = 'Data fetch successfully!'
        }
    }).catch(err=>console.log(err))

    return res.json({status,message,language_list})
}

module.exports = router;