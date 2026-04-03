import { redisClient } from "./redis.connection.js";

export const revokeTokenKeyPrefix = ({ userId }) => {
  return `user:revokeToken:${userId}`;
};

export const revokeTokenKey = ({ userId, jti }) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

export const globalRevokeKey = ({ userId }) => {
  return `user:globalRevoke:${userId}`;
};

export const set = async ({ key, value, ttl = null }) => {
  try {
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis set error: ", error);
  }
};

export const get = async ({ key }) => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.log("Redis get error: ", error);
  }
};

export const update = async ({ key, value, ttl = null }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    const data = typeof value != "string" ? JSON.stringify(value) : value;
    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", value: ttl },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.log("Redis update error: ", error);
  }
};

export const del = async ({ key }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.del(key);
  } catch (error) {
    console.log("Redis delete error: ", error);
  }
};

export const expire = async ({ key, ttl }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.log("Redis expire error: ", error);
  }
};

export const ttl = async ({ key }) => {
  try {
    const isExists = await redisClient.exists(key);
    if (!isExists) return false;
    return await redisClient.ttl(key);
  } catch (error) {
    console.log("Redis ttl error: ", error);
  }
};

export const keys = async ({ pattern }) => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.log("Redis keys error: ", error);
  }
};
