const Puppeteer = require('puppeteer');
const Fs = require("fs");
const Assert = require('assert');


(async () => {
    const browser = await Puppeteer.launch({
        // for debugging, opening a chrome instance is better
        // put true on prod.
        headless: false
    });

    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    try {
        const CREDS = require('./creds');
        const SUBSCRIBER_SELECTOR = '#formlexisauth > div:nth-child(1) > div.medium-4.columns > input[type="text"]';
        const PWD_SELECTOR = '#formlexisauth > div:nth-child(2) > div.medium-4.columns > input[type="password"]';
        const BUTTON_SELECTOR = '#submitButton';
        // selector for the >> 
        const NEXT_PAGE_SELECTOR = '#nextPdf';

        const PAGE_REG = /[^0-9]*(?<lastPage>\d+)[^0-9]*/u;
        const LAST_PAGE_SELECTOR = '#pdf-pages-panel > ul > li:last-child > span';

        // LOGIN
        await page.goto('https://www.bm-lyon.fr/spip.php?page=ressources_auth&url=czo3MjoiaHR0cHM6Ly9ub3V2ZWF1LmV1cm9wcmVzc2UuY29tL2FjY2Vzcy9odHRwcmVmL2RlZmF1bHQuYXNweD91bj1CTUxZT05BVV8xIjs=&access_list=LVAw');

        await page.click(SUBSCRIBER_SELECTOR);
        await page.keyboard.type(CREDS.subscriberId);

        await page.click(PWD_SELECTOR);
        await page.keyboard.type(CREDS.pwd);

        // trick that works better than using page.click to click on a button.
        await page.focus(BUTTON_SELECTOR);
        await page.keyboard.type('\n');
        await page.waitForNavigation();
        
        // Using below only to make sure that login worked correctly by browsing known tags.
        //await page.goto('https://nouveau.europresse.com/Pdf/Edition?sourceCode=EC_P');

        //const IMG_SELECTOR = '#pdfDocument > div.viewer-container.viewer-backdrop > div.viewer-canvas > img';

        //lastSpan = await page.waitForSelector(LAST_PAGE_SELECTOR)
        //const pageText = await page.$eval(LAST_PAGE_SELECTOR, el => el.innerText);
        //lastPage = parseInt(PAGE_REG.exec(pageText).groups.lastPage);
        //console.log(`${lastPage}`)
        
        const cks = await page.cookies();
        
        // warning: make sure that the cookies include domain nouveau.europresse.com
        // example: drafts/cookiesSaveSession.json
        // otherwise, add it on a chained map.
        
        const authCookies = cks.filter(data => {
            return (
                data.name === 'IDENTITY' 
                || data.name === 'SessionID' 
                || data.name === 'ASP.NET_SessionId'
            ) 
        })
        // assertion used to check that authentication worked well.
        // also, we currently store only those as they are the only one really needed to scrap.
        Assert.equal(3, authCookies.length)
        const store = {
            cookies: authCookies,
            timestamp: Date.now() 
        }

    } finally {
         
    }
})();
