const { createClient } = require('redis');
const redisClient = createClient({url: process.env.REDIS_URL});

module.exports = {
   getJson: async function(chatId, redisKey)
   {
        await redisClient.connect();
        const value = await redisClient.get(redisKey+chatId);
        await redisClient.quit()
        return JSON.parse(value);
   },

   setJson: async function(chatId, redisKey, jsonValue)
   {
        await redisClient.connect();
        await redisClient.set(redisKey+chatId, jsonValue);
        await redisClient.quit()
   },

   getInt: async function(chatId, redisKey)
   {
      await redisClient.connect();
      const value = await redisClient.get(redisKey+chatId);
      await redisClient.quit();
      return (!value)? 0: parseInt(value);
   },

   setInt: async function(chatId, redisKey, num)
   {
      await redisClient.connect();
      //await redisClient.set(redisKey+chatId,  num, { EX: 20 } );
      await redisClient.set(redisKey+chatId,  num);
      await redisClient.quit();
   }

};