const express = require('express')
require('dotenv').config() 
const app = express()
const port = 3000 || process.env.PORT; 

app.get('/', (req, res) => {
  res.send('Is this the correct express app?')
})


function updateLines(originalLines, headerFields) {
  let updatedLines = [];
  originalLines.slice(1).forEach(line => {
    const fields = line.split('\t');
    fields[13] = fields[13].split(',')[0].trim(); // Update product_type
    fields[17] = '1-5 days'; // Update shipping
    const updatedFields = [...fields, "00.00 GBP"];
    const quotedFields = quoteFields(updatedFields);  // Apply quoteFields here
    const newLine = quotedFields.join('\t');  // Use quotedFields
    updatedLines.push(newLine);
  });
  return updatedLines;
}

function quoteFields(fields) {
  return fields.map(field => {
      if (field.includes(',') || field.includes('\n') || field.includes('"')) {
          field = field.replace(/"/g, '""'); // escape double quotes
          return `"${field}"`;
      }
      return field;
  });
}

//Proxy for downloading the product feed
app.get('/downloadproductfeed', async (req, res) => {
  const format = req.query.format || 'json'; // Default to 'csv' if not specified
  const availability = req.query.availability; // Get 'availability' query parameter
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
    lines.forEach(line => {
      const fields = line.split('\t'); // Assuming tab-separated values
      if (fields[0] === '33242') { // Assuming the ID is in the first field
          console.log('Line with ID 36741:', line);
      }
  });
    
    const headerFields = lines[0].split('\t');
    
    //New header that doesn't exist on original feed 
    const newHeader = [...headerFields, 'shipping_cost'].join(',');
    const updatedLines = updateLines(lines, headerFields).filter(line => {
      if (!availability) return true; // If no availability filter, include all lines
      const fields = line.split('\t');
    
      if(fields[6] === "in_stock"){
          instock++
      }
      return fields[6] === availability; // Filter by availability
    });
    
    if (format === 'csv') {
      // Convert each line from tab-separated to comma-separated and apply quoteFields to stop csv download breaking
      const csvFormattedLines = updatedLines.map(line => {
          const fields = line.split('\t');
          const quotedFields = quoteFields(fields);
          return quotedFields.join(',');
      });
      const updatedDataCSV = [newHeader, ...csvFormattedLines].join('\n');
      generateCSV(updatedDataCSV, 'updated_data.csv');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=updated_data.csv');
      res.send(updatedDataCSV);
  } else if (format === 'json') {
      const updatedDataJSON = [newHeader, ...updatedLines];
      const newHeaderFields = newHeader.split(','); // Convert newHeader back to an array
      const jsonData = generateJSON(updatedDataJSON, newHeaderFields);
      res.setHeader('Content-Type', 'application/json');
      res.send(jsonData);
    }
    else if (format === 'txt') {
      const txtHeader = newHeader.replace(/,/g, '\t');
      const updatedDataTXT = [txtHeader, ...updatedLines].join('\n');        
      generateTXT([txtHeader, ...updatedLines]);
      res.setHeader('Content-Type', 'text/plain');
      res.send(updatedDataTXT);
    } else if (format === 'xml') {
      const newHeaderFields = newHeader.split(','); // Convert newHeader back to an array
      const xmlData = generateXML([newHeader, ...updatedLines], newHeaderFields);
      res.setHeader('Content-Type', 'application/xml');
      res.send(xmlData);
  } else {
      res.status(400).send("Invalid format");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

