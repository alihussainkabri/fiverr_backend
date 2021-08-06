const express = require('express');
const HELPERS = require('../Helpers/Helpers');

const router = express.Router();

// this below will get all languages list
router.list = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let language_list = [];
    
    if (req.user_data.is_admin){
        await knex('languages').where('status',1).orderBy('id','desc').then(response=>{
            if (response){
                status = 200;
                language_list = response;
                message = 'Data fetch successfully!'
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message,language_list})
}

// this below function will used to create the language
router.create = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    if (req.user_data.is_admin){
        let create_obj = {
            uuid : await HELPERS.getKnexUuid(knex),
            english_name : inputs.name,
            regional_name : inputs.regional_name,
            status : 1,
            created_by : req.user_data.id,
            created_at : HELPERS.datetime()
        }
    
        await knex('languages').insert(create_obj).then(response=>{
            if (response){
                status = 200;
                message = 'language has been created successfully!'
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message})
}

// this below function is used to get the deta by id
router.getDetailById = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let {id} = req.params;
    let category_detail = {};

    if (req.user_data.is_admin){
        await knex('languages').where('id',id).then(response=>{
            if (response.length > 0){
                status = 200;
                message = 'language detail has been fetched successfully!';
                category_detail = response[0];
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message,category_detail})
}

// this below function is used to update
router.update = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let {id} = req.params;
    let inputs = req.body;

    if (req.user_data.is_admin){
        await knex('languages').where('id',id).update({
            english_name : inputs.name,
            regional_name : inputs.regional_name,
            updated_by : req.user_data.id,
            updated_at : HELPERS.datetime()
        }).then(response=>{
            if (response){
                status = 200;
                message = 'languages has been edited succesfully!'
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message})
}

// this below function is used to delete
router.delete = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let {id} = req.params;

    if (req.user_data.is_admin){
        await knex('languages').where('id',id).update({
            status : 4,
            deleted_by : req.user_data.id,
            deleted_at : HELPERS.datetime()
        }).then(response=>{
            if (response){
                status = 200;
                message = 'languages has been deleted successfully!'
            }
        })
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message});
}

module.exports = router;