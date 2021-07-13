const express = require('express');

const router = express.Router();

// the below router is used to grab the details of the dashboard page
router.dashboard = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';

    let users_count = 0;
    let contact_count = 0;
    let contract_count = 0;
    let categories_count = 0;
    let subcategories_count = 0;
    let colleges_count = 0;
    let skills_count = 0;
    let languages_count = 0;

    let users_list = [];
    let contacts_list = [];

    // if (req.user_data.is_admin){

        await knex('users').where('status','!=',4).count().then(response=>{
            if (response){
                users_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('contacts').where('status','!=',4).count().then(response=>{
            if (response){
                contact_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('contracts').where('status','!=',4).count().then(response=>{
            if (response){
                contract_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('categories').where('status','!=',4).count().then(response=>{
            if (response){
                contract_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('sub_categories').where('status','!=',4).count().then(response=>{
            if (response){
                contract_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('college_universities').where('status','!=',4).count().then(response=>{
            if (response){
                colleges_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('skills').where('status','!=',4).count().then(response=>{
            if (response){
                skills_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('languages').where('status','!=',4).count().then(response=>{
            if (response){
                languages_count = response[0]['count(*)'];
                status = 200;
                message = 'Count has been fetched successfully!';
            }
        }).catch(err=>console.log(err))

        await knex('users').where('status','!=',4).orderBy('id','desc').then(response=>{
            if (response){
                users_list = response;
                status = 200;
                message = 'User has been updated successfully!';
            }
        }).catch(err=>console.log(err))


        await knex('contacts').where('status','!=',4).orderBy('id','desc').then(response=>{
            if (response){
                contacts_list = response;
                status = 200;
                message = 'User has been updated successfully!';
            }
        }).catch(err=>console.log(err))


    // }else{
    //     return res.json({
    //         status : 403,
    //         message : 'You are not authorized as a admin'
    //     });
    // }

    return res.json({
        contacts_list,users_list,status,message,users_count,contact_count,contract_count,colleges_count,skills_count,categories_count,subcategories_count,languages_count
    })
}

module.exports = router;