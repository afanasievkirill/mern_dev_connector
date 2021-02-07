const express = require("express")

const app = express()

//Init middleware
app.use(express.json({extended: false}))

//define routes
app.use('/auth' ,require('./routes/api/auth'))
app.use('/posts' ,require('./routes/api/posts'))
app.use('/profile' ,require('./routes/api/profile'))
app.use('/users' ,require('./routes/api/users'))

module.exports = app