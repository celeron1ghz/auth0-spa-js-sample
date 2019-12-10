'use strict';

const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const util = require('util');

const AUTH0_DOMAIN  = 'https://xxxxxx.auth0.com/';
const JKWS_URL      = AUTH0_DOMAIN + '.well-known/jwks.json';
const JWT_AUDIENCE  = AUTH0_DOMAIN + 'userinfo';

const JWKS_CLIENT = jwksClient({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10, // Default value
  jwksUri: JKWS_URL,
});

const getSigningKey = util.promisify(JWKS_CLIENT.getSigningKey);

const getPolicyDocument = (effect, resource) => {
  const policyDocument = {
      Version: '2012-10-17',
      Statement: [{
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
      }]
  };
  return policyDocument;
}

const jwtOptions = {
  audience: JWT_AUDIENCE,
  issuer: AUTH0_DOMAIN,
};

module.exports.authorizer = async (event) => {
  const tokenString = event.authorizationToken;
  if (!tokenString) {
    throw new Error('authorizationToken is empty');
  }

  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    throw new Error(`authorizationToken format fail: ${tokenString}`);
  }

  const token = match[1];
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header || !decoded.header.kid) {
    throw new Error('jwt verify fail');
  }

  return getSigningKey(decoded.header.kid)
    .then(key => {
      const signingKey = key.publicKey || key.rsaPublicKey;
      const ret = jwt.verify(token, signingKey, jwtOptions);
      return ret;
    })
    .then(decoded => {
      const userInfo = {
        permissions: decoded.permissions,
        twitter: decoded['https://twitter.com'],
      };

      //console.log(decoded)
      const serialized = Buffer.from(JSON.stringify(userInfo)).toString('base64');

      return {
        principalId: decoded.sub,
        policyDocument: getPolicyDocument('Allow', event.methodArn),
        context: {
          userInfo: serialized,
          scope: decoded.scope,
        },
      };
    })
    //.then(data => { console.log(data); return data; })
    //.catch(err => { console.log(err) });
};

module.exports.test = async (event) => {
  const ctx = event.requestContext.authorizer;
  const jsonString = Buffer.from(ctx.userInfo, 'base64').toString();
  const userInfo = JSON.parse(jsonString);

  console.log(userInfo);
  console.log(ctx.integrationLatency);
  
  return {
    statusCode: 200,
    body: "Hello!!!",
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  };
};
