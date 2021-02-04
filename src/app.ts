import { Browser, ElementHandle, Page } from 'puppeteer'

const puppeteer = require('puppeteer')

type StockIndexing = 'SET50' | 'SETHD'

const getAllStockByElements = async (elements: ElementHandle[]) => {
  const stocks = []
  for (let index = 0; index < elements.length; index++) {
    const name = await elements[index].$eval('td > a', (a: Element) => a.innerHTML)
    stocks.push(name.trim())
  }

  return stocks
}

const getStockByIndex = async (browser: Browser, indexing: StockIndexing) => {
  const page: Page = await browser.newPage()
  await page.goto(
    `https://marketdata.set.or.th/mkt/sectorquotation.do?sector=${indexing}&language=th&country=TH`
  )
  const elements = await page.$x(
    '//*[@id="maincontent"]/div/div[2]/div/div/div/div[3]/table/tbody/tr'
  )
  const stocks = await getAllStockByElements(elements)
  return stocks
}

;(async () => {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const set50Stocks = await getStockByIndex(browser, 'SET50')
  const setHDStocks = await getStockByIndex(browser, 'SETHD')
  console.log(set50Stocks)
  console.log(setHDStocks)

  await browser.close()
})()
