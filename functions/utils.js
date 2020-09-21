const puppeteer = require('puppeteer');
const koyomi = require('koyomi');
const format = require('date-fns/format');
const ja = require('date-fns/locale/ja');

const login = async (page) => {
  const navigationPromise = page.waitForNavigation();

  await page.goto('https://s2.kingtime.jp/admin/')

  await page.setViewport({ width: 1280, height: 900 });

  await navigationPromise

  await page.waitForSelector('.specific-main #login_id')
  await page.click('.specific-main #login_id')

  const user = process.env.USER;
  const password = process.env.PASSWORD;
  await page.type('.specific-main #login_id', 'bop3003')
  await page.type('.specific-main #login_password', 'UnXqzpBaJFfqLGKhK')

  await page.waitForSelector('.specific-main #login_button')
  await page.click('.specific-main #login_button')
  await page.waitFor(2000);
}

module.exports.mode = {
  'start': 'START_TIMERECORD',
  'end': 'END_TIMERECORD'
}

module.exports.isRunnableMinute = () => {
  const today = new Date()
  const currentMonth = format(
    today,
    'MM',
    {locale: ja}
  )
  const currentDay = format(
    today,
    'dd',
    {locale: ja}
  );

  const currentMinute = format(
    today,
    'mm',
    {locale: ja}
  );


  const mon = parseInt(currentMonth, 10)
  const day = parseInt(currentDay, 10)
  const min = parseInt(currentMinute, 10)

  return day+mon <= min;
}

module.exports.isPunchable = async (mode) => {
  const today = new Date()
  const todayDay = format(
    today,
    'dd',
    {locale: ja}
  );
  const day = parseInt(todayDay, 10)

  const browser = process.env.DEBUG
    ? await puppeteer.launch({ headless: false })
    : await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
  const page = await browser.newPage();
  await login(page);

  const schedulePath = `.htBlock-adjastableTableF_inner table tbody tr:nth-child(${day}) [data-ht-sort-index='SCHEDULE']`
  page.waitForSelector(schedulePath)
  const scheduleData = await page.$eval(schedulePath, item => {
    return item.innerText;
  });

  if (scheduleData.includes('有休')) {
    return false;
  }

  const startPath = `.htBlock-adjastableTableF_inner table tbody tr:nth-child(${day}) [data-ht-sort-index='${mode}']`
  page.waitForSelector(startPath)

  const startData = await page.$eval(startPath, item => {
    return item.innerText;
  });

  await browser.close();

  if (startData) {
    return false;
  }

  return true;
}

module.exports.isWorkday = () => {
  const today = format(
    new Date(),
    'yyyy-MM-dd',
    {locale: ja}
  );
  const isOpen = koyomi.isOpen(today);
  return isOpen;
}
