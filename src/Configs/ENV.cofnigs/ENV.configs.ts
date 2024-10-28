import dotenv from 'dotenv'
dotenv.config()


export const configs = {
    // LISTENER PORT
    PORT : process.env.PORT || 3002,

    // GRPC PORT CONFIG
    TUTOR_GRPC_PORT : process.env.TUTOR_GRPC_PORT || 5002,

    // DWL EMAIL CONFIGS
    DWL_EMAIL : process.env.EMAIL || 'dowhilelearn05@gmail.com',
    DWL_PASSWORD : process.env.PASSWORD || '',


    // DB COFNIGS
    MONGODB_URL_TUTOR : process.env.MONGODB_URL_TUTOR || '',
    
    //AWS CONFIGS
    BUCKET_NAME: process.env.BUCKET_NAME || '',
    AWS_ACCESS_KEY_ID : process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY : process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_REGION : process.env.AWS_REGION || '', 
    
    //JWT CONFIGS
    JWT_SECRET : process.env.JWT_SECRET || '',
    REFRESH_TOKEN_SECRET : process.env.REFRESH_TOKEN_SECRET || '',
    JWT_EXPIRATION_TIME : process.env.JWT_EXPIRATION_TIME || '1m',
    REFRESH_TOKEN_EXPIRATION_TIME : process.env.REFRESH_TOKEN_EXPIRATION_TIME || '10d',

    // LOGGER CONFIGS
    LOG_RETENTION_DAYS : process.env.LOG_RETENTION_DAYS || '7d'
}