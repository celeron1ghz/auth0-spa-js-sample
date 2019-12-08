function (user, context, callback) {
  if (context.connection === 'twitter' && user.screen_name) {
    user.nickname = user.screen_name;
  }
  callback(null, user, context);
}
