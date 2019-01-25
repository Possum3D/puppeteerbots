const { spawn } = require('child_process');


function convert(src, toFilename) {
    return _convert(src, toFilename).then(_rm(src))
}

function rm(src) {
    return _rm(src)
}

function _rm(src) {

    const rm = spawn('rm', ['-rf', `${src}/*.png`]); 

    return new Promise((resolve, reject) => {
        rm.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        rm.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        rm.on('close', (code) => {
            if (code == 1) { 
                reject
            } else {
                resolve
            }
        }); 
    })
}

// returns a promise
function _convert(src, toFilename) {
   const convert = spawn('convert', [`${src}/*.png`, `${src}/${toFilename}`]); 

    return new Promise((resolve, reject) => {
        convert.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        convert.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        convert.on('close', (code) => {
            if (code == 1) { 
                reject
            } else {
                resolve
            }
        }); 
    })
}
module.exports.convert = convert;
module.exports.rm = rm;
