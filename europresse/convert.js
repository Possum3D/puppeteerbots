const util = require('util');
// using exec instead of spawn bc I had issues with spawn ( but maybe du to sth else.)
// the thing is that the cumulation with promisify avoids promise mistakes that mess up the order.
const exec = util.promisify(require('child_process').exec);

function convert(src, toFilename) {
    return _convert(src, toFilename).then(
        () => {
            return rm(src)
        }
    )
}

async function rm(src) {
    const rmArgs = `rm -r ${src}/*.png`
    return exec(rmArgs)
}

async function _convert(src, toFilename){ 
    const convertArgs = `convert ${src}/*.png ${src}/${toFilename}`
    return exec(convertArgs) 
}

module.exports.convert = convert;
module.exports.rm = rm;
