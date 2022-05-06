import groq from 'groq';

export const getUserByIdQuery = groq`
  *[_type == $userSchema && _id == $id][0]
`;

export const getUserByProviderAccountIdQuery = groq`
  *[_type == $accountSchema && providerId == $providerId && providerAccountId == $providerAccountId] {
    accessToken,
    accessTokenExpires,
    providerId,
    providerType,
    providerAccountId,
    user->
  }[0]
`;

export const getUserByEmailQuery = groq`
  *[_type == $userSchema && email == $email][0]
`;

export const getUserByEmailOrUsernameQuery = groq`
  *[_type == $userSchema && email == $label || username == $label][0]
`;
export const getUserByEmailOrUsername = groq`
  *[_type == $userSchema && email == $email || username == $username][0]
`;

export const getVerificationTokenQuery = groq`
  *[_type == $verificationTokenSchema && identifier == $identifier && token == $token][0]
`;
