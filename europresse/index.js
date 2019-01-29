// typically, devXX is directly logged with cookie credentials to avoid rate limits during dev.
// naturally, it implies that a while infinite loop maintains the session in another tab.
const Puppeteer = require('puppeteer');
const Fs = require('fs');
const Convertor = require('./convert.js');
const PUrl = require('url-parse');
const Download = require('./download.js');
const Login = require('../europresse/login.js');
const Targets = require('./targets.js');
const Argv = require('yargs').argv;

const targetFolder = 'papers';

let paper = ''
let papers = []
if (typeof Argv.paper !== 'undefined') {
    papers = [Argv.paper];
} else {
    papers = Targets.targets.filter(target => {
        return target.subscribed == true && target.wanted == true
    }).map(target => {
        return target.code
    })
}

(async () => {
    console.log(`${papers}`)
    for (const paper of papers) {
        await fetchLatest(paper)
    }
})()

async function test() {
    return new Promise(resolve => setTimeout(resolve, 2000));
}

async function fetchLatest(paper) {
    // Parse json-serialized cookies, retrieved via fs.
    const cookieFile = `./authCookies.json`
    let store = JSON.parse(Fs.readFileSync(cookieFile));
    if (parseInt(Date.now() - store.timestamp) / 1000  >  900) {
        const pastLogin = (new Date(1548408748966)).toISOString()
        console.log(`last login is too old (${pastLogin})`)
        store = await Login.authCookies()
        Fs.writeFileSync(cookieFile, JSON.stringify(store))
    }
    const cks = store.cookies

    // II - Page usage to retrieve IDs 
    const browser = await Puppeteer.launch({
        // for debugging, opening a chrome instance is better
        // put true on prod.
        headless: false
    });

    try {
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();

        // setCookie expects a sequence of objects. either (...[]) or ({}, {})
        await page.setCookie(...cks)
        await page.goto(`https://nouveau.europresse.com/Pdf/Edition?sourceCode=${paper}_P`);


        // _docNameList is a variable of the index page that lists all documents:
        // [ 'pdf·20190123·EC_P·1', 'pdf·20190123·EC_P·2', .. ]
        // in https://nouveau.europresse.com/Pdf/Edition?sourceCode=EC_P for instance
        // easier to use than selectors to retrieve date of the paper and list / fetch all pages.
        // assumed already ordered
        console.log(await page.evaluate(() => _docNameList)); 
        IDList = await page.evaluate(() => _docNameList);
    } finally {
        // from now on we don't need the browser any more.
        await browser.close() 
    } 

    // III - check that a new document can be downloaded.
    const ID0 = IDList[0];
    const IDReg = new RegExp(`^pdf·(?<date>\\d{8})·(?<paper>${paper})_P·(?<page>\\w+)$`, 'u');
    const parsedID0 = IDReg.exec(ID0)
    const date = parsedID0.groups.date
    const dir = `${targetFolder}/${paper}`
    const finalFilename = `${date}_${paper}.pdf`

    if (Fs.existsSync(`${dir}/${finalFilename}`)) {
        return new Promise((resolve) => {
            console.log(`${dir}/${finalFilename} already exists.`)
            resolve()
        })
    }

    Fs.mkdirSync(`${dir}`, {recursive: true});
    
    // VI - Download and convert the png set to a single pdf.
    const listURITpl = 'https://nouveau.europresse.com/Pdf/ImageList?docName=ID_PLACEHOLDER'
    const fetchURITpl = 'https://nouveau.europresse.com/Pdf/Image?imageIndex=0&id=ID_PLACEHOLDER&cache=MILLITS_PLACEHOLDER';
    let count = 0

    for (let ID of IDList) {
        console.log(`handling ${ID}`)
        count++
        var listURI = listURITpl
        var fetchURI = fetchURITpl

        var parsedList = new PUrl(listURI, '', true);
        parsedList.query.docName = ID;
        var parsedFetch = new PUrl(fetchURI, '', true);
        parsedFetch.query.id = ID;
        parsedFetch.query.cache = Date.now()

        var pageName = `${count}`.padStart(4,0)
        await Download.EuropressPage(
            parsedList.toString(), 
            parsedFetch.toString(), 
            cks,
            `${dir}/${pageName}.png`
        )

        console.log(`created ${dir}/${finalFilename}.`)
    }
    await Convertor.convert(`${dir}`, `${date}_${paper}.pdf`)

    return new Promise((resolve) => {
        console.log(`fetched.`)
        resolve()
    })
};
