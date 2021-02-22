const express = require('express')
const router = express.Router()
const {check, validationResult} = require('express-validator/check')

const auth = require('../../midlleware/auth')
const User = require('../../models/User')
const Post = require('../../models/Posts')

// @router POST api/posts
// @desc   Create a post
// @access Private
router.post('/',
    [
        auth,
        [check('text', 'Text is required').not().isEmpty()]
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        try {
            const user = await User.findById(req.user.id).select('-password')
            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            })
            const post = await newPost.save()
            return res.status(201).json(post)
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server Error')
        }

    })

// @router GET api/posts
// @desc   Get all posts
// @access Private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({date: -1})
        return res.send(posts)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @router GET api/posts/:id
// @desc   Get post by ID
// @access Private
// TODO При передаче параметра :1 система возвращает Пост, ожидаемое поведение 404.
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({msg: 'Post not found'})
        }

        return res.send(post)
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'})
        }
        res.status(500).send('Server Error')
    }
})

// @router DELETE api/posts/:id
// @desc   Delete post by ID
// @access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({msg: 'Post not found'})
        }
        //Check user
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User is not authorized'})
        }

        await post.remove()
        return res.json({msg: 'Post removed'})
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'})
        }
        res.status(500).send('Server Error')
    }
})

module.exports = router;