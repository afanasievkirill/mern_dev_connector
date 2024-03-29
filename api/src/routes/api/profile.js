const express = require('express')
const router = express.Router()
const request = require('request')
const {check, validationResult} = require('express-validator')

const Profile = require('../../models/Profile')
const Post = require('../../models/Posts')
const User = require('../../models/User')
const auth = require('../../midlleware/auth')
const {githubClientId, githubClientSecret} = require('../../configuration/index')

// @router GET api/profile/me
// @desc   Get current users profile
// @access Private
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
            res.json(profile)
        } catch (err) {
            console.log(err.message)
            res.status(500).send('Server error')
        }
    })

// @router POST api/profile
// @desc   Create or update user profile
// @access Private
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

// @router GET api/profile
// @desc   Get all profiles
// @access Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})

// @router GET api/profile/user/:user_id
// @desc   Get profile by User ID
// @access Public
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

// @router DELETE api/profile
// @desc   Delete profile, user & posts
// @access Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove user posts
        await Post.deleteMany({user: req.user.id})
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

// @router PUT api/profile/experience
// @desc   Add profile experience
// @access Private
router.put('/experience',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('company', 'Company is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body

        const newExperience = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({user: req.user.id})

            profile.experience.unshift(newExperience)

            await profile.save()

            return res.status(201).json(profile)
        } catch (err) {
            console.log(err.message)
            return res.status(500).send('Server Error')
        }
    })

// @router DELETE api/profile/experience/:exp_id
// @desc   Delete experience from profile
// @access Private
router.delete('/experience/:exp_id',
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({user: req.user.id})
            // Get remove index
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

            profile.experience.splice(removeIndex, 1)
            await profile.save()
            return res.json(profile)
        } catch (err) {
            console.log(err.message)
            return res.status(500).send('Server Error')
        }
    })

// @router PUT api/profile/education
// @desc   Add profile education
// @access Private
router.put('/education',
    [
        auth,
        [
            check('school', 'School is required').not().isEmpty(),
            check('degree', 'Degree is required').not().isEmpty(),
            check('fieldofstudy', 'Field of study is required').not().isEmpty(),
            check('from', 'From date is required').not().isEmpty(),
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        } = req.body

        const newEducation = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }

        try {
            const profile = await Profile.findOne({user: req.user.id})

            profile.education.unshift(newEducation)

            await profile.save()

            return res.status(201).json(profile)
        } catch (err) {
            console.log(err.message)
            return res.status(500).send('Server Error')
        }
    })

// @router DELETE api/profile/education/:edu_id
// @desc   Delete education from profile
// @access Private
router.delete('/education/:edu_id',
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({user: req.user.id})
            // Get remove index
            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

            profile.education.splice(removeIndex, 1)
            await profile.save()
            return res.json(profile)
        } catch (err) {
            console.log(err.message)
            return res.status(500).send('Server Error')
        }
    })

// @router GET api/profile/github/:username
// @desc   Get user repos from Github
// @access Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5
            &sort=created:asc&client_id=${githubClientId}&client_secret=${githubClientSecret}`,
            method: 'GET',
            headers: {'user-agent': 'node-js'}
        }
        request(options, (error, responce, body) => {
            if (error) console.error(error)
            if (responce.statusCode !== 200) {
                res.status(400).json({msg: "No Github profile found"})
            }
            res.json(JSON.parse(body))
        })
    } catch
        (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router