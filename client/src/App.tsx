import React, { useState, useCallback, useMemo } from 'react';
import createAuth0Client from '@auth0/auth0-spa-js';

const AUTH0_DOMAIN          = 'xxxxxx.auth0.com';
const AUTH0_CLIENT_ID       = 'xxxxxx';
const AUTH0_REDIRECT_URI    = 'https://xxxxxx.ngrok.io/callback';
const AUTH0_AUDIENCE        = 'https://api.example.com';

const AUTH0_PARAM = { audience: AUTH0_AUDIENCE };

const App: React.FC = () => {
  const [auth0, setAuth0] = useState<any>();
  const [profile, setProfile] = useState<Object>();
  const [auth0Token, setAuth0Token] = useState<string>();

  const login = useCallback(async function() {
    if (!auth0) return;
    await auth0.loginWithPopup(AUTH0_PARAM);

    const user: Object = await auth0.getUser(AUTH0_PARAM);
    setProfile(user);
  }, [auth0]);

  const logout = useCallback(() => {
    auth0.logout();
  }, [auth0]);

  const apigw = () => {
    window.fetch(
      'https://xxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/test',{
        headers: new window.Headers({ 'Authorization': "Bearer " + auth0Token }),
      })
      .then(data => data.text())
      .then(data => {
        console.log(data)
      })
      .catch(err => { console.log("err", err) })
  };

  useMemo(async function(){
    if (!auth0) return;
    try {
      const token: string = await auth0.getTokenSilently(AUTH0_PARAM);
      setAuth0Token(token);

      const user = await auth0.getUser(AUTH0_PARAM);
      setProfile(user);
    } catch (e) {
      console.log(e);
    }
  }, [auth0]);

  if (!auth0) {
    createAuth0Client({
      domain:       AUTH0_DOMAIN,
      client_id:    AUTH0_CLIENT_ID,
      redirect_uri: AUTH0_REDIRECT_URI,
      audience:     AUTH0_AUDIENCE,
    }).then(setAuth0);

    return null;
  }

  console.log(auth0Token);

  return (
    <div>
      {
        profile && <button onClick={logout}>Logout</button>
      }
      {
        !profile && <button onClick={login}>Login</button>
      }
      <div>
        {JSON.stringify(profile)}
      </div>
      <button onClick={apigw}>API Gateway</button>
    </div>
  );
}

export default App;
