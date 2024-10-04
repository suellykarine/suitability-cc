export const jwtConstants = {
  secret: process.env.TOKEN_KEY,
  sercretPreRegister: process.env.TOKEN_PRE_REGISTER,
};

export const sigmaHeaders = {
  'X-API-KEY': process.env.X_API_KEY!,
  access_token: process.env.ACCESS_TOKEN!,
  client_id: process.env.CLIENT_ID!,
};
