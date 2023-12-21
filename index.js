const express = require('express')
require('dotenv').config() 
const app = express()
const port = 3000 || process.env.PORT; 

app.get('/', (req, res) => {
  res.send('Is this the correct express app?')
})


app.get('/downloadproductfeed', async (req, res) => {
  try {
    const response = await fetch('https://www.applianceworldonline.com/media/feeds/feed_15.txt', {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const data = await response.text();
    const lines = data.split('\n');

    // Check specific product ID
    lines.forEach(line => {
      const fields = line.split('\t'); // Assuming tab-separated values
      if (fields[0] === '33242') { // Assuming the ID is in the first field
        console.log('Line with ID 33242:', line);
      }
    });

    res.setHeader('Content-Type', 'text/plain');
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

