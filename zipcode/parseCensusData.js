const fs = require('fs');

const file = process.argv[2]

const data = fs.readFileSync(file, 'utf8');

let entries = data.split("\n");
entries.shift();

let zipData = [];
entries.forEach(entry => {
    let values = entry.split("\t");
    let zip = values[0];
    if (zip) {
        let lat = values[5];
        let long = values[6].trim();
        zipData.push({zip, lat, long})
    }
})


fs.writeFileSync('zipdata.json', JSON.stringify(zipData), 'utf8');

