const { createClient } = require('redis');
const redisClient = createClient({url: process.env.REDIS_URL,
   socket: {
     tls: true,
     rejectUnauthorized: false
   }});

redisClient.on('error',function(err){ console.error(err)})

module.exports = {
   getJson: async function(chatId, redisKey)
   {
      try{
        await redisClient.connect();
        const value = await redisClient.get(redisKey+chatId);
        await redisClient.quit();
        return !value? null:  JSON.parse(value);
      } catch(ex) {
         await redisClient.quit();
         return  null;
      }
   },   
   getJsonQuestions: async function(chatId, redisKey)
   {
      try{
         console.log("ok redis 1");
        await redisClient.connect();
        const value = await redisClient.get(redisKey+chatId);
        await redisClient.quit();
        console.log("ok redis");
        return !value? questions_bck:  JSON.parse(value);
      } catch(ex) {
         console.log("ex redis " + ex);
         return  null;
      }
   },
   
   clearKey: async function(chatId, redisKey, jsonValue)
   {
      try{
        await redisClient.connect();
        await redisClient.set(redisKey+chatId, jsonValue, { EX: 1 } );
        await redisClient.quit();
      } catch (ex) {
         console.log(ex);
         await redisClient.quit();
      } 
   },

   setJsonWithTTL: async function(chatId, redisKey, jsonValue, ttl)
   {
        await redisClient.connect();
        await redisClient.set(redisKey+chatId, jsonValue , { EX: ttl } );
        await redisClient.quit()
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