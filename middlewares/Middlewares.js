const jwt = require('jsonwebtoken');

function checkAuth(req,res,next){
    const auth_header = req.get('Authorization');

    if (!auth_header){
        return res.json({status : 401, message : 'Please login to perform action'});
    }

    let decode_token;

    try {
        decode_token=jwt.verify(auth_header,'Fiverr clone');
    } catch (error) {
        return res.json({
            status : 500,
            message : 'Oops something went wrong!'
        })
    }

    if (!decode_token){
        return res.json({
            status : 401,
            message : 'No authorization'
        })
    }

    req.user_data = decode_token.user_data;
    next();
}

module.exports = {
    checkAuth,
}