const mongoose = require('mongoose')
const {db} = require("../configuration")

module.exports.connectDb =  () => {
     mongoose.connect(db,
        {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        })
    return mongoose.connection
}