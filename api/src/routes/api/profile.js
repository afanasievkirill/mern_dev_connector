const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator')

const Profile = require('../../models/Profile')
const User = require('../../models/User')
const auth = require('../../midlleware/auth')

//@router GET api/profile/me
//@desc   Get current users profile
//@access Private
router.get('/me',
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({user: req.user.id})
                .populate('user', ['name', 'avatar'])

            if (!profile) {
                return res.status(400).json({
                    msg: 'Profile not found'
                })
            }
            res.status(200).json(profile)
        } catch (err) {
            console.log(err.message)
            res.status(500).send('Server error')
        }
    })

//@router POST api/profile
//@desc   Create or update user profile
//@access Private
router.post('/',
    [
        auth,
        [
            check('status', 'Status is required').not().isEmpty(),
            check('skills', 'Skills is required').not().isEmpty(),

        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body

        // Build profile object
        const profileFields = {}
        profileFields.user = req.user.id
        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }

        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (facebook) profileFields.social.facebook = facebook
        if (twitter) profileFields.social.twitter = twitter
        if (instagram) profileFields.social.instagram = instagram
        if (linkedin) profileFields.social.linkedin = linkedin

        try {
            let profile = await Profile.findOne({user: req.user.id})

            // Update profile
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {new: true}
                )
                return res.json(profile)
            }

            // Create profile
            profile = new Profile(profileFields)
            await profile.save()
            return res.status(201).json(profile)
        } catch (err) {
            console.error(err.message)
            return res.status(500).send('Server Error')
        }
    })

//@router GET api/profile
//@desc   Get all profiles
//@access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})

//@router GET api/profile/user/:user_id
//@desc   Get profile by User ID
//@access Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id})
            .populate('user', ['name', 'avatar'])
        if (!profile) return res
            .status(400)
            .json({msg: 'Profile not found'})
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') {
            return res
                .status(400)
                .json({msg: 'Profile not found'})
        }
        return res.status(500).send('Server error')
    }
})

//@router DELETE api/profile
//@desc   Delete profile, user & posts
//@access Private
router.delete('/', auth, async (req, res) => {
    try {
        // TODO remove user posts

        // Remove profile
        await Profile.findOneAndRemove({user: req.user.id})
        // Remove user
        await User.findOneAndRemove({_id: req.user.id})
        res.json({msg: 'User removed'})
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})

module.exports = router;