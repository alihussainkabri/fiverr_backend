const express = require('express');
const HELPERS = require('../Helpers/Helpers');
const CONFIGS = require('../configs/configs');

const router = express.Router();

//fetch gig list
router.getGigList = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let gig_list = [];

    await knex('gigs').where('user_id', req.user_data.id).where('status', '!=', 4).then(response => {
        if (response) {
            status = 200;
            message = 'Gig has been fetched successfully!';
            gig_list = response;
            console.log(response)
        }
    }).catch(err => console.log(err));

    return res.json({ status, message, gig_list })
}

//get gig details
router.getGigDetail = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';

    let { id } = req.params;

    let gig_header = {};
    let gig_pricing = [];

    let categories = [];
    let subcategories = [];

    await knex('categories').where('status', 1).then(response => {
        if (response) {
            status = 200;
            message = 'Data fetch successfully!';
            categories = response
        }
    }).catch(err => console.log(err))

    await knex('sub_categories').where('status', 1).then(response => {
        if (response) {
            status = 200;
            message = 'Sub category fetched successfully!';
            subcategories = response
        }
    }).catch(err => console.log(err))

    await knex('gigs').where('uuid', id).then(response => {
        if (response.length > 0) {
            gig_header = response[0];
            status = 200;
            message
        }
    }).catch(err => console.log(err))

    if (Object.keys(gig_header).length > 0) {
        await knex('gig_pricing').where('gig_id', gig_header.id).where('status', 1).then(response => {
            if (response) {
                gig_pricing = response
            }
        }).catch(err => console.log(err))
    }

    return res.json({ status, message, gig_header, gig_pricing, delivery_time: CONFIGS.delivery_time, revision_time: CONFIGS.revision_time, categories, subcategories })
}

// gig related needs
router.fetchGigNeeds = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let categories = [];
    let subcategories = [];

    await knex('categories').where('status', 1).then(response => {
        if (response) {
            status = 200;
            message = 'Data fetch successfully!';
            categories = response
        }
    }).catch(err => console.log(err))

    await knex('sub_categories').where('status', 1).then(response => {
        if (response) {
            status = 200;
            message = 'Sub category fetched successfully!';
            subcategories = response
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, categories, subcategories, delivery_time: CONFIGS.delivery_time, revision_time: CONFIGS.revision_time });
}

// this below will create the gig
router.createGig = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let gig_id = ''
    console.log(inputs);
    if (inputs.gig_id) {
        let update_obj = {
            title: inputs.title,
            category_id: inputs.category.split('-')[0],
            category_name: inputs.category.split('-')[1],
            subcategory_id: inputs.subcategory.split('-')[0],
            subcategory_name: inputs.subcategory.split('-')[1],
            updated_by: req.user_data.id,
            updated_at: HELPERS.datetime()
        }

        await knex('gigs').where('uuid', inputs.gig_id).update(update_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Data has been updated successfully!';
                gig_id = inputs.gig_id
            }
        }).catch(err => console.log(err))
    } else {
        let create_uuid = await HELPERS.getKnexUuid(knex);
        let create_obj = {
            uuid: create_uuid,
            title: inputs.title,
            user_id: req.user_data.id,
            status: 3,
            stage: 1,
            category_id: inputs.category.split('-')[0],
            category_name: inputs.category.split('-')[1],
            subcategory_id: inputs.subcategory.split('-')[0],
            subcategory_name: inputs.subcategory.split('-')[1],
            created_by: req.user_data.id,
            created_at: HELPERS.datetime()
        }

        await knex('gigs').insert(create_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Gig has been created!';
                gig_id = create_uuid;
            }
        }).catch(err => console.log(err))
    }

    return res.json({ status, message, gig_id })
}

// below will add price of gig
router.gigPricing = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let create_arr = [];
    let prev_arr = [];

    if (inputs.gig_id) {
        let basic = JSON.parse(inputs.basic);
        let standard = JSON.parse(inputs.standard);
        let premium = JSON.parse(inputs.premium);

        let basic_complete = 0;
        let standard_complete = 0;
        let premium_complete = 0;

        if (Object.keys(basic).length > 0) {
            basic_complete = 1;
        }

        if (Object.keys(standard).length > 0) {
            standard_complete = 1;
        }

        if (Object.keys(premium).length > 0) {
            premium_complete = 1;
        }

        let gig_header = {}

        await knex('gigs').where('uuid', inputs.gig_id).then(response => {
            gig_header = response[0];
        }).catch(err => console.log(err))

        if (Object.keys(gig_header).length > 0) {
            await knex('gig_pricing').where('gig_id', gig_header.id).where('status', 1).then(response => {
                if (response) {
                    prev_arr = response;
                }
            }).catch(err => console.log(err))
        }

        if (prev_arr.length > 0) {
            for (let i = 0; i < prev_arr.length; i++) {
                if (prev_arr[i].type == 'basic') {
                    if (basic.name && basic.text && basic.time && basic.revision && basic.price) {
                        let update_arr = {
                            package_name: basic.name,
                            package_description: basic.text,
                            delivery_time: basic.time,
                            revision: basic.revision,
                            price: basic.price,
                            updated_by: req.user_data.id,
                            updated_at: HELPERS.datetime()
                        }

                        await knex('gig_pricing').where('id', prev_arr[i].id).update(update_arr).then(response => {
                            if (response) {
                                basic_complete = 0;
                                status = 200;
                                message = 'Data updated successfully!'
                            }
                        }).catch(err => console.log(err))
                    }
                } else if (prev_arr[i].type == 'standard') {
                    if (standard.name && standard.text && standard.time && standard.revision && standard.price) {
                        let update_arr = {
                            package_name: standard.name,
                            package_description: standard.text,
                            delivery_time: standard.time,
                            revision: standard.revision,
                            price: standard.price,
                            updated_by: req.user_data.id,
                            updated_at: HELPERS.datetime()
                        }

                        await knex('gig_pricing').where('id', prev_arr[i].id).update(update_arr).then(response => {
                            if (response) {
                                standard_complete = 0;
                                status = 200;
                                message = 'Data updated successfully!'
                            }
                        }).catch(err => console.log(err))
                    }
                } else if (prev_arr[i].type == 'premium') {
                    if (premium.name && premium.text && premium.time && premium.revision && premium.price) {
                        let update_arr = {
                            package_name: premium.name,
                            package_description: premium.text,
                            delivery_time: premium.time,
                            revision: premium.revision,
                            price: premium.price,
                            updated_by: req.user_data.id,
                            updated_at: HELPERS.datetime()
                        }

                        await knex('gig_pricing').where('id', prev_arr[i].id).update(update_arr).then(response => {
                            if (response) {
                                status = 200;
                                message = 'Data updated successfully!';
                                premium_complete = 0;
                            }
                        }).catch(err => console.log(err))
                    }
                }
            }
        } else {
            if (basic.name && basic.text && basic.time && basic.revision && basic.price) {
                create_arr.push({
                    uuid: await HELPERS.getKnexUuid(knex),
                    type: 'basic',
                    package_name: basic.name,
                    package_description: basic.text,
                    delivery_time: basic.time,
                    revision: basic.revision,
                    price: basic.price,
                    status: 1,
                    gig_id: gig_header.id,
                    user_id: req.user_data.id,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                })

                basic_complete = 0;
            }

            if (standard.name && standard.text && standard.time && standard.revision && standard.price) {
                create_arr.push({
                    uuid: await HELPERS.getKnexUuid(knex),
                    type: 'standard',
                    package_name: standard.name,
                    package_description: standard.text,
                    delivery_time: standard.time,
                    revision: standard.revision,
                    price: standard.price,
                    status: 1,
                    gig_id: gig_header.id,
                    user_id: req.user_data.id,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                })
                standard_complete = 0;
            }

            if (premium.name && premium.text && premium.time && premium.revision && premium.price) {
                create_arr.push({
                    uuid: await HELPERS.getKnexUuid(knex),
                    type: 'premium',
                    package_name: premium.name,
                    package_description: premium.text,
                    delivery_time: premium.time,
                    revision: premium.revision,
                    price: premium.price,
                    status: 1,
                    gig_id: gig_header.id,
                    user_id: req.user_data.id,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                })
                premium_complete = 0;
            }

            if (create_arr.length > 0) {
                for (let i = 0; i < create_arr.length; i++) {
                    if (create_arr[i].id) {
                        // update
                    } else {
                        await knex('gig_pricing').insert(create_arr[i]).then(response => {
                            if (response) {
                                status = 200;
                                message = 'Pricing has been created successfully!'
                            }
                        }).catch(err => console.log(err))

                        await knex('gigs').where('gig_id', inputs.gig_id).update({
                            stage: 2,
                            updated_by: req.user_data.id,
                            updated_at: HELPERS.datetime()
                        }).then(response => {
                            if (response) {
                                // 
                            }
                        }).catch(err => console.log(err))
                    }
                }
            }
        }

        if (basic_complete == 1) {
            if (basic.name && basic.text && basic.time && basic.revision && basic.price) {
                let create_obj = {
                    uuid: await HELPERS.getKnexUuid(knex),
                    type: 'basic',
                    package_name: basic.name,
                    package_description: basic.text,
                    delivery_time: basic.time,
                    revision: basic.revision,
                    price: basic.price,
                    status: 1,
                    gig_id: gig_header.id,
                    user_id: req.user_data.id,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                }
                await knex('gig_pricing').insert(create_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Pricing has been created successfully!'
                        basic_complete = 0;
                    }
                }).catch(err => console.log(err))

                await knex('gigs').where('uuid', inputs.gig_id).update({
                    stage: 2,
                    updated_by: req.user_data.id,
                    updated_at: HELPERS.datetime()
                }).then(response => {
                    if (response) {
                        // 
                    }
                }).catch(err => console.log(err))
            }
        }

        if (standard_complete == 1) {
            if (standard.name && standard.text && standard.time && standard.revision && standard.price) {
                let standard_obj = {
                    uuid: await HELPERS.getKnexUuid(knex),
                    type: 'standard',
                    package_name: standard.name,
                    package_description: standard.text,
                    delivery_time: standard.time,
                    revision: standard.revision,
                    price: standard.price,
                    status: 1,
                    gig_id: gig_header.id,
                    user_id: req.user_data.id,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                }

                await knex('gig_pricing').insert(standard_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Pricing has been created successfully!'
                        standard_complete = 0;
                    }
                }).catch(err => console.log(err))

                await knex('gigs').where('uuid', inputs.gig_id).update({
                    stage: 2,
                    updated_by: req.user_data.id,
                    updated_at: HELPERS.datetime()
                }).then(response => {
                    if (response) {
                        // 
                    }
                }).catch(err => console.log(err))
            }
        }

        if (premium_complete == 1) {
            if (premium.name && premium.text && premium.time && premium.revision && premium.price) {
                let premium_obj = {
                    uuid: await HELPERS.getKnexUuid(knex),
                    type: 'premium',
                    package_name: premium.name,
                    package_description: premium.text,
                    delivery_time: premium.time,
                    revision: premium.revision,
                    price: premium.price,
                    status: 1,
                    gig_id: gig_header.id,
                    user_id: req.user_data.id,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                }

                await knex('gig_pricing').insert(premium_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Pricing has been created successfully!'
                        premium_complete = 0;
                    }
                }).catch(err => console.log(err))

                await knex('gigs').where('uuid', inputs.gig_id).update({
                    stage: 2,
                    updated_by: req.user_data.id,
                    updated_at: HELPERS.datetime()
                }).then(response => {
                    if (response) {
                        // 
                    }
                }).catch(err => console.log(err))
            }
        }

    } else {
        status = 300;
        message = 'Invalid Gig'
    }

    return res.json({ status, message, stage: 2 })
}

// description gig
router.submitDescription = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let stage = 2;

    let gig_object = {};

    await knex('gigs').where('uuid', req.params.id).then(response => {
        if (response.length > 0) {
            gig_object = response[0];
        }
    }).catch(err => console.log(err))

    if (Object.keys(gig_object).length > 0) {
        stage = gig_object.stage;
        let update_obj = {}

        if (stage <= 3) {
            update_obj = {
                'description': inputs.description,
                updated_by: req.user_data.id,
                updated_at: HELPERS.datetime(),
                stage: 3
            }
            stage = 3;
        } else if (stage > 3) {
            update_obj = {
                'description': inputs.description,
                updated_by: req.user_data.id,
                updated_at: HELPERS.datetime(),
            }
        }

        await knex('gigs').where('uuid', req.params.id).update(update_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Description has been updated successfully!'
            }
        }).catch(err => console.log(err))
    }

    return res.json({ status, message, stage })
}

// submit gallery
router.submitGallery = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let images = req.files;

    let inputs = req.body;
    let audio_arr = JSON.parse(inputs.audio);

    let audio1 = '';
    let audio2 = '';
    let audio3 = '';

    let img1 = '';
    let img2 = '';
    let img3 = '';


    if (images.length > 0) {

        for (let i = 0; i < images.length; i++) {
            if (images[i].fieldname == 'img1') {
                img1 = 'public/uploads/' + images[i].filename
            }
            if (images[i].fieldname == 'img2') {
                img2 = 'public/uploads/' + images[i].filename
            }
            if (images[i].fieldname == 'img3') {
                img3 = 'public/uploads/' + images[i].filename
            }
        }
        await knex('gigs').where('uuid', inputs.gig_id).update({
            gig_photo_1: img1,
            gig_photo_2: img2,
            gig_photo_3: img3,
            stage: 4,
            status: 1,
        }).then(response => {
            if (response) {
                status = 200;
                message = 'Data has been saved successfully!'
            }
        }).catch(err => console.log(err));
    }

    if (audio_arr.length > 0) {
        for (let i = 0; i < audio_arr.length; i++) {
            if (i == 0 && audio_arr[0].length > 0) {
                audio1 = audio_arr[0]
            }
            if (i == 1 && audio_arr[1].length > 0) {
                audio2 = audio_arr[1]
            }
            if (i == 2 && audio_arr[2].length > 0) {
                audio3 = audio_arr[2]
            }
        }
        await knex('gigs').where('uuid', inputs.gig_id).update({
            gig_audio_1: audio1,
            gig_audio_2: audio2,
            gig_audio_3: audio3,
            stage: 4,
            status: 1,
        }).then(response => {
            if (response) {
                status = 200;
                message = 'Data has been saved successfully!'
            }
        }).catch(err => console.log(err));
    }

    await knex('gigs').where('uuid', inputs.gig_id).update({
        video_link: inputs.video,
        stage: 4,
        status: 1
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Data has been saved successfully!'
        }
    }).catch(err => console.log(err));

    return res.json({ status, message, stage: 4 })
}

// this below route is to delete the pricing
router.deletePricing = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id, cond } = req.params;

    let gig_header = {};

    await knex('gigs').where('uuid',id).then(response=>{
        if (response){
            gig_header = response[0]
        }
    }).catch(err=>console.log(err))

    if (Object.keys(gig_header).length > 0){
        await knex('gig_pricing').where('status', 1).where('gig_id', id).where('type', cond).update({
            status: 4,
            deleted_by: req.user_data.id,
            deleted_at: HELPERS.datetime()
        }).then(response => {
            if (response) {
                status = 200;
                message = 'Pricing deleted successfully!';
            }
        }).catch(err => console.log(err))
    }
    
    return res.json({ status, message })
}

// this below will give the percentage
router.profilePercent = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let id = req.user_data.id;
    let current_percent = 0;

    await HELPERS.grabProfilePercent(id).then(response => {
        current_percent = response;
        status = 200;
        message = 'Percent fetch successfully!'
    })

    return res.json({ status, message, current_percent })
}

// this below will pause the gig
router.pauseController = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;

    await knex('gigs').where('uuid', id).update({
        status: 2,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Paused successfully!'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// this below will activate the gig
router.activateController = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;

    await knex('gigs').where('uuid', id).update({
        status: 1,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Activated successfully!'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// this below will delete the gig
router.deleteGigController = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;

    await knex('gigs').where('uuid', id).update({
        status: 4,
        deleted_by: req.user_data.id,
        deleted_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Activated successfully!'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// get gig preview
router.getGigPreview = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;
    let gig_header = {};
    let seller_info = {};
    let gig_pricing = [];
    let all_gigs = [];

    await knex('gigs').where('uuid', id).then(response => {
        if (response.length > 0) {
            gig_header = response[0];
            status = 200;
            message = 'Header has been grab successfully!';
        }
    }).catch(err => console.log(err));

    if (Object.keys(gig_header).length > 0) {
        await knex('users').where('id', gig_header.user_id).then(response => {
            if (response.length > 0) {
                seller_info = response[0];
                status = 200;
                message = 'seller info has been grab successfully!'
            }
        }).catch(err => console.log(err))

        await knex('gig_pricing').where('gig_id', gig_header.id).where('status', 1).then(response => {
            if (response) {
                gig_pricing = response;
                status = 200;
                message = 'Pricing has been grab successfully!';
            }
        }).catch(err => console.log(err))
    }

    let query = `SELECT gigs.title,gigs.gig_photo_1,gigs.id as gig_header_id,gigs.uuid as gig_header_uuid,gig_pricing.price,users.username,users.profile_image FROM gigs INNER JOIN gig_pricing on gigs.id = gig_pricing.gig_id
    INNER JOIN users on gigs.user_id = users.id
    WHERE gig_pricing.status = 1 and gig_pricing.type = 'basic' and gigs.uuid = '${id}'`

    await knex.raw(query).then(response => {
        if (response[0]) {
            all_gigs = response[0];
            status = 200;
            message = 'All gigs has been fetched successfully!'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, gig_header, gig_pricing, seller_info, all_gigs })
}

// this below route is used to get the gig list for home page
router.getGigListHomePage = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let gig_list = [];

    let query = `SELECT gigs.id,gigs.uuid,gigs.title,gigs.gig_photo_1,users.username,users.profile_image,gp.price FROM gigs
    INNER JOIN gig_pricing gp on gp.gig_id = gigs.id and gp.type = 'basic'
    INNER JOIN users on users.id = gigs.user_id
    WHERE gigs.status = 1 ORDER BY gigs.id DESC`;

    await knex.raw(query).then(response => {
        if (response[0]) {
            gig_list = response[0];
            status = 200;
            message = 'Data fetch successfully!'
        }
    }).catch(err => console.log(err));

    return res.json({ status, message, gig_list })
}

module.exports = router;