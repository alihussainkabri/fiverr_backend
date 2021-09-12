const express = require('express');
const router = express.Router();
const HELPERS = require('../Helpers/Helpers');

// this below is used to get the user list
router.list = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let list = []

    await knex('users').where('status', '!=', 4).then(response => {
        if (response) {
            status = 200;
            message = 'User has been fetched successfully!';
            list = response
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, list })
}

// this below function is going to make the user as admin
router.setUserAdmin = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;

    await knex('users').where('id', id).update({
        status: 2,
        is_admin: 1,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'User has been updated as admin'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// this below is to delete the user
router.deleteUser = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;

    await knex('users').where('id', id).update({
        status: 4,
        deleted_by: req.user_data.id,
        deleted_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'User has been deleted'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// get user contracts
router.getContractList = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';

    let {uuid} = req.params;
    let list= [];

    let query = `select * from contracts where contracts.creator_uuid='${uuid}' or contracts.acceptor_uuid='${uuid}' order by contracts.id desc`
    await knex.raw(query).then(response=>{
        if (response[0]){
            status = 200;
            message = 'Contract list has been fetched successfully!';
            list = response[0];
        }
    }).catch(err=>console.log(err))

    return res.json({status,message,list})
}

module.exports = router;