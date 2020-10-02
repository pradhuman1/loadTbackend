const puppeteer = require('puppeteer');
const speedline = require('speedline-core');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');

    await page.goto("https://www.indiehackers.com");




    var firstMean = 0;
    var performanceMetrics;


    var firstPaint = await calcPaint(page);

    async function calcPaint(page) {
        const Page = page;
        await page.screenshot({ path: './screenshots/first-paint.png' });
        return await page.evaluate(async (Page) => {
            return JSON.stringify(performance.getEntriesByName('first-paint'))
        });
    }

    firstPaint = JSON.parse(firstPaint);


    const firstContentfulPaint = JSON.parse(
        await page.evaluate(() =>
            JSON.stringify(performance.getEntriesByName('first-contentful-paint'))
        )
    );

    while (firstMean === 0) {
        performanceMetrics = await client.send('Performance.getMetrics');
        await page.waitFor(200);
        await page.screenshot({ path: './screenshots/meaninigful-paint.png' });
        firstMean = getTime('FirstMeaningfulPaint');
    }

    function getTime(name) {
        return performanceMetrics.metrics.find(el => el.name === name).value;
    }

    function getRelTime(el) {
        return getTime(el) - getTime('NavigationStart');
    }




    var firstMeaningfulPaint = getRelTime('FirstMeaningfulPaint');


    console.log("firstPaint" + " : " + firstPaint[0].startTime / 1000 + "sec");
    console.log("firstContentfulPaint" + " : " + firstContentfulPaint[0].startTime / 1000 + "sec");
    console.log("firstMeaningfulPaint" + " : " + firstMeaningfulPaint + "sec");

    const indexs = function (firstMeaningfulPaint, firstPaint, firstContentfulPaint) {
        this.firstContentfulPaint = firstContentfulPaint;
        this.firstPaint = firstPaint;
        this.firstMeaningfulPaint = firstMeaningfulPaint;
    }

    var result = new indexs(firstMeaningfulPaint, firstPaint[0].startTime / 1000, firstContentfulPaint[0].startTime / 1000);

    await browser.close();
    return result;



