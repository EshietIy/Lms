import {Redis} from 'ioredis';
require('dotenv').config();

//checks for redis connection string if available 
const redisClient = () => {
    if(process.env.REDIS_URL){
        console.log(`Redis connected`);
        return process.env.REDIS_URL;
    }
    throw new Error('Redis connection failed');
};

export const redis = new Redis(redisClient());