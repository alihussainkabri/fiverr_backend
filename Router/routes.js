const express = require('express');
const AuthenitcationController = require('../Controllers/AuthController');
const ProfileController = require('../Controllers/ProfileController');
const GIGController = require('../Controllers/GigController');
const MessageController = require('../Controllers/MessageController');
const Middlewares = require('../middlewares/Middlewares');
const ContractController = require('../Controllers/ContractController');

const router = express.Router();

// Authentication related routes
router.post('/check-email', AuthenitcationController.checkEmail)
router.post('/signup', AuthenitcationController.signUp);
router.get('/verify/:token/:uuid', AuthenitcationController.verifyUser);
router.post('/login', AuthenitcationController.login);
router.post('/reset-password', AuthenitcationController.resetPassword);
router.get('/reset-password-verify/:token/:uuid', AuthenitcationController.verifyEmailReset);
router.post('/reset-password-input', AuthenitcationController.reset_password_input);

// Profile related routes
router.post('/update-profile/image',Middlewares.checkAuth,ProfileController.addUpdateImg);
router.post('/update-profile/description',Middlewares.checkAuth,ProfileController.addDescription);

    //below is profile related language route
router.get('/fetch-profile-needs',Middlewares.checkAuth,ProfileController.getLanguageList);
router.post('/add-language-user',Middlewares.checkAuth,ProfileController.addLanguageUser);
router.get('/user-based-language',Middlewares.checkAuth,ProfileController.getUserBasedLanguage);
router.get('/delete-user-based-language/:id',Middlewares.checkAuth,ProfileController.deleteUserBasedLanguage);
router.post('/edit-user-language/:id',Middlewares.checkAuth,ProfileController.editLanguage);

    // below are profile related certificate routes
router.post('/add-certification-user',Middlewares.checkAuth,ProfileController.addCertification);
router.get('/certificationlist-user',Middlewares.checkAuth,ProfileController.getCertificationList);
router.get('/delete-certification-user/:id',Middlewares.checkAuth,ProfileController.deleteCertification);
router.post('/edit-certification-user/:id',Middlewares.checkAuth,ProfileController.editCertification);

    // below are profile related education routes
router.get('/fetch-education-need',Middlewares.checkAuth,ProfileController.fetchEducationNeeds);
router.post('/add-education-user',Middlewares.checkAuth,ProfileController.addEducationUser);
router.post('/edit-user-education/:id',Middlewares.checkAuth,ProfileController.editEducationUser);
router.get('/delete-user-based-education/:id',Middlewares.checkAuth,ProfileController.deleteEducation);

    //below routes are skill related
router.get('/fetch-skills-need',Middlewares.checkAuth,ProfileController.fetchSkillNeeds);
router.post('/add-skill-user',Middlewares.checkAuth,ProfileController.addSkillUser);
router.post('/edit-skill-user/:id',Middlewares.checkAuth,ProfileController.editSkill);
router.get('/delete-skill-user/:id',Middlewares.checkAuth,ProfileController.deleteSkillUser);
router.post('/add-create-skill-user',Middlewares.checkAuth,ProfileController.addNewSkillUser);
router.post('/add-story-profile-user',Middlewares.checkAuth,ProfileController.addStory)

// Pagination profile routes
router.post('/update-personal-info',Middlewares.checkAuth,ProfileController.addPersonalInfo);
router.get('/fetch-professional-data',Middlewares.checkAuth,ProfileController.fetchProfessionalData);
router.post('/add-professional-information',Middlewares.checkAuth,ProfileController.addProfessional);

// Gig related routes
router.get('/get-gig-list',Middlewares.checkAuth,GIGController.getGigList);
router.get('/get-gig-details/:id',Middlewares.checkAuth,GIGController.getGigDetail);
router.post('/submit-gallery-gig',Middlewares.checkAuth,GIGController.submitGallery);
router.get('/fetch-gig-related-needs',Middlewares.checkAuth,GIGController.fetchGigNeeds);
router.post('/create-gig',Middlewares.checkAuth,GIGController.createGig);
router.post('/create-gig-pricing',Middlewares.checkAuth,GIGController.gigPricing);
router.get('/delete-gig-pricing/:id/:cond',Middlewares.checkAuth,GIGController.deletePricing);
router.get('/profile-percent',Middlewares.checkAuth,GIGController.profilePercent);
router.get('/pause-gig/:id',Middlewares.checkAuth,GIGController.pauseController);
router.get('/activate-gig/:id',Middlewares.checkAuth,GIGController.activateController);
router.get('/delete-gig/:id',Middlewares.checkAuth,GIGController.deleteGigController);
router.post('/submit-description-gig/:id',Middlewares.checkAuth,GIGController.submitDescription);
router.get('/get-gig-preview/:id',Middlewares.checkAuth,GIGController.getGigPreview);
router.get('/get-gig-list-home',GIGController.getGigListHomePage);

// Message related routes
router.get('/fetch-message-needs',Middlewares.checkAuth,MessageController.fetchMessageNeeds)
router.post('/submit-message-modal',Middlewares.checkAuth,MessageController.submitMessageModal);
router.get('/fetch-messages-chatuuid/:uuid',Middlewares.checkAuth,MessageController.fetchMessagesChatUuid);

// Contract Controller
router.post('/create-contract',Middlewares.checkAuth,ContractController.createContract);
router.get('/contract-list/:uuid',Middlewares.checkAuth,ContractController.fetchContractList);
router.get('/contract-detail/:contract_uuid',Middlewares.checkAuth,ContractController.contractDetail);
router.post('/decline-contract',Middlewares.checkAuth,ContractController.declineContract);
router.post('/accept-contract',Middlewares.checkAuth,ContractController.acceptContract);
router.post('/submit-end-contract-form',Middlewares.checkAuth,ContractController.endContractPost);

module.exports = router;