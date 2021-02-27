const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')

const auth = require('../../midlleware/auth')
const User = require('../../models/User')
const {jwtSecret} = require('../../configuration/index')

// @router GET api/auth
// @desc   Get usr by token
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @router POST api/auth
// @desc   Authenticate user and get token
// @access Public
router.post('/',
    [
        check('email', 'Please include valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        console.log(req.body)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        const {email, password} = req.body
        try {
            // See if user exists
            let user = await User.findOne({email})
            if (!user) {
                return res.status(400)
                    .json({errors: [{msg: 'Invalid Credentials'}]})
            }

            // Validation password
            const isMatch = await bcrypt.compare(password, user.password)

            if(!isMatch){
                return res.status(400)
                    .json({errors: [{msg: 'Invalid Credentials'}]})
            }

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
                    res.json({token})
                }
            )

        } catch (err) {
            console.log(err.message)
            res.status(500).send('Server error')
        }
    })

module.exports = router;