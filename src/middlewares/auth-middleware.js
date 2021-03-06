Users = require('../models/userModel')
const jwtConfig = require('../config/jwtConfig')
var constants = require('../library/utils/constants')
var jwt = require('jsonwebtoken');

exports.verifyJwt = function (req, res, next) {
    if (req.headers.authorization) {
        let jwtToken = req.headers.authorization;
        jwt.verify(jwtToken, jwtConfig.jwtSecret, function (err, payload) {
            if (err) {
                res.status(401).json({
                    ok: constants.requestResult.failure,
                    message: 'Unauthorized user!'
                });
            } else {
                Users.findOne({ _id: payload.id }, (err, user) => {
                    if (err) {
                        res.status(404).json({
                            ok: constants.requestResult.failure,
                            message: 'User not found'
                        })
                        return
                    }
                    if (!user) {
                        res.status(401).json({
                            ok: constants.requestResult.failure,
                            message: 'Unauthorized user!'
                        })
                        return
                    }
                    Object.assign(payload, { user: user })
                    req.decode = payload;
                    next();
                })
            }
        });
    } else {
        res.status(401).json({
            ok: constants.requestResult.failure,
            message: 'Unauthorized user!'
        });
    }
}