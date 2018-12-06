require('shieldfy-nodejs-client').start({
    appKey:'appkey',
    appSecret:'123456'
});

const express = require('express')
const app = express()
const port = 3000

app.get('/xss', (req, res) => res.send('Hello xss => ' + req.query.xss))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))