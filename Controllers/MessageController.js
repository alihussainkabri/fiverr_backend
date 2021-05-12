const express = require('express');
const HELPERS = require('../Helpers/Helpers');

const router = express.Router();

// fetch message needs
router.fetchMessageNeeds = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';

    let chat_list = [];

    let query = `SELECT chats.uuid as chat_uuid,chats.person1_uuid,chats.person2_uuid,chats.person1_name,chats.person2_name,u1.profile_image as person1_profile,u2.profile_image as person2_profile,u1.online_status as person1_status,u2.online_status as person2_status FROM chats
    INNER JOIN users u1 on u1.uuid = chats.person1_uuid
    INNER JOIN users u2 on u2.uuid = chats.person2_uuid
    WHERE (chats.person1_uuid = '${req.user_data.uuid}' OR chats.person2_uuid = '${req.user_data.uuid}') and chats.status = 1 ORDER by chats.updated_at DESC`;

    await knex.raw(query).then(response => {
        if (response) {
            chat_list = response[0];
            status = 200;
            message = 'Data fetch successfully!';
        }
    }).catch(err => console.log(err))

    for (let i = 0; i < chat_list.length; i++) {
        await knex('messages').where('chat_uuid', chat_list[i].chat_uuid).where('status', 1).orderBy('id', 'desc').first().then(async response => {
            chat_list[i]['last_message'] = response.message;
            status = 200;
            message = 'Data fetch successfully!';

            await knex('messages').where('reciever_uuid',req.user_data.uuid).where('chat_uuid', chat_list[i].chat_uuid).where('status', 1).where('message_status',0).then(response=>{
                if (response){
                    chat_list[i]['unread_message'] = response.length;
                }
            })
        }).catch(err => console.log(err))
    }

    return res.json({ status, message, chat_list })
}

// create chat
router.submitMessageModal = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let chat_id = 0;
    let inputs = req.body;
    let isCHAT = false;

    let chat_uuid = ''

    let query = `SELECT * FROM chats
    WHERE (person1_uuid = '${inputs.seller}' OR person2_uuid = '${inputs.seller}') and (person1_uuid = '${inputs.user}' OR person2_uuid = '${inputs.user}') and status = 1`;

    await knex.raw(query).then(response => {
        if (response[0].length > 0) {
            isCHAT = true;
            chat_uuid = response[0][0].uuid;
        } else {
            isCHAT = false;
            chat_uuid = ''
        }
    }).catch(err => console.log(err))

    if (isCHAT && chat_uuid) {
        let message_insert = {
            uuid: await HELPERS.getKnexUuid(knex),
            chat_uuid: chat_uuid,
            message: inputs.message,
            sender_uuid: inputs.user,
            sender_name: inputs.user_name,
            reciever_uuid: inputs.seller,
            reciever_name: inputs.seller_name,
            status: 1,
            created_by: inputs.user_id,
            created_at: HELPERS.datetime()
        }

        await knex('messages').insert(message_insert).then(response => {
            if (response) {
                status = 200;
                message = 'Chat and message has been created successfully!'
            }
        }).catch(err => console.log(err))

        await knex('chats').where('uuid',chat_uuid).update({
            updated_at : HELPERS.datetime(),
            updated_by : inputs.user_id
        }).then(response=>{
            if (response){
                status = 200;
                message = 'Data fetch successfully!'
            }
        })
    } else {
        chat_uuid=await HELPERS.getKnexUuid(knex);
        let insert_obj = {
            uuid: chat_uuid,
            person1_uuid: inputs.user, // send will be person1
            person2_uuid: inputs.seller,
            person1_name: inputs.user_name,
            person2_name: inputs.seller_name,
            status: 1,
            created_by: inputs.user_id,
            created_at: HELPERS.datetime(),
        }

        await knex('chats').insert(insert_obj, 'uuid').then(response => {
            if (response) {
                chat_id = response[0];
            }
        }).catch(err => console.log(err))

        let message_insert = {
            uuid: await HELPERS.getKnexUuid(knex),
            chat_uuid: chat_uuid,
            message: inputs.message,
            sender_uuid: inputs.user,
            sender_name: inputs.user_name,
            reciever_uuid: inputs.seller,
            reciever_name: inputs.seller_name,
            status: 1,
            created_by: inputs.user_id,
            created_at: HELPERS.datetime()
        }

        await knex('messages').insert(message_insert).then(response => {
            if (response) {
                status = 200;
                message = 'Chat and message has been created successfully!'
            }
        }).catch(err => console.log(err))
    }

    return res.json({status,message});
}


// fetch messages based on chat uuid
router.fetchMessagesChatUuid = async (req,res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let {uuid} = req.params;
    let chat_messages = [];

    let query = `SELECT messages.id,messages.uuid,messages.chat_uuid,messages.message,messages.attachements,messages.attachement_name,messages.sender_uuid,messages.sender_name,messages.reciever_uuid,messages.reciever_name,messages.status,messages.created_by,messages.created_at,u1.profile_image as sender_image,u2.profile_image as reciever_image FROM messages 
    INNER JOIN users u1 on u1.uuid = messages.sender_uuid
    INNER JOIN users u2 on u2.uuid = messages.reciever_uuid
    WHERE messages.chat_uuid = '${uuid}' and messages.status = 1`;

    await knex.raw(query).then(response=>{
        if (response[0]){
            chat_messages = response[0];
            status = 200;
            message = 'Data has been fetched successfully!'
        }
    }).catch(err=>console.log(err))

    return res.json({status,message,chat_messages})
}
module.exports = router;