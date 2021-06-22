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

        let contract_uuid = await HELPERS.getKnexUuid(knex);

        if (Object.keys(acceptor_obj).length > 0) {
            let create_obj = {
                uuid: contract_uuid,
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

            let sub_query = `select * from chats where (person1_uuid='${inputs.creator_uuid}' or person2_uuid='${inputs.creator_uuid}') and (person1_uuid='${inputs.acceptor_uuid}' or person2_uuid='${inputs.acceptor_uuid}') and status=1 `;

            await knex.raw(sub_query).then(async response => {
                if (response[0].length > 0) {
                    let chat_uuid = response[0][0].uuid;

                    let message_obj = {
                        uuid: await HELPERS.getKnexUuid(knex),
                        chat_uuid,
                        message: 'Contract has been created',
                        sender_uuid: inputs.creator_uuid,
                        sender_name: inputs.creator_name,
                        reciever_uuid: inputs.acceptor_uuid,
                        reciever_name: inputs.acceptor_name,
                        status: 1,
                        created_by: req.user_data.id,
                        is_contract: 1,
                        contract_uuid: contract_uuid,
                        created_at: HELPERS.datetime()
                    }

                    await knex('messages').insert(message_obj).then(response => {
                        if (response) {
                            status = 200;
                            message = 'Contract has been updated on the messages successfully!'
                        }
                    }).catch(err => console.log(err))
                }
            })
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
    (creator_uuid = '${uuid}'  or acceptor_uuid= '${uuid}' ) order by id desc`

    await knex.raw(query).then(response => {
        if (response[0]) {
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

    let contract_detail = {};


    await knex('contracts').where('uuid', inputs.contract_uuid).then(response => {
        if (response.length > 0) {
            contract_detail = response[0];
        }
    }).catch(err => console.log(err));

    await knex('contracts').where('uuid', inputs.contract_uuid).update({
        rejected_at: HELPERS.datetime(),
        reject_reason: inputs.reason,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime(),
        status: 3
    }).then(async response => {
        if (response) {
            status = 200;
            message = 'Contract declined successfully!';

            if (Object.keys(contract_detail).length > 0) {
                let sub_query = `select * from chats where (person1_uuid='${contract_detail.creator_uuid}' or person2_uuid='${contract_detail.creator_uuid}') and (person1_uuid='${contract_detail.acceptor_uuid}' or person2_uuid='${contract_detail.acceptor_uuid}') and status=1 `;

                await knex.raw(sub_query).then(async response => {
                    if (response[0].length > 0) {
                        let chat_uuid = response[0][0].uuid;

                        let message_obj = {
                            uuid: await HELPERS.getKnexUuid(knex),
                            chat_uuid,
                            message: `Contract has been declined because ${inputs.reason}`,
                            sender_uuid: contract_detail.acceptor_uuid,
                            sender_name: contract_detail.acceptor_name,
                            reciever_uuid: contract_detail.creator_uuid,
                            reciever_name: contract_detail.creator_name,
                            status: 1,
                            created_by: req.user_data.id,
                            is_contract: 1,
                            contract_uuid: contract_detail.uuid,
                            created_at: HELPERS.datetime()
                        }

                        await knex('messages').insert(message_obj).then(response => {
                            if (response) {
                                status = 200;
                                message = 'Contract has been updated on the messages successfully!'
                            }
                        }).catch(err => console.log(err))
                    }
                })
            }


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
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// this below function will used to accept the contract
router.acceptContract = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    let contract_detail = {};

    await knex('contracts').where('uuid', inputs.contract_uuid).then(response => {
        if (response.length > 0) {
            contract_detail = response[0];
        }
    }).catch(err => console.log(err));

    await knex('contracts').where('uuid', inputs.contract_uuid).update({
        accepted_at: HELPERS.datetime(),
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime(),
        status: 2
    }).then(async response => {
        if (response) {
            status = 200;
            message = 'Contract accepted successfully!';

            if (Object.keys(contract_detail).length > 0) {
                let sub_query = `select * from chats where (person1_uuid='${contract_detail.creator_uuid}' or person2_uuid='${contract_detail.creator_uuid}') and (person1_uuid='${contract_detail.acceptor_uuid}' or person2_uuid='${contract_detail.acceptor_uuid}') and status=1 `;

                await knex.raw(sub_query).then(async response => {
                    if (response[0].length > 0) {
                        let chat_uuid = response[0][0].uuid;

                        let message_obj = {
                            uuid: await HELPERS.getKnexUuid(knex),
                            chat_uuid,
                            message: `Contract has been accepted`,
                            sender_uuid: contract_detail.acceptor_uuid,
                            sender_name: contract_detail.acceptor_name,
                            reciever_uuid: contract_detail.creator_uuid,
                            reciever_name: contract_detail.creator_name,
                            status: 1,
                            created_by: req.user_data.id,
                            is_contract: 1,
                            contract_uuid: contract_detail.uuid,
                            created_at: HELPERS.datetime()
                        }

                        await knex('messages').insert(message_obj).then(response => {
                            if (response) {
                                status = 200;
                                message = 'Contract has been updated on the messages successfully!'
                            }
                        }).catch(err => console.log(err))
                    }
                })
            }

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
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// this below route is used to end the contract
router.endContractPost = async (req,res) =>{
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let contract_detail_obj = {};
    console.log(inputs);

    await knex('contracts').where('uuid',inputs.contract_uuid).then(response=>{
        if (response.length > 0){
            contract_detail_obj = response[0];
        }
    }).catch(err=>console.log(err))

    if (Object.keys(contract_detail_obj).length > 0){
        let update_contract_obj = {
            cancelled_at : HELPERS.datetime(),
            cancelled_reason : inputs.reason,
            completed_feedback : inputs.describe,
            status : 4,
            cancelled_by : req.user_data.uuid,
            updated_by : req.user_data.id,
            updated_at : HELPERS.datetime()
        }

        await knex('contracts').where('uuid',inputs.contract_uuid).update(update_contract_obj).then(async response=>{
            if (response){
                status = 200;
                message = 'Contract has been ended successfully!';

                await HELPERS.sendMail(contract_detail_obj.creator_email, 'end_contract', {
                    'to_name': contract_detail_obj.creator_name,
                    'reason' : inputs.reason,
                    'describe' : inputs.describe,
                    'title' : contract_detail_obj.title,
                    'from_name': inputs.acceptor_name,
                    'ender_name' : req.user_data.username,
                }, 'Contract has been ended').then(response => {
                    if (response) {
                        status = 200;
                        message = 'Contract ended successfully!'
                    } else {
                        status = 200;
                        message = 'Contract ended successfully!'
                    }
                }).catch(err => console.log(err))

                await HELPERS.sendMail(contract_detail_obj.acceptor_email, 'end_contract', {
                    'to_name': contract_detail_obj.acceptor_name,
                    'reason' : inputs.reason,
                    'describe' : inputs.describe,
                    'title' : contract_detail_obj.title,
                    'from_name': contract_detail_obj.creator_name,
                    'ender_name' : req.user_data.username,
                }, 'Contract has been ended').then(response => {
                    if (response) {
                        status = 200;
                        message = 'Contract ended successfully!'
                    } else {
                        status = 200;
                        message = 'Contract ended successfully!'
                    }
                }).catch(err => console.log(err))


                let sub_query = `select * from chats where (person1_uuid='${contract_detail_obj.creator_uuid}' or person2_uuid='${contract_detail_obj.creator_uuid}') and (person1_uuid='${contract_detail_obj.acceptor_uuid}' or person2_uuid='${contract_detail_obj.acceptor_uuid}') and status=1 `;

                await knex.raw(sub_query).then(async response => {
                    if (response[0].length > 0) {
                        let chat_uuid = response[0][0].uuid;

                        let reciever_uuid = '';
                        let reciever_name = '';

                        if (contract_detail_obj.creator_uuid == req.user_data.uuid){
                            reciever_uuid = contract_detail_obj.acceptor_uuid;
                            reciever_name = contract_detail_obj.acceptor_name;
                        }else{
                            reciever_uuid = contract_detail_obj.creator_uuid;
                            reciever_name = contract_detail_obj.creator_name;
                        }


                        let message_obj = {
                            uuid: await HELPERS.getKnexUuid(knex),
                            chat_uuid,
                            message: `Contract has been ended`,
                            sender_uuid: req.user_data.uuid,
                            sender_name: req.user_data.username,
                            reciever_uuid: reciever_uuid,
                            reciever_name: reciever_name,
                            status: 1,
                            created_by: req.user_data.id,
                            is_contract: 1,
                            contract_uuid: inputs.contract_uuid,
                            created_at: HELPERS.datetime()
                        }

                        await knex('messages').insert(message_obj).then(response => {
                            if (response) {
                                status = 200;
                                message = 'Contract has been updated on the messages successfully!'
                            }
                        }).catch(err => console.log(err))
                    }
                })

            }
        }).catch(err=>console.log(err))

    }

    return res.json({status,message})
}

// This function is used to raise a dispute
router.raiseDisputePost = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let contract_detail_obj = {};

    await knex('contracts').where('uuid',inputs.contract_uuid).then(response=>{
        if (response.length > 0){
            contract_detail_obj = response[0];
        }
    }).catch(err=>console.log(err))

    if (Object.keys(contract_detail_obj).length > 0){
        let contract_update_obj = {
            is_dispute_raised : 1,
            dispute_raised_at : HELPERS.datetime(),
            dispute_raised_by : req.user_data.uuid,
            dispute_description : inputs.disputeReason,
            status : 5,
            updated_by : req.user_data.id,
            updated_at : HELPERS.datetime()
        }

        await knex('contracts').where('uuid',inputs.contract_uuid).update(contract_update_obj).then(async response=>{
            if (response){
                status = 200;
                message = 'Dispute has been raised successfully!';

                await HELPERS.sendMail(contract_detail_obj.creator_email, 'dispute_contract', {
                    'to_name': contract_detail_obj.creator_name,
                    'reason' : inputs.disputeReason,
                    'title' : contract_detail_obj.title,
                    'from_name': contract_detail_obj.acceptor_name,
                    'ender_name' : req.user_data.username,
                }, 'Dispute has been raied for a contract').then(response => {
                    if (response) {
                        status = 200;
                        message = 'Dispute has been raied for a contract'
                    } else {
                        status = 200;
                        message = 'Dispute has been raied for a contract'
                    }
                }).catch(err => console.log(err))

                await HELPERS.sendMail(contract_detail_obj.acceptor_email, 'dispute_contract', {
                    'to_name': contract_detail_obj.acceptor_name,
                    'reason' : inputs.disputeReason,
                    'from_name': contract_detail_obj.creator_name,
                    'ender_name' : req.user_data.username,
                }, 'Dispute has been raied for a contract').then(response => {
                    if (response) {
                        status = 200;
                        message = 'Dispute has been raied for a contract'
                    } else {
                        status = 200;
                        message = 'Dispute has been raied for a contract'
                    }
                }).catch(err => console.log(err))


                let sub_query = `select * from chats where (person1_uuid='${contract_detail_obj.creator_uuid}' or person2_uuid='${contract_detail_obj.creator_uuid}') and (person1_uuid='${contract_detail_obj.acceptor_uuid}' or person2_uuid='${contract_detail_obj.acceptor_uuid}') and status=1 `;

                await knex.raw(sub_query).then(async response => {
                    if (response[0].length > 0) {
                        let chat_uuid = response[0][0].uuid;

                        let reciever_uuid = '';
                        let reciever_name = '';

                        if (contract_detail_obj.creator_uuid == req.user_data.uuid){
                            reciever_uuid = contract_detail_obj.acceptor_uuid;
                            reciever_name = contract_detail_obj.acceptor_name;
                        }else{
                            reciever_uuid = contract_detail_obj.creator_uuid;
                            reciever_name = contract_detail_obj.creator_name;
                        }


                        let message_obj = {
                            uuid: await HELPERS.getKnexUuid(knex),
                            chat_uuid,
                            message: `Dispute has been raised`,
                            sender_uuid: req.user_data.uuid,
                            sender_name: req.user_data.username,
                            reciever_uuid: reciever_uuid,
                            reciever_name: reciever_name,
                            status: 1,
                            created_by: req.user_data.id,
                            is_contract: 1,
                            contract_uuid: inputs.contract_uuid,
                            created_at: HELPERS.datetime()
                        }

                        await knex('messages').insert(message_obj).then(response => {
                            if (response) {
                                status = 200;
                                message = 'Contract has been updated on the messages successfully!'
                            }
                        }).catch(err => console.log(err))
                    }
                })

            }
        }).catch(err=>console.log(err))

    }

    return res.json({status,message})
}


// this below function is used to mark the dispute solved
router.submitDisputeSolved = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let contract_detail_obj = {};

    await knex('contracts').where('uuid',inputs.contract_uuid).then(response=>{
        if (response.length > 0){
            contract_detail_obj = response[0];
        }
    }).catch(err=>console.log(err))

    if (Object.keys(contract_detail_obj).length > 0){
        let contract_update_obj = {
            is_dispute_solved : 1,
            dispute_solved_at : HELPERS.datetime(),
            dispute_solved_by : req.user_data.uuid,
            dispute_solved_description : inputs.reason,
            status : 6,
            updated_by : req.user_data.id,
            updated_at : HELPERS.datetime()
        }

        await knex('contracts').where('uuid',inputs.contract_uuid).update(contract_update_obj).then(async response=>{
            if (response){
                status = 200;
                message = 'Dispute has been raised successfully!';

                await HELPERS.sendMail(contract_detail_obj.creator_email, 'dispute_solved', {
                    'to_name': contract_detail_obj.creator_name,
                    'reason' : inputs.reason,
                    'title' : contract_detail_obj.title,
                    'from_name': contract_detail_obj.acceptor_name,
                    'ender_name' : req.user_data.username,
                }, 'Dispute has been solved for a contract').then(response => {
                    if (response) {
                        status = 200;
                        message = 'Dispute has been solved for a contract'
                    } else {
                        status = 200;
                        message = 'Dispute has been solved for a contract'
                    }
                }).catch(err => console.log(err))

                await HELPERS.sendMail(contract_detail_obj.acceptor_email, 'dispute_solved', {
                    'to_name': contract_detail_obj.acceptor_name,
                    'reason' : inputs.reason,
                    'from_name': contract_detail_obj.creator_name,
                    'ender_name' : req.user_data.username,
                }, 'Dispute has been solved for a contract').then(response => {
                    if (response) {
                        status = 200;
                        message = 'Dispute has been solved for a contract'
                    } else {
                        status = 200;
                        message = 'Dispute has been solved for a contract'
                    }
                }).catch(err => console.log(err))


                let sub_query = `select * from chats where (person1_uuid='${contract_detail_obj.creator_uuid}' or person2_uuid='${contract_detail_obj.creator_uuid}') and (person1_uuid='${contract_detail_obj.acceptor_uuid}' or person2_uuid='${contract_detail_obj.acceptor_uuid}') and status=1 `;

                await knex.raw(sub_query).then(async response => {
                    if (response[0].length > 0) {
                        let chat_uuid = response[0][0].uuid;

                        let reciever_uuid = '';
                        let reciever_name = '';

                        if (contract_detail_obj.creator_uuid == req.user_data.uuid){
                            reciever_uuid = contract_detail_obj.acceptor_uuid;
                            reciever_name = contract_detail_obj.acceptor_name;
                        }else{
                            reciever_uuid = contract_detail_obj.creator_uuid;
                            reciever_name = contract_detail_obj.creator_name;
                        }


                        let message_obj = {
                            uuid: await HELPERS.getKnexUuid(knex),
                            chat_uuid,
                            message: `Dispute has been solved`,
                            sender_uuid: req.user_data.uuid,
                            sender_name: req.user_data.username,
                            reciever_uuid: reciever_uuid,
                            reciever_name: reciever_name,
                            status: 1,
                            created_by: req.user_data.id,
                            is_contract: 1,
                            contract_uuid: inputs.contract_uuid,
                            created_at: HELPERS.datetime()
                        }

                        await knex('messages').insert(message_obj).then(response => {
                            if (response) {
                                status = 200;
                                message = 'Contract has been updated on the messages successfully!'
                            }
                        }).catch(err => console.log(err))
                    }
                })

            }
        }).catch(err=>console.log(err))

    }

    return res.json({status,message})
} 

module.exports = router;