const fs = require('fs');

// Get the file name which is the first argument
const file = process.argv[2]

// Read the file
const data = fs.readFileSync(file, 'utf8');

// Break the file up into an array by new lines
let lines = data.split("\n");

// Remove the first line which contains the headings
lines.shift();

// We'll store the data we extract in this array
let zipData = [];

// Iterate through the lines
lines.forEach(line => {
    // Break the line up by tabs
    let values = line.split("\t");

    // The zip code is the first entry
    let zip = values[0];

    // Only add the data if the zip code is defined (this catches some empty lines)
    if (zip) {
        let lat = values[5];
        let long = values[6].trim();
        zipData.push({zip, lat, long})
    }
})

// Write the results out
fs.writeFileSync('zipdata.json', JSON.stringify(zipData), 'utf8');

