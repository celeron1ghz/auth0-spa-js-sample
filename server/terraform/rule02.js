function (user, context, callback) {
  const namespace = 'https://example.com';
  const assignedRoles = (context.authorization || {}).roles;
  
  let idTokenClaims = context.idToken || {};
  let accessTokenClaims = context.accessToken || {};

  idTokenClaims[`${namespace}/roles`] = assignedRoles;
  accessTokenClaims[`${namespace}/roles`] = assignedRoles;

  context.idToken = idTokenClaims;
  context.accessToken = accessTokenClaims;
  
  return callback(null, user, context);
}
