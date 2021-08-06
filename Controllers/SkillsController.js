const express = require('express');
const HELPERS = require('../Helpers/Helpers');

const router = express.Router();

// this below function is used to get the list of categories
router.list = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let skills_list = [];

    if (req.user_data.is_admin){
        await knex('skills').where('status','!=',4).orderBy('id','desc').then(response=>{
            if (response){
                status = 200;
                message = 'skills list has been fetched successfully!'
                skills_list = response;
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message,skills_list})
}


// this below function is used to approve skill
router.approveSkill = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let {id} = req.params;

    if (req.user_data.is_admin){
        await knex('skills').where('id',id).update({
            status : 1,
            approved_by : req.user_data.id,
            approved_at : HELPERS.datetime()
        }).then(response=>{
            if (response){
                status = 200;
                message = 'Skill has been approved successfully!'
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message})
}

// this below function is used to reject the skill
router.rejectSkill = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    console.log(inputs)
    if (req.user_data.is_admin){
        await knex('skills').where('id',inputs.skill_id).update({
            status : 3,
            rejected_by : req.user_data.id,
            rejected_at : HELPERS.datetime(),
            rejected_reason : inputs.reason
        }).then(response=>{
            if (response){
                status = 200;
                message = 'Skill has been rejected successfully!'
            }
        }).catch(err=>console.log(err))
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message})
}

// this below function is used to create the new category
router.create = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    if (req.user_data.is_admin){
        let create_obj = {
            uuid : await HELPERS.getKnexUuid(knex),
            name : inputs.name,
            status : 1,
            created_by : req.user_data.id,
            created_at : HELPERS.datetime()
        }
    
        await knex('skills').insert(create_obj).then(response=>{
            if (response){
                status = 200;
                message = 'Skills has been created successfully!'
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
        await knex('skills').where('id',id).update({
            name : inputs.name,
            updated_by : req.user_data.id,
            updated_at : HELPERS.datetime()
        }).then(response=>{
            if (response){
                status = 200;
                message = 'skills has been edited succesfully!'
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
        await knex('skills').where('id',id).update({
            status : 4,
            deleted_by : req.user_data.id,
            deleted_at : HELPERS.datetime()
        }).then(response=>{
            if (response){
                status = 200;
                message = 'sub category has been deleted successfully!'
            }
        })
    }else{
        status = 401;
        message = 'You are not logged in as admin'
    }

    return res.json({status,message});
}

module.exports = router;