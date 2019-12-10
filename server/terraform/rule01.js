function (user, context, callback) {
  if (context.connection === 'twitter') {
    const namespace = 'https://twitter.com';
    const twitter = {
      user_id: user.user_id,
      screen_name: user.screen_name,
      display_name: user.name,
    };
    
    let idTokenClaims = context.idToken || {};
    let accessTokenClaims = context.accessToken || {};

    idTokenClaims[namespace] = twitter;
    accessTokenClaims[namespace] = twitter;

    context.idToken = idTokenClaims;
    context.accessToken = accessTokenClaims;   
  }
  callback(null, user, context);
}
