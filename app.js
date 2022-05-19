require('dotenv').config()
require('request')

const PORT = process.env.PORT || 18000;

const express = require('express');
const app = express();

app.listen(PORT, function(){
    console.log(`Server is running at port ${PORT}`);
})

app.get('/', (req, res) => {
    res.send('BartekPensaBot')
  })
  
