const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')

module.exports.login = async function (req,res) {
    const candidate = await User.findOne({
        email: req.body.email
    })

    if (candidate) {
        // Перевірка Паролю
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
        if (passwordResult) {
            // Token Generation
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 3600})

            res.status(200).json({
                token: `Bearer ${token}`
            })
        }
        else {
            res.status(401).json({
                message: 'Password doesnt match'
            })
        }
    }
    else {
        res.status(404).json({
            message: 'User not found'
        })
    }
}

module.exports.register = async function (req, res) {
    // email password

    const candidate = await User.findOne({email: req.body.email})

    if(candidate) {
        // Користувач існyє, треба відправити помилку
        res.status(409).json({
            message: 'email_in_used'
        })
    } else {
        // треба створити користувача
        const salt = bcrypt.genSaltSync(10)
        const password = req.body.password

        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        })

        try {
            await user.save()
            res.status(201).json(user)
        } catch (e) {
            // Опрацювати помилку
            errorHandler(e, res)
        }
    }
}