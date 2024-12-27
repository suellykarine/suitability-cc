export const jwtConstants = {
  secret: process.env.TOKEN_KEY,
  sercretPreRegister: process.env.TOKEN_PRE_REGISTER,
  secretTokenAtualizacao: process.env.TOKEN_RENOVACAO_KEY,
  secretDevelopment: process.env.TOKEN_DEVELOPMENT,
  secretSrmWebhooks: process.env.SECRET_SRM_WEBHOOKS,
};

export const sigmaHeaders = {
  'X-API-KEY': process.env.SIGMA_SECRET_KEY!,
  access_token: process.env.ACCESS_TOKEN!,
  client_id: process.env.CLIENT_ID!,
};
