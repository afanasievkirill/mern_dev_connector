const {connectDb} = require("./helpers/db");
const {port, db} = require("./configuration");
const app = require('./app')

const client = require('prom-client')
const collectDefaultMetrics = client.collectDefaultMetrics
collectDefaultMetrics({ prefix: 'api:3001' })

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.send(await client.register.metrics());
})

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

