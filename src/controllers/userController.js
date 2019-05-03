Users = require('../models/userModel')
const bcrypt = require('bcrypt-nodejs')
var multer = require('multer')
var projectConst = require('../library/utils/constants')
var jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig')

async function onCheckingPhone(phone) {
    let check
    await Users.findOne({ phone: phone }, function (err, user) {
        if (err) {
            console.log('SERVER ERROR', err)
            return false
        }
        if (Boolean(user)) {
            check = false
        } else {
            check = true
        }
    })
    return check
}

//upload formdata config
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/users')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({ storage: storage }).single('user_avatar')

//update profile
exports.updateProfile = (req, res) => {
    const user = req.decode.user
    if (!user) {
        res.status(401).json({
            ok: projectConst.requestResult.failure,
            message: 'Người dùng không hợp lệ',
        })
        return
    }
    upload(req, res, function (error) {
        if (error) {
            res.status(400).json({
                ok: 0,
                message: 'BAD REQUEST'
            })
            return
        }
        let validateCount = 0
        Object.keys(req.body).map(value => {
            if (!!req.body[value] && req.body[value] !== user[value]) {
                user[value] = req.body[value]
                console.log(123)
                validateCount++
            }
        })
        if (!!req.file && req.file.filename != user.avatar) {
            user.avatar = req.file.filename
            validateCount++
        }

        if (validateCount == 0) {
            res.status(400).json({
                ok: projectConst.requestResult.failure,
                message: 'Không có thông tin nào cần thay đổi'
            })
            return
        }
        user.save(function (err) {
            if (err) {
                res.status(500).json({ message: err });
                return
            }
            res.status(200).json({
                ok: projectConst.requestResult.success,
                message: 'Update thông tin thành công',
                data: user
            });
        });
    })
}

//Lấy thông tin tất cả người dùng
exports.getAll = (req, res) => {
    if (req.decode.admin) {
        Users.get((err, users) => {
            if (err) {
                res.status(500).json({
                    ok: projectConst.requestResult.failure,
                    message: err,
                });
                return
            }
            res.status(200).json({
                ok: projectConst.requestResult.success,
                message: "Lấy thông tin tất cả người dùng thành công",
                data: users
            });
        })
    } else {
        res.status(401).json({
            ok: projectConst.requestResult.failure,
            message: 'UNAUTHORIZED',
        })
    }

}

//Đăng ký
exports.create = async (req, res) => {
    let data = {
        phone: req.body.phone,
        name: req.body.name,
    }
    let password = req.body.password
    const checkPhone = await onCheckingPhone(req.body.phone)
    if (checkPhone) {
        bcrypt.hash(password, null, null, (err, hash_password) => {
            if (err) console.log(err, 'Lỗi')
            else {
                Object.assign(data, { hash_password })
                let user = new Users(data)
                user.save((err, newUser) => {
                    if (err) {
                        res.json({
                            ok: projectConst.requestResult.failure,
                            message: err
                        })
                        return
                    }
                    res.status(201).json({
                        ok: projectConst.requestResult.success,
                        message: 'Tạo mới thành công',
                        data: user
                    });
                })
            }
        })
    } else res.json({
        ok: projectConst.requestResult.failure,
        message: 'Số điện thoại này đã được sử dụng'
    })
}

//lấy thông tin cá nhân
exports.getProfile = (req, res) => {
    if (!req.decode.user) {
        res.status(401).json({
            ok: projectConst.requestResult.failure,
            message: 'Người dùng không hợp lệ',
        })
        return
    }
    res.status(200).json({
        ok: projectConst.requestResult.success,
        message: 'Lấy thông tin thành công',
        data: req.decode.user
    })
}

//đăng nhập
exports.login = (req, res) => {
    let phone = req.body.phone
    let password = req.body.password

    Users.findOne({ phone: phone }, (err, user) => {
        if (err) {
            res.status(500).json({
                ok: projectConst.requestResult.failure,
                message: 'Internal Server'
            })
            return
        }
        if (Boolean(user)) {
            bcrypt.compare(password, user.hash_password, (err, checkPass) => {
                if (err) {
                    res.status(500).json({
                        ok: projectConst.requestResult.failure,
                        message: 'Internal Server'
                    })
                    return
                }
                if (checkPass) {
                    let payload = {
                        phone: user.phone,
                        admin: user.admin,
                    }
                    jwt.sign(payload, jwtConfig.jwtSecret, { expiresIn: jwtConfig.expiresIn }, (err, token) => {
                        if (err) {
                            console.log(err)
                            return
                        }
                        res.status(200).json({
                            ok: projectConst.requestResult.success,
                            message: 'Đăng nhập thành công',
                            data: {
                                token: token,
                                info: user,
                            }
                        })
                    })
                } else {
                    res.json({
                        ok: projectConst.requestResult.failure,
                        message: 'Sai mật khẩu'
                    })
                }
            })
        } else res.json({
            ok: projectConst.requestResult.failure,
            message: 'Số điện thoại đăng nhập không tồn tại'
        })
    })
}