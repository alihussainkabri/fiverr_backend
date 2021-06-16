const express = require('express');
const HELPERS = require('../Helpers/Helpers');

const router = express.Router();

// this below function is used to create the contract
router.createContract = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    let query = `SELECT * FROM contracts where 
    (creator_uuid = '${inputs.creator_uuid}'  or acceptor_uuid= '${inputs.creator_uuid}' ) and (creator_uuid = '${inputs.acceptor_uuid}' or acceptor_uuid='${inputs.acceptor_uuid}') and status = 1`

    await knex.raw(query).then(response => {
        if (response[0].length > 0) {
            status = 500;
            message = 'Active contract already exist between the two users'
        } else {
            status = 101;
        }
    }).catch(err => console.log(err));

    if (status == 101) {
        let acceptor_obj = {};
        await knex('users').where('uuid', inputs.acceptor_uuid).then(response => {
            if (response.length > 0) {
                acceptor_obj = response[0];
            }
        }).catch(err => console.log(err));

        if (Object.keys(acceptor_obj).length > 0) {
            let create_obj = {
                uuid: await HELPERS.getKnexUuid(knex),
                title: inputs.title,
                description: inputs.description,
                price: inputs.price,
                delivery_date: inputs.delivery_date,
                creator_uuid: inputs.creator_uuid,
                creator_name: inputs.creator_name,
                creator_email: inputs.creator_email,
                acceptor_uuid: inputs.acceptor_uuid,
                acceptor_name: acceptor_obj.username,
                acceptor_email: acceptor_obj.email,
                status: 1,
                created_by: req.user_data.id,
                created_at: HELPERS.datetime()
            }

            await knex('contracts').insert(create_obj).then(async response => {
                if (response) {
                    await HELPERS.sendMail(acceptor_obj.email, 'create_contract', {
                        'to_name': acceptor_obj.username,
                        'from_name': inputs.creator_name
                    }, 'Create Contract').then((response) => {
                        if (response) {
                            status = 200;
                            message = 'Contract has been created successfully!';
                        } else {
                            status = 200;
                            message = 'Contract has been created successfully!';
                        }
                    }).catch(err => console.log(err))
                }
            }).catch(err => console.log(err))
        }
    }

    return res.json({ status, message })
}

// this below will fetch the contract list
router.fetchContractList = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { uuid } = req.params;
    let contract_list = [];

    let query = `SELECT * FROM contracts where 
    (creator_uuid = '${uuid}'  or acceptor_uuid= '${uuid}' )`

    await knex.raw(query).then(response => {
        if (response[0].length > 0) {
            status = 200;
            message = 'Contracts has been fetched successfully!';
            contract_list = response[0]
        }
    }).catch(err => console.log(err));

    return res.json({ status, message, contract_list })
}

// this below function will able to get the detail of contract
router.contractDetail = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { contract_uuid } = req.params;
    let contract_detail = {};

    await knex('contracts').where('uuid', contract_uuid).then(response => {
        if (response.length > 0) {
            status = 200;
            message = 'Contract detail grab successfully!';
            contract_detail = response[0];
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, contract_detail });
}

// this below function is used to decline the contract
router.declineContract = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    await knex('contracts').where('uuid', inputs.contract_uuid).update({
        rejected_at: HELPERS.datetime(),
        reject_reason: inputs.reason,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime(),
        status : 3
    }).then(async response => {
        if (response) {
            status = 200;
            message = 'Contract declined successfully!'
            await HELPERS.sendMail(inputs.creator_email, 'decline_contract', {
                'to_name': inputs.creator_name,
                'from_name': inputs.acceptor_name
            }, 'Contract has been declined').then(response => {
                if (response) {
                    status = 200;
                    message = 'Contract declined successfully!'
                } else {
                    status = 200;
                    message = 'Contract declined successfully!'
                }
            }).catch(err => console.log(err))
        }
    }).catch(err=>console.log(err))

    return res.json({status,message})
}

// this below function will used to accept the contract
router.acceptContract = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    await knex('contracts').where('uuid', inputs.contract_uuid).update({
        accepted_at: HELPERS.datetime(),
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime(),
        status : 2
    }).then(async response => {
        if (response) {
            status = 200;
            message = 'Contract accepted successfully!'
            await HELPERS.sendMail(inputs.creator_email, 'accept_contract', {
                'to_name': inputs.creator_name,
                'from_name': inputs.acceptor_name
            }, 'Contract has been accepted').then(response => {
                if (response) {
                    status = 200;
                    message = 'Contract accepted successfully!'
                } else {
                    status = 200;
                    message = 'Contract accepted successfully!'
                }
            }).catch(err => console.log(err))
        }
    }).catch(err=>console.log(err))

    return res.json({status,message})
}

module.exports = router;