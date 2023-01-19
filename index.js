const express = require('express')
require('dotenv').config() 
const app = express()
const port = 3000 || process.env.PORT; 

app.get('/', (req, res) => {
  res.send('Hello World2!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

