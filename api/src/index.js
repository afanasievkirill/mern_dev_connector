const {connectDb} = require("./helpers/db");
const {port, db} = require("./configuration");
const app = require('./app')

const startServer = () => {
    app.listen(port, () => {
        console.log(`Started api service on port: ${port}`);
        console.log(`Our db is connected: ${db}`);
    });
}

connectDb()
    .on(`error`, console.log)
    .on(`disconnected`, connectDb)
    .once('open', startServer);

