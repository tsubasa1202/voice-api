const fs = require('fs');
const csv = require('csv');

const parser = csv.parse((err, data) => {
    console.log('CSVファイルの行数=' + data.length);
    data.forEach((element, index, array) => console.log(element[1]));
});

fs.createReadStream('./texts.csv').pipe(parser);
