const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

// GET / is the welcome page where the user has to login 
app.get('/', (req, res) => {

    const baseURL = 'http://localhost:55109/realms/dev/protocol/openid-connect/auth';
    const clientID = 'puppet-master';
    const state = uuid.v4();
    const nonce = uuid.v4();
    const responseMode = 'query';
    const responseType = 'code';
    const scope = 'openid';
    const redirectURI = `http://localhost:3000/keycloak`;

    var url = baseURL
    + '?client_id=' + encodeURIComponent(clientID)
    + '&redirect_uri=' + encodeURIComponent(redirectURI)
    + '&state=' + encodeURIComponent(state)
    + '&response_mode=' + encodeURIComponent(responseMode)
    + '&response_type=' + encodeURIComponent(responseType)
    + '&scope=' + encodeURIComponent(scope)
    + '&nonce=' + encodeURIComponent(nonce);

    
    res.send(`
        <h1>Hello</h1>
        <a href="${url}">Click here to login</a>
    `)
});

// GET /keycloak is the callback handler the user is sent to after a successful login on keycloak 
app.get('/keycloak', (req, res) => {
    const error = req.query['error']
    if (error != undefined) {
        res.send(`keycloak sent back an error: ${error}`)
        return
    }
    
    let jsonBody = JSON.stringify(req.query)
    console.log(jsonBody)
    
    //TODO: send that to the backend through axios and get back the access token

    res.send(`login succeeded`)
})

app.listen(3000);