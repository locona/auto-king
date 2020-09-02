const puppeteer = require('puppeteer');
const koyomi = require('koyomi');
const format = require('date-fns/format');
const ja = require('date-fns/locale/ja');

module.exports = async (req, res) => {
    if (!utils.isRunnableMinute()) {
      res.send({'message': '出勤時間ではありません。'});
      return;
    }

    if (!utils.isWorkday()) {
      res.send({'message': '休日・祝日です'});
      return;
    }

    const punchable = await utils.isPunchable(utils.mode.end)
    if (!punchable) {
      res.send({'message': '既に退勤済みです'});
      return;
    }

    // const browser = await puppeteer.launch({headless: false});
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    const page = await browser.newPage()

    const navigationPromise = page.waitForNavigation()

    await page.goto('https://s2.kingtime.jp/independent/recorder/personal/')

    await page.setViewport({ width: 1280, height: 900 });

    await navigationPromise

    await page.waitForSelector('#modal_window #id')
    await page.click('#modal_window #id')

    const user = process.env.USER;
    const password = process.env.PASSWORD;

    await page.type('#modal_window #id', user);
    await page.type('#modal_window #password', password);


    await page.waitForSelector('.modal-content > .container > .btn-control-outer > .btn-control-inner > .btn-control-message')
    await page.click('.modal-content > .container > .btn-control-outer > .btn-control-inner > .btn-control-message')

    await page.waitFor(1000);
    await page.waitForSelector('.container > #buttons > li:nth-child(2)')
    await page.click('.container > #buttons > li:nth-child(2)')

    await page.waitFor(5000);

    await browser.close()

    res.send({});
}
