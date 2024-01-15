const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const axios = require('axios');

const app = express();

const port = 9090;
const keycloakPort = 8082;
const backendPort = 8080;

app.use(bodyParser.urlencoded({extended: false}));

// GET / is the welcome page where the user has to login 
app.get('/', (req, res) => {

    const baseURL = `http://localhost:${keycloakPort}/realms/dev/protocol/openid-connect/auth`;
    const clientID = 'puppet-master';
    const state = uuid.v4();
    const nonce = uuid.v4();
    const responseMode = 'query';
    const responseType = 'code';
    const scope = 'openid';
    const redirectURI = `http://localhost:${port}/keycloak`;

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
app.get('/keycloak', async (req, res) => {
    const error = req.query['error']
    if (error != undefined) {
        res.send(`keycloak sent back an error: ${error}`)
        return
    }

    req.query.redirect_uri = `http://localhost:${port}/keycloak`
    let jsonBody = JSON.stringify(req.query)
    console.log(jsonBody)

    
    let response = null
    try {
        response = await axios.put(
            `http://localhost:${backendPort}/v1/public/keycloak/get_access_token_from_auth_code`,
            jsonBody, 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
    } catch (error) {
        // console.log(error)
        res.send(`error while getting access token: ${error}`)
        return
    }
    
    const accessToken = response.data.access_token
    res.send(`login succeeded, access token: ${accessToken}`)
})

try {
    app.listen(port);
} catch (error) {
    console.log(error);
}