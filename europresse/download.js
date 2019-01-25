const Axios = require('axios');
const Fs = require("fs");

async function EuropressPage (listURI, fetchURI, cookies, path) {  
    const writer = Fs.createWriteStream(path)
    let cookieStr = ''
    cookies.map(cookies => {
        cookieStr += `${cookies.name}=${cookies.value}; `  
    })
    
    await Axios({
        url: listURI,
        method: 'GET',
        headers:{
            Cookie: cookieStr
        }
    })

    const response = await Axios({
        url: fetchURI,
        method: 'GET',
        responseType: 'stream',
        headers:{
            Cookie: cookieStr
        }
    })
    console.log(`fetched ${fetchURI} ${path}`)
    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

exports.EuropressPage = EuropressPage
