import { createClient } from "redis";
import logger from "../Utils/logger.utils.js";
import { REDIS_URI } from "../../config/config.service.js";

export const redisClient = createClient({
    url: REDIS_URI,
});

export const connectRedis = async() => {
    try {
        redisClient.on('connect', () => {
            logger.info('Redis client connecting...');
        });
        
        redisClient.on('ready', () => {
            logger.database('connected', 'Redis');
        });
        
        redisClient.on('error', (error) => {
            logger.error('Redis connection error:', error);
        });
        
        redisClient.on('end', () => {
            logger.warning('Redis connection ended');
        });
        
        await redisClient.connect();
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
    }
};

