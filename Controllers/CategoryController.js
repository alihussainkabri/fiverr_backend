const express = require('express');
const HELPERS = require('../Helpers/Helpers');

const router = express.Router();

// this below function is used to get the list of categories
router.list = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let category_list = [];

    if (req.user_data.is_admin){
        await knex('categories').where('status','!=',4).orderBy('id','desc').then(response=>{
            if (response){
                status = 200;
                message = 'Category list has been fetched successfully!'
                category_list = response;
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message,category_list})
}

// this below function is used to create the new category
router.create = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    if (req.user_data.is_admin){
        let create_obj = {
            uuid : await HELPERS.getKnexUuid(knex),
            category_name : inputs.category_name,
            created_by : req.user_data.id,
            created_at : HELPERS.datetime()
        }
    
        await knex('categories').insert(create_obj).then(response=>{
            if (response){
                status = 200;
                message = 'Category has been created successfully!'
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message})
}


// this below function is used to update
router.update = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let {id} = req.params;
    let inputs = req.body;

    if (req.user_data.is_admin){
        await knex('categories').where('id',id).update({
            category_name : inputs.category_name,
            updated_by : req.user_data.id,
            updated_at : HELPERS.datetime()
        }).then(response=>{
            if (response){
                status = 200;
                message = 'Category has been edited succesfully!'
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
        await knex('categories').where('id',id).update({
            status : 4,
            deleted_by : req.user_data.id,
            deleted_at : HELPERS.datetime()
        }).then(response=>{
            if (response){
                status = 200;
                message = 'Category has been deleted successfully!'
            }
        })
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message});
}

module.exports = router;