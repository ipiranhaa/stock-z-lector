const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch()
  console.log(await browser.version())
  const page = await browser.newPage()
  await page.goto(
    'https://marketdata.set.or.th/mkt/sectorquotation.do?sector=SET50&language=th&country=TH'
  )
  const element = await page.$x('//th[text()="หลักทรัพย์"]')
  console.log(element)
  // other actions...
  await browser.close()
})()
