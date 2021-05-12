const express = require('express');
const HELPERS = require('../Helpers/Helpers');
const CONFIGS = require('../configs/configs');
const { response } = require('express');

const router = express.Router();

// this below will upload the image
router.addUpdateImg = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let image = req.files[0];
    let new_img_path = '';
    if (image) {
        new_img_path = 'public/uploads/' + image.filename;

        let user_id = req.user_data.id;
        await knex('users').where('id', user_id).update({
            profile_image: new_img_path,
            updated_by: user_id,
            updated_at: HELPERS.datetime()
        }).then(response => {
            if (response) {
                status = 200;
                message = 'Profile image has been added successfully!';
            }
        }).catch(err => console.log(err));
    }

    return res.json({ status, message })
}

//this below function is to add description
router.addDescription = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    await knex('users').where('id', req.user_data.id).update({
        description: inputs.description,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Description added successfully!'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}

// fetching the needs

router.getLanguageList = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let language_list = [];
    let user_data = {};

    await knex('languages').where('status', 1).then(response => {
        if (response) {
            status = 200;
            language_list = response;
            message = 'Data fetch successfully!'
        }
    }).catch(err => console.log(err))

    await knex('users').where('id', req.user_data.id).then(response => {
        if (response) {
            user_data = response[0];
            status = 200;
            message = 'User has been fetched successfully!';
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, language_list, user_data })
}

// this function will get user based language list
router.getUserBasedLanguage = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let user_language_list = [];
    let all_languages = [];
    let user_data = {};

    await knex('language_user').where('user_id', req.user_data.id).where('status', 1).then(response => {
        if (response) {
            status = 200;
            message = 'Language has been created succesfully!';
            user_language_list = response;
        }
    }).catch(err => console.log(err));

    await knex('languages').where('status', 1).orderBy('english_name', 'asc').then(response => {
        if (response) {
            all_languages = response;
            status = 200;
            message = 'Language has been fetched successfully!';
        }
    }).catch(err => console.log(err))

    await knex('users').where('id', req.user_data.id).then(response => {
        if (response.length > 0) {
            user_data = response[0];
            status = 200;
            message = 'User has been fetched successfully!'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, user_language_list, all_languages, user_data })
}

// this below function will add language to user
router.addLanguageUser = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let language_data = {};
    let user_language_list = [];

    await knex('languages').where('english_name', inputs.language).then(response => {
        if (response.length > 0) {
            language_data = response[0];
        }
    }).catch(err => console.log(err))

    if (Object.keys(language_data).length > 0) {
        let create_obj = {
            uuid: await HELPERS.getKnexUuid(knex),
            user_id: req.user_data.id,
            language_id: language_data.id,
            language_name: language_data.english_name,
            regional_name: language_data.regional_name,
            level: inputs.level,
            status: 1,
            created_by: req.user_data.id,
            created_at: HELPERS.datetime()
        };

        await knex('language_user').insert(create_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Language has been created succesfully!'
            }
        }).catch(err => console.log(err));

        if (status == 200) {
            await knex('language_user').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
                if (response) {
                    status = 200;
                    message = 'Language has been created succesfully!';
                    user_language_list = response;
                }
            }).catch(err => console.log(err));
        }
    }

    return res.json({ status, message, user_language_list });
}

// delete user based language
router.deleteUserBasedLanguage = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;
    let user_language_list = [];

    await knex('language_user').where('id', id).update({
        status: 4,
        deleted_by: req.user_data.id,
        deleted_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Oops something went wrong';
        }
    }).catch(err => console.log(err))

    if (status == 200) {
        await knex('language_user').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
            if (response) {
                status = 200;
                message = 'Language has been created succesfully!';
                user_language_list = response;
            }
        }).catch(err => console.log(err));
    }
    return res.json({ status, message, user_language_list })
}

// edit language user based
router.editLanguage = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let language_data = {};
    let user_language_list = [];
    let { id } = req.params;

    await knex('languages').where('english_name', inputs.language).then(response => {
        if (response.length > 0) {
            language_data = response[0];
        }
    }).catch(err => console.log(err))

    if (Object.keys(language_data).length > 0) {
        let create_obj = {
            language_id: language_data.id,
            language_name: language_data.english_name,
            regional_name: language_data.regional_name,
            level: inputs.level,
            updated_by: req.user_data.id,
            updated_at: HELPERS.datetime()
        };

        await knex('language_user').where('id', id).update(create_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Language has been updated succesfully!'
            }
        }).catch(err => console.log(err));

        if (status == 200) {
            await knex('language_user').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
                if (response) {
                    status = 200;
                    message = 'Language has been created succesfully!';
                    user_language_list = response;
                }
            }).catch(err => console.log(err));
        }
    }

    return res.json({ status, message, user_language_list });
}

// this below will get list of all certificates
router.getCertificationList = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let user_certification_list = [];

    await knex('certifications').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
        if (response) {
            status = 200;
            message = 'certification has been fetched succesfully!';
            user_certification_list = response;
        }
    }).catch(err => console.log(err));

    return res.json({ status, message, user_certification_list })
}

// this below will create the certification
router.addCertification = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let user_certification_list = [];

    let create_obj = {
        uuid: await HELPERS.getKnexUuid(knex),
        user_id: req.user_data.id,
        certificate_or_award: inputs.certificate,
        certified_from: inputs.from,
        year: inputs.year,
        status: 1,
        created_by: req.user_data.id,
        created_at: HELPERS.datetime()
    };

    await knex('certifications').insert(create_obj).then(response => {
        if (response) {
            status = 200;
            message = 'Certificate has been created succesfully!'
        }
    }).catch(err => console.log(err));

    if (status == 200) {
        await knex('certifications').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
            if (response) {
                status = 200;
                message = 'certification has been fetched succesfully!';
                user_certification_list = response;
            }
        }).catch(err => console.log(err));
    }
    return res.json({ status, message, user_certification_list });
}

// this below will delete the certificate
router.deleteCertification = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;
    let user_certification_list = [];

    await knex('certifications').where('id', id).update({
        status: 4,
        deleted_by: req.user_data.id,
        deleted_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Oops something went wrong';
        }
    }).catch(err => console.log(err))

    if (status == 200) {
        await knex('certifications').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
            if (response) {
                status = 200;
                message = 'certification has been fetched succesfully!';
                user_certification_list = response;
            }
        }).catch(err => console.log(err));
    }
    return res.json({ status, message, user_certification_list })
}

// this below will edit the certification data
router.editCertification = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let user_certification_list = [];
    let { id } = req.params;

    let create_obj = {
        certificate_or_award: inputs.certificate,
        certified_from: inputs.from,
        year: inputs.year,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    };

    await knex('certifications').where('id', id).update(create_obj).then(response => {
        if (response) {
            status = 200;
            message = 'Certificate has been updated succesfully!'
        }
    }).catch(err => console.log(err));

    if (status == 200) {
        await knex('certifications').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
            if (response) {
                status = 200;
                message = 'certification has been fetched succesfully!';
                user_certification_list = response;
            }
        }).catch(err => console.log(err));
    }
    return res.json({ status, message, user_certification_list });
}

// this below function will fech the education needs
router.fetchEducationNeeds = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let title_list = CONFIGS.college_university_title;
    let college_university_user = [];
    let college_university = [];

    await knex('college_universities').where('status', 1).orderBy('name', 'asc').then(response => {
        if (response) {
            college_university = response;
        }
    }).catch(err => console.log(err));

    await knex('collegeuniversity_user').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
        if (response) {
            college_university_user = response;
            status = 200;
            message = 'Data has been fetched successfully!';
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, title_list, college_university, college_university_user });
}

//this below route will add education to user
router.addEducationUser = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let current_college_university = {};
    let college_university_user = [];

    await knex('college_universities').where('name', inputs.college_university).then(response => {
        if (response.length > 0) {
            current_college_university = response[0];
        } else {
            status = 500;
            message = 'Unable to verify college/University name please try again!';
        }
    }).catch(err => console.log(err))

    if (Object.keys(current_college_university).length > 0) {
        let create_obj = {
            uuid: await HELPERS.getKnexUuid(knex),
            user_id: req.user_data.id,
            college_university_id: current_college_university.id,
            college_university_name: current_college_university.name,
            major: inputs.major,
            title: inputs.title,
            graduation_year: inputs.year,
            status: 1,
            created_by: req.user_data.id,
            created_at: HELPERS.datetime()
        }

        await knex('collegeuniversity_user').insert(create_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Education has been added successfully!';
            }
        }).catch(err => console.log(err))

        if (status == 200) {
            await knex('collegeuniversity_user').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
                if (response) {
                    college_university_user = response;
                    status = 200;
                    message = 'Data has been fetched successfully!';
                }
            }).catch(err => console.log(err))
        }
    }

    return res.json({ status, message, college_university_user });
}

//this below will edit the education
router.editEducationUser = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let college_university_user = [];


    let create_obj = {
        major: inputs.major,
        title: inputs.title,
        graduation_year: inputs.year,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    }

    await knex('collegeuniversity_user').where('id', req.params.id).update(create_obj).then(response => {
        if (response) {
            status = 200;
            message = 'Education has been updated successfully!';
        }
    }).catch(err => console.log(err))

    if (status == 200) {
        await knex('collegeuniversity_user').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
            if (response) {
                college_university_user = response;
                status = 200;
                message = 'Data has been fetched successfully!';
            }
        }).catch(err => console.log(err))
    }


    return res.json({ status, message, college_university_user });
}

// this below function will delete the education
router.deleteEducation = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let { id } = req.params;
    let college_university_user = [];

    await knex('collegeuniversity_user').where('id', id).update({
        status: 4,
        deleted_by: req.user_data.id,
        deleted_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Oops something went wrong';
        }
    }).catch(err => console.log(err))

    if (status == 200) {
        await knex('collegeuniversity_user').where('user_id', req.user_data.id).where('status', 1).orderBy('id', 'desc').then(response => {
            if (response) {
                status = 200;
                message = 'certification has been fetched succesfully!';
                college_university_user = response;
            }
        }).catch(err => console.log(err));
    }
    return res.json({ status, message, college_university_user })
}

// this below function is to get the needs for skills
router.fetchSkillNeeds = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let skills_list = [];
    let user_skills = [];
    let query = `SELECT su.id,su.skill_name,su.level,sk.status as skill_status FROM skills_user su INNER JOIN skills sk on su.skill_id=sk.id WHERE su.status = 1 and su.user_id=${req.user_data.id} order by su.id DESC`;

    await knex('skills').where('status', 1).then(response => {
        if (response) {
            status = 200;
            message = 'Skill has been fetched successfully!';
            skills_list = response;
        }
    }).catch(err => console.log(err))

    await knex.raw(query).then(response => {
        if (response[0]) {
            status = 200;
            message = 'Skill has been fetched successfully!';
            user_skills = response[0];
        }
    }).catch(err => console.log(err))

    return res.json({ status, message, skills_list, user_skills })
}

// this below function is used to add the skill
router.addSkillUser = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let skill_object = {};
    let user_skills = [];

    await knex('skills').where('name', inputs.skills).where('status', 1).then(response => {
        if (response.length > 0) {
            status = 200;
            message = 'Skill has been fetched successfully!';
            skill_object = response[0];
        }
    }).catch(err => console.log(err))

    if (Object.keys(skill_object).length > 0) {
        let create_obj = {
            uuid: await HELPERS.getKnexUuid(knex),
            user_id: req.user_data.id,
            skill_name: skill_object.name,
            skill_id: skill_object.id,
            level: inputs.level,
            status: 1,
            created_by: req.user_data.id,
            created_at: HELPERS.datetime(),
        }

        await knex('skills_user').insert(create_obj).then(response => {
            if (response) {
                status = 200;
                message = 'Skill has been added successfully!';
            }
        }).catch(err => console.log(err))

        if (status == 200) {
            let query = `SELECT su.id,su.skill_name,su.level,sk.status as skill_status FROM skills_user su INNER JOIN skills sk on su.skill_id=sk.id WHERE su.status = 1 and su.user_id=${req.user_data.id} order by su.id DESC`
            await knex.raw(query).then(response => {
                if (response[0]) {
                    status = 200;
                    message = 'Skill has been fetched successfully!';
                    user_skills = response[0];
                }
            }).catch(err => console.log(err))
        }
    }
    return res.json({ status, message, user_skills })
}

// this below will edit the skill
router.editSkill = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let user_skills = [];

    let create_obj = {
        level: inputs.level,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime(),
    }

    await knex('skills_user').where('id', req.params.id).update(create_obj).then(response => {
        if (response) {
            status = 200;
            message = 'Skill has been updated successfully!';
        }
    }).catch(err => console.log(err))

    if (status == 200) {
        let query = `SELECT su.id,su.skill_name,su.level,sk.status as skill_status FROM skills_user su INNER JOIN skills sk on su.skill_id=sk.id WHERE su.status = 1 and su.user_id=${req.user_data.id} order by su.id DESC`
        await knex.raw(query).then(response => {
            if (response[0]) {
                status = 200;
                message = 'Skill has been fetched successfully!';
                user_skills = response[0];
            }
        }).catch(err => console.log(err))
    }

    return res.json({ status, message, user_skills })
}

//this below route will used to delete the skill
router.deleteSkillUser = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let user_skills = [];

    await knex('skills_user').where('id', req.params.id).update({
        status: 4,
        deleted_by: req.user_data.id,
        deleted_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Skill has been deleted successfully!';
        }
    }).catch(err => console.log(err))

    if (status == 200) {
        let query = `SELECT su.id,su.skill_name,su.level,sk.status as skill_status FROM skills_user su INNER JOIN skills sk on su.skill_id=sk.id WHERE su.status = 1 and su.user_id=${req.user_data.id} order by su.id DESC`
        await knex.raw(query).then(response => {
            if (response[0]) {
                status = 200;
                message = 'Skill has been fetched successfully!';
                user_skills = response[0];
            }
        }).catch(err => console.log(err))
    }

    return res.json({ status, message, user_skills })
}

// this below function will add new skill
router.addNewSkillUser = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let skill_obj = {};
    let skill_id;
    let user_skills = [];

    await knex('skills').where('name', inputs.skills).where('status', 1).then(response => {
        if (response.length > 0) {
            skill_obj = response[0];
            status = 500;
            message = 'Skill already exist with same name!';
        }
    }).catch(err => console.log(err))

    if (Object.keys(skill_obj).length <= 0) {
        let skill_obj = {
            uuid: await HELPERS.getKnexUuid(knex),
            name: inputs.skills.toUpperCase(),
            status: 2,
            created_by: req.user_data.id,
            created_at: HELPERS.datetime()
        }

        await knex('skills').insert(skill_obj, 'id').then(response => {
            if (response.length > 0) {
                skill_id = response[0];
                status = 300;
                message = 'Skill has been created successfully!'
            }
        }).catch(err => console.log(err))

        if (skill_id) {
            let user_skill_create = {
                uuid: await HELPERS.getKnexUuid(knex),
                user_id: req.user_data.id,
                skill_name: inputs.skills.toUpperCase(),
                skill_id: skill_id,
                level: inputs.level,
                status: 1,
                created_by: req.user_data.id,
                created_at: HELPERS.datetime(),
            }

            await knex('skills_user').insert(user_skill_create).then(response => {
                if (response) {
                    status = 200;
                    message = 'Skill has been added to user successfully!';
                }
            }).catch(err => console.log(err))


        }

        if (status == 200) {
            HELPERS.sendMail(CONFIGS.admin_email, 'new_skill', {
                skill_name: inputs.skills.toUpperCase(),
                created_by: req.user_data.username
            }, 'Approval/Rejection For Skill').then(response => {
                if (response) {
                    status = 200;
                    message = 'Email has been sent successfully!'
                }
            }).catch(err => console.log(err))

            let query = `SELECT su.id,su.skill_name,su.level,sk.status as skill_status FROM skills_user su INNER JOIN skills sk on su.skill_id=sk.id WHERE su.status = 1 and su.user_id=${req.user_data.id} order by su.id DESC`
            await knex.raw(query).then(response => {
                if (response[0]) {
                    status = 200;
                    message = 'Skill has been fetched successfully!';
                    user_skills = response[0];
                }
            }).catch(err => console.log(err))
        }
    }

    return res.json({ status, message, user_skills })
}

// this below will add story
router.addStory = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;

    await knex('users').where('id', req.user_data.id).update({
        story_line: inputs.story,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Story added successfully!'
        }
    }).catch(err => console.log(err))

    return res.json({ status, message })
}


// this below routes will be for all user complete pagination

// to add personal Info
router.addPersonalInfo = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let header = JSON.parse(inputs.headers);
    let languages = JSON.parse(inputs.languages);
    let user_prev_lang_arr = [];

    await knex('language_user').where('user_id', req.user_data.id).where('status', 1).select('id').then(response => {
        if (response) {
            for (let i = 0; i < response.length; i++) {
                user_prev_lang_arr.push(response[i].id);
            }
        }
    }).catch(err => console.log(err))

    // this will update the header

    let user_update_obj = {};

    if (req.files && req.files[0]){
        user_update_obj = {
            first_name: header.first_name,
            last_name: header.last_name,
            description: header.description,
            profile_image : 'public/uploads/' + req.files[0].filename,
            updated_by: req.user_data.id,
            updated_at: await HELPERS.datetime()
        }
    }else{
        user_update_obj = {
            first_name: header.first_name,
            last_name: header.last_name,
            description: header.description,
            updated_by: req.user_data.id,
            updated_at: await HELPERS.datetime()
        }
    }

    await knex('users').where('id', req.user_data.id).update(user_update_obj).then(response => {
        if (response) {
            status = 200;
            message = 'Data has been updated successfully!';
        }
    }).catch(err => console.log(err))

    // this below will update the language
    for (let i = 0; i < languages.length; i++) {
        if (user_prev_lang_arr.find(item => item == languages[i].id)) {
            let update_language_data = {};

            await knex('languages').where('english_name', languages[i].language_name).then(response => {
                if (response.length > 0) {
                    update_language_data = response[0];
                }
            }).catch(err => console.log(err))

            if (Object.keys(update_language_data).length > 0) {
                let create_obj = {
                    language_id: update_language_data.id,
                    language_name: update_language_data.english_name,
                    regional_name: update_language_data.regional_name,
                    level: languages[i].level,
                    updated_by: req.user_data.id,
                    updated_at: HELPERS.datetime()
                };

                await knex('language_user').where('id', languages[i].id).update(create_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Language has been updated succesfully!'
                    }
                }).catch(err => console.log(err));
            }

            let new_arr = [];
            user_prev_lang_arr.map(item => {
                if (item == languages[i].id) {
                    //
                } else {
                    new_arr.push(item)
                }
            })

            user_prev_lang_arr = new_arr;

        } else {
            let language_data = {};

            await knex('languages').where('english_name', languages[i].language_name).then(response => {
                if (response.length > 0) {
                    language_data = response[0];
                }
            }).catch(err => console.log(err))

            if (Object.keys(language_data).length > 0) {
                let create_obj = {
                    uuid: await HELPERS.getKnexUuid(knex),
                    user_id: req.user_data.id,
                    language_id: language_data.id,
                    language_name: language_data.english_name,
                    regional_name: language_data.regional_name,
                    level: languages[i].level,
                    status: 1,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                };

                await knex('language_user').insert(create_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Language has been created succesfully!'
                    }
                }).catch(err => console.log(err));
            }
        }
    }

    if (user_prev_lang_arr.length > 0) {
        user_prev_lang_arr.map(async item => {
            await knex('language_user').where('id', item).update({
                status: 4,
                deleted_by: req.user_data.id,
                deleted_at: HELPERS.datetime()
            }).then(response => {
                if (response) {
                    status = 200;
                    message = 'Data has been deleted successfully!';
                }
            }).catch(err => console.log(err))
        })
    }

    let profile_percent = 0;

    await HELPERS.grabProfilePercent(req.user_data.id).then(response => {
        profile_percent = response;
    }).catch(err => console.log(err))

    return res.json({ status, message, profile_percent })
}

// this below route is used to get the data for fetch professional things
router.fetchProfessionalData = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let all_skills = [];
    let all_college_university = [];
    let user_skills = [];
    let user_colleges = [];
    let user_certificate = [];
    let user_data = {};

    await knex('skills').where('status', 1).then(response => {
        if (response) {
            all_skills = response;
            status = 200;
            message = 'Skill has been fetched successfully!'
        }
    }).catch(err => console.log(err))

    await knex('college_universities').where('status', 1).then(response => {
        if (response) {
            all_college_university = response;
            status = 200;
            message = 'All college and university has been fetched successfully!'
        }
    }).catch(err => console.log(err))

    let query = `SELECT su.id,su.skill_name,su.level,sk.status as skill_status FROM skills_user su INNER JOIN skills sk on su.skill_id=sk.id WHERE su.status = 1 and su.user_id=${req.user_data.id}`;

    await knex.raw(query).then(response => {
        if (response[0]) {
            status = 200;
            message = 'Skill has been fetched successfully!';
            user_skills = response[0];
        }
    }).catch(err => console.log(err))

    await knex('collegeuniversity_user').where('status', 1).where('user_id',req.user_data.id).then(response => {
        if (response) {
            user_colleges = response;
            status = 200;
            message = 'College and university has been fetched successfully!'
        }
    }).catch(err => console.log(err))

    await knex('certifications').where('status', 1).where('user_id',req.user_data.id).then(response => {
        if (response) {
            status = 200;
            message = 'Certificate has been fetched successfully!';
            user_certificate = response;
        }
    }).catch(err => console.log(err))

    await knex('users').where('id',req.user_data.id).then(response=>{
        if (response){
            user_data = response[0];
        }
    })

    return res.json({ status, message, user_skills, user_colleges, all_college_university, all_skills, college_university_title: CONFIGS.college_university_title, user_certificate,user_data })
}


// this below routes is used to submit professional information
router.addProfessional = async (req, res) => {
    let status = 500;
    let message = 'Oops something went wrong!';
    let inputs = req.body;
    let parse_skills = JSON.parse(inputs.skills);
    let parse_education = JSON.parse(inputs.education);
    let parse_certificate = JSON.parse(inputs.certificate);

    let all_skills_id = [];
    let all_education_id = [];
    let all_certification_id = [];

    await knex('skills_user').where('user_id', req.user_data.id).where('status', 1).select('id').then(response => {
        if (response) {
            for (let i = 0; i < response.length; i++) {
                all_skills_id.push(response[i].id)
            }
        }
    }).catch(err => console.log(err))

    await knex('collegeuniversity_user').where('user_id', req.user_data.id).where('status', 1).select('id').then(response => {
        if (response) {
            for (let i = 0; i < response.length; i++) {
                all_education_id.push(response[i].id)
            }
        }
    }).catch(err => console.log(err))

    await knex('certifications').where('user_id', req.user_data.id).where('status', 1).then(response => {
        if (response) {
            for (let i = 0; i < response.length; i++) {
                all_certification_id.push(response[i].id)
            }
        }
    }).catch(err => console.log(err))


    //skill obj creation

    for (let i = 0; i < parse_skills.length; i++) {
        if (parse_skills[i].id) {
            if (all_skills_id.find(item => item == parse_skills[i].id)) {
                let skill_update_obj = {
                    level: parse_skills[i].level,
                    updated_by: req.user_data.id,
                    updated_at: HELPERS.datetime()
                }

                await knex('skills_user').where('id', parse_skills[i].id).update(skill_update_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Data updated successfully!'
                    }
                }).catch(err => console.log(err))

                let updated_arr = [];

                all_skills_id.map(item => {
                    if (item == parse_skills[i].id) {
                        //
                    } else {
                        updated_arr.push(item)
                    }
                })

                all_skills_id = updated_arr
            }
        } else {
            let skill_obj = {}
            await knex('skills').where('name', parse_skills[i].skill_name).where('status', 1).then(response => {
                if (response.length > 0) {
                    status = 200;
                    message = 'Skill has been fetched successfully!';
                    skill_obj = response[0];
                }
            }).catch(err => console.log(err))

            if (Object.keys(skill_obj).length > 0) {
                let create_obj = {
                    uuid: await HELPERS.getKnexUuid(knex),
                    user_id: req.user_data.id,
                    skill_name: skill_obj.name,
                    skill_id: skill_obj.id,
                    level: parse_skills[i].level,
                    status: 1,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime(),
                }

                await knex('skills_user').insert(create_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Skill has been added successfully!';
                    }
                }).catch(err => console.log(err))
            }else{
                let skill_id;
                let skill_obj = {
                    uuid: await HELPERS.getKnexUuid(knex),
                    name: parse_skills[i].skill_name,
                    status: 2,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                }
        
                await knex('skills').insert(skill_obj, 'id').then(response => {
                    if (response.length > 0) {
                        skill_id = response[0];
                        status = 300;
                        message = 'Skill has been created successfully!'
                    }
                }).catch(err => console.log(err))
        
                if (skill_id) {
                    let user_skill_create = {
                        uuid: await HELPERS.getKnexUuid(knex),
                        user_id: req.user_data.id,
                        skill_name: parse_skills[i].skill_name,
                        skill_id: skill_id,
                        level: parse_skills[i].level,
                        status: 1,
                        created_by: req.user_data.id,
                        created_at: HELPERS.datetime(),
                    }
        
                    await knex('skills_user').insert(user_skill_create).then(response => {
                        if (response) {
                            status = 200;
                            message = 'Skill has been added to user successfully!';
                            HELPERS.sendMail(CONFIGS.admin_email, 'new_skill', {
                                skill_name: parse_skills[i].skill_name,
                                created_by: req.user_data.username
                            }, 'Approval/Rejection For Skill').then(response => {
                                if (response) {
                                    status = 200;
                                    message = 'Email has been sent successfully!'
                                }
                            }).catch(err => console.log(err))
                        }
                    }).catch(err => console.log(err))
                }
            }
        }
    }


    // for education

    for (let i = 0; i < parse_education.length; i++) {
        if (parse_education[i].id) {
            if (all_education_id.find(item => item == parse_education[i].id)) {
                let education_update_obj = {
                    major: parse_skills[i].level,
                    title: parse_education[i].title,
                    graduation_year: parse_education[i].graduation_year,
                    updated_by: req.user_data.id,
                    updated_at: HELPERS.datetime()
                }

                await knex('collegeuniversity_user').where('id', parse_education[i].id).update(education_update_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Data updated successfully!'
                    }
                }).catch(err => console.log(err))

                let updated_arr = [];

                all_education_id.map(item => {
                    if (item == parse_education[i].id) {
                        //
                    } else {
                        updated_arr.push(item)
                    }
                })

                all_education_id = updated_arr;
            }
        } else {
            let education_obj = {}
            await knex('college_universities').where('name', parse_education[i].college_university_name).where('status', 1).then(response => {
                if (response.length > 0) {
                    status = 200;
                    message = 'Skill has been fetched successfully!';
                    education_obj = response[0];
                }
            }).catch(err => console.log(err))

            if (Object.keys(education_obj).length > 0) {
                let create_obj = {
                    uuid: await HELPERS.getKnexUuid(knex),
                    user_id: req.user_data.id,
                    college_university_id: education_obj.id,
                    college_university_name: education_obj.name,
                    major: parse_education[i].major,
                    title: parse_education[i].title,
                    graduation_year: parse_education[i].graduation_year,
                    status: 1,
                    created_by: req.user_data.id,
                    created_at: HELPERS.datetime()
                }

                await knex('collegeuniversity_user').insert(create_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Education has been added successfully!';
                    }
                }).catch(err => console.log(err))
            }
        }
    }

    // For certification

    for (let i = 0; i < parse_certificate.length; i++) {
        if (parse_certificate[i].id) {
            if (all_certification_id.find(item => item == parse_certificate[i].id)) {
                let create_obj = {
                    certificate_or_award: parse_certificate[i].certificate_or_award,
                    certified_from: parse_certificate[i].certified_from,
                    year: parse_certificate[i].year,
                    updated_by: req.user_data.id,
                    updated_at: HELPERS.datetime()
                };

                await knex('certifications').where('id', parse_certificate[i].id).update(create_obj).then(response => {
                    if (response) {
                        status = 200;
                        message = 'Certificate has been updated succesfully!'
                    }
                }).catch(err => console.log(err));

                let updated_arr = [];

                all_certification_id.map(item => {
                    if (item == parse_certificate[i].id) {
                        //
                    } else {
                        updated_arr.push(item)
                    }
                })

                all_certification_id = updated_arr;
            }
        } else {
            let create_obj = {
                uuid: await HELPERS.getKnexUuid(knex),
                user_id: req.user_data.id,
                certificate_or_award: parse_certificate[i].certificate_or_award,
                certified_from: parse_certificate[i].certified_from,
                year: parse_certificate[i].year,
                status: 1,
                created_by: req.user_data.id,
                created_at: HELPERS.datetime()
            };

            await knex('certifications').insert(create_obj).then(response => {
                if (response) {
                    status = 200;
                    message = 'Certificate has been created succesfully!'
                }
            }).catch(err => console.log(err));
        }
    }

    if (all_skills_id.length > 0) {
        all_skills_id.map(async item => {
            await knex('skills_user').where('id', item).update({
                status: 4,
                deleted_by: req.user_data.id,
                deleted_at: HELPERS.datetime()
            }).then(response => {
                if (response) {
                    status = 200;
                    message = 'Oops something went wrong!'
                }
            }).catch(err => console.log(err))
        })
    }

    if (all_education_id.length > 0) {
        all_education_id.map(async item => {
            await knex('collegeuniversity_user').where('id', item).update({
                status: 4,
                deleted_by: req.user_data.id,
                deleted_at: HELPERS.datetime()
            }).then(response => {
                if (response) {
                    status = 200;
                    message = 'Data deleted successfully!'
                }
            })
        })
    }

    if (all_certification_id.length > 0) {
        all_certification_id.map(async item => {
            await knex('certifications').where('id', item).update({
                status: 4,
                deleted_by: req.user_data.id,
                deleted_at: HELPERS.datetime()
            }).then(response => {
                if (response) {
                    status = 200;
                    message = 'Data deleted successfully!'
                }
            })
        })
    }

    await knex('users').where('id', req.user_data.id).update({
        personal_website: inputs.website_link,
        linkedin_url: inputs.linkedin_profile,
        updated_by: req.user_data.id,
        updated_at: HELPERS.datetime()
    }).then(response => {
        if (response) {
            status = 200;
            message = 'Data has been fetched successfully!'
        }
    }).catch(err => console.log(err))

    let profile_percent = 0;

    await HELPERS.grabProfilePercent(req.user_data.id).then(response => {
        profile_percent = response;
    }).catch(err => console.log(err))

    return res.json({ status, message, profile_percent })
}

module.exports = router;