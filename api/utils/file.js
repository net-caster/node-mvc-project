const fs = require('fs');
const path = require('path');

exports.deleteFile = filePath => {
    filePath = path.join(__dirname, '../../', filePath);
    fs.unlink(filePath, err => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}