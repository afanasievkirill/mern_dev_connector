const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')

const User = require('../../models/User')
const {jwtSecret} = require('../../configuration/index')

// @router POST api/user
// @desc   Register user
// @access Public
router.post('/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include valid email').isEmail(),
        check('password', 'Please enter password with 6 or more characters').isLength({min: 6})
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        const {name, email, password} = req.body
        try {
            // See if user exists
            let user = await User.findOne({email})
            if (user) {
                return res.status(400)
                    .json({errors: [{msg: 'User already exists'}]})
            }

            // Get user gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })
            user = new User({
                name,
                email,
                avatar,
                password
            })

            // Encrypt password
            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            await user.save()

            // Return jsonWebToken
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(
                payload,
                jwtSecret,
                {expiresIn: 3600},
                (err, token) => {
                    if (err) throw err
                    res.status(201).json({token})
                }
            )

        } catch (err) {
            console.log(err.message)
            res.status(500).send('Server error')
        }
    })

module.exports = router;