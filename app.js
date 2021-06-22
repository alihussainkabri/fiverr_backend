require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Multer = require('multer');
const path = require('path');
const defaultPath = './public/uploads';
const Router = require('./Router/routes');
const http = require('http');
const socketIo = require('socket.io');
const HELPERS = require('./Helpers/Helpers');
const Middlewares = require('./middlewares/Middlewares');

let storage = Multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, defaultPath);
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '-' + file.originalname);
    }
});

let upload = Multer({ storage: storage });

let port = process.env.PORT;
let db = require('./knexfile');
const enviroment = process.env.NODE_ENV;
global.knex = require('knex')(db[enviroment]);

const app = express();
app.use(cors());
app.use(upload.any());
app.use('/api/public', express.static(path.join(__dirname, "public")))

app.use((req, res, next) => {
    console.log(new Date(), req.method, req.path);
    next();
})



const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        credentials: true
    }
});

io.on('connection', (socket) => {
    global.socket = socket;

    socket.on('newMessage', async (data) => {
        let chat_id;
        await knex('messages').insert(
            {
                uuid: await HELPERS.getKnexUuid(knex),
                chat_uuid: data.chat_uuid,
                message: data.message,
                sender_uuid: data.sender_uuid,
                sender_name: data.sender_name,
                reciever_uuid: data.reciever_uuid,
                reciever_name: data.reciever_name,
                status: 1,
                created_by: data.user_id,
                created_at: HELPERS.datetime()
            }, 'id'
        ).then(async response => {
            if (response) {
                chat_id = response[0];
                let chat_messages = [];

                let query = `SELECT messages.id,messages.uuid,messages.chat_uuid,messages.message,messages.attachements,messages.sender_uuid,messages.sender_name,messages.reciever_uuid,messages.reciever_name,messages.status,messages.created_by,messages.created_at,u1.profile_image as sender_image,u2.profile_image as reciever_image FROM messages 
    INNER JOIN users u1 on u1.uuid = messages.sender_uuid
    INNER JOIN users u2 on u2.uuid = messages.reciever_uuid
    WHERE messages.chat_uuid = '${data.chat_uuid}' and messages.id=${chat_id} and messages.status = 1`;

                await knex.raw(query).then(response => {
                    if (response[0]) {
                        chat_messages = response[0];
                        status = 200;
                        message = 'Data has been fetched successfully!'
                        console.log(chat_messages);
                        socket.broadcast.emit('newMessageArrived', { chat_messages: chat_messages, chat_uuid: data.chat_uuid })
                        socket.emit('newMessageArrived', { chat_messages: chat_messages, chat_uuid: data.chat_uuid })
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))
    })

    socket.on('disconnect', async () => {
        let user_uuid;
        await knex('users').where('id', socket.user_id).update({
            online_status: 0
        }).then(async response => {
            if (response) {
                await knex('users').where('id', socket.user_id).then(response => {
                    if (response.length > 0) {
                        user_uuid = response[0].uuid;
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))


        if (user_uuid) {
            let chat_list = [];

            let query = `SELECT chats.uuid as chat_uuid,chats.person1_uuid,chats.person2_uuid,u1.online_status as person1_status,u2.online_status as person2_status FROM chats
    INNER JOIN users u1 on u1.uuid = chats.person1_uuid
    INNER JOIN users u2 on u2.uuid = chats.person2_uuid
    WHERE (chats.person1_uuid = '${user_uuid}' OR chats.person2_uuid = '${user_uuid}') and chats.status = 1 ORDER by chats.updated_at DESC`;

            await knex.raw(query).then(response => {
                if (response) {
                    chat_list = response[0];
                    status = 200;
                    message = 'Data fetch successfully!';

                    socket.broadcast.emit('statusServer', { chat_list })
                }
            }).catch(err => console.log(err))
        }

    })

    socket.on('messageSeen', async (data) => {
        await knex('messages').where('chat_uuid', data.data).where('reciever_uuid', data.user_uuid).where('message_status', 0).where('status', 1).update({
            message_status: 1
        }).then(response => {
            if (response) {

                socket.emit('messageReadServer', { chat_uuid: data.data, reciever_uuid: data.user_uuid })
                socket.broadcast.emit('messageReadServer', { chat_uuid: data.data, reciever_uuid: data.user_uuid })
            }
        }).catch(err => console.log(err))
    })

    socket.on('userOnline', async (data) => {
        socket.user_id = data.user_id;
        let user_uuid;
        await knex('users').where('id', data.user_id).update({
            online_status: 1
        }).then(async response => {
            if (response) {
                await knex('users').where('id', data.user_id).then(response => {
                    if (response.length > 0) {
                        user_uuid = response[0].uuid;
                    }
                }).catch(err => console.log(err))
            }
        }).catch(err => console.log(err))

        if (user_uuid) {
            let chat_list = [];

            let query = `SELECT chats.uuid as chat_uuid,chats.person1_uuid,chats.person2_uuid,u1.online_status as person1_status,u2.online_status as person2_status FROM chats
    INNER JOIN users u1 on u1.uuid = chats.person1_uuid
    INNER JOIN users u2 on u2.uuid = chats.person2_uuid
    WHERE (chats.person1_uuid = '${user_uuid}' OR chats.person2_uuid = '${user_uuid}') and chats.status = 1 ORDER by chats.updated_at DESC`;

            await knex.raw(query).then(response => {
                if (response) {
                    chat_list = response[0];
                    status = 200;
                    message = 'Data fetch successfully!';

                    socket.broadcast.emit('statusServer', { chat_list })
                }
            }).catch(err => console.log(err))
        }
    })


    socket.on('typing', (data) => {
        socket.broadcast.emit('typingReturn', data);
    })
})


app.post('/send-messsage', async (req, res) => {
    let data = req.body;
    let chat_id;
    let chat_messages = [];
    await knex('messages').insert(
        {
            uuid: await HELPERS.getKnexUuid(knex),
            chat_uuid: data.chat_uuid,
            message: data.message,
            sender_uuid: data.sender_uuid,
            sender_name: data.sender_name,
            reciever_uuid: data.reciver_uuid,
            reciever_name: data.reciver_name,
            status: 1,
            created_by: data.user_id,
            created_at: HELPERS.datetime()
        }, 'id'
    ).then(async response => {
        if (response) {
            chat_id = response[0];

            let query = `SELECT messages.id,messages.uuid,messages.chat_uuid,messages.message,messages.attachements,messages.sender_uuid,messages.sender_name,messages.reciever_uuid,messages.reciever_name,messages.status,messages.created_by,messages.created_at,u1.profile_image as sender_image,u2.profile_image as reciever_image FROM messages 
    INNER JOIN users u1 on u1.uuid = messages.sender_uuid
    INNER JOIN users u2 on u2.uuid = messages.reciever_uuid
    WHERE messages.chat_uuid = '${data.chat_uuid}' and messages.id = ${chat_id} and messages.status = 1`;

            await knex.raw(query).then(async response => {
                if (response[0]) {
                    chat_messages = response[0];
                    console.log('chat_msg',chat_messages);
                    status = 200;
                    message = 'Data has been fetched successfully!'
                    await knex('users').where('uuid', data.reciver_uuid).select('online_status').then(response => {
                        if (response[0].online_status == 1) {
                            socket.broadcast.emit('newMessageArrived', { chat_messages: chat_messages, chat_uuid: data.chat_uuid, sender_uuid: data.sender_uuid })
                            socket.emit('newMessageArrived', { chat_messages: chat_messages, chat_uuid: data.chat_uuid, sender_uuid: data.sender_uuid })
                        }
                    })

                }
            }).catch(err => console.log(err))
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, chat_messages, chat_uuid: data.chat_uuid });
})

app.post('/submit-chat-attachement', Middlewares.checkAuth, async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let data = req.body;
    let icon = req.files[0];
    let chat_id;
    let chat_messages = [];

    await knex('messages').insert(
        {
            uuid: await HELPERS.getKnexUuid(knex),
            chat_uuid: data.chat_uuid,
            sender_uuid: data.sender_uuid,
            sender_name: data.sender_name,
            reciever_uuid: data.reciever_uuid,
            reciever_name: data.reciever_name,
            attachements: 'public/uploads/' + icon.filename,
            attachement_name: icon.originalname,
            status: 1,
            message_status: 0,
            created_by: data.user_id,
            created_at: HELPERS.datetime()
        }, 'id'
    ).then(async response => {
        if (response) {
            chat_id = response[0];

            let query = `SELECT messages.id,messages.uuid,messages.chat_uuid,messages.message,messages.attachements,messages.attachement_name,messages.sender_uuid,messages.sender_name,messages.reciever_uuid,messages.reciever_name,messages.status,messages.created_by,messages.created_at,u1.profile_image as sender_image,u2.profile_image as reciever_image FROM messages 
    INNER JOIN users u1 on u1.uuid = messages.sender_uuid
    INNER JOIN users u2 on u2.uuid = messages.reciever_uuid
    WHERE messages.chat_uuid = '${data.chat_uuid}' and messages.id = ${chat_id} and messages.status = 1`;

            await knex.raw(query).then(async response => {
                if (response[0]) {
                    chat_messages = response[0];
                    console.log('attach',chat_messages);
                    status = 200;
                    message = 'Data has been fetched successfully!'
                    socket.broadcast.emit('newMessageArrived', { chat_messages: chat_messages, chat_uuid: data.chat_uuid, sender_uuid: data.sender_uuid })
                    socket.emit('newMessageArrived', { chat_messages: chat_messages, chat_uuid: data.chat_uuid, sender_uuid: data.sender_uuid })

                }
            }).catch(err => console.log(err))
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, chat_messages, chat_uuid: data.chat_uuid })
})

app.use('/api', Router);

server.listen(port, () => console.log('Port is up', port))
