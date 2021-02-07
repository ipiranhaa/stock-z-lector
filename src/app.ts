import puppeteer, { Browser } from 'puppeteer'
import { getStockByIndex, intersecStocks } from './set'
import { getStockDetail } from './jitta'

const getAllStockDetail = async (browser: Browser, stocks: string[]) => {
  const result = []
  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index].toLowerCase()
    const detail = await getStockDetail(browser, stock)
    result.push(detail)
  }

  return result
}

;(async () => {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const set50Stocks = await getStockByIndex(browser, 'SET50')
  const setHDStocks = await getStockByIndex(browser, 'SETHD')
  const interestingStocks = intersecStocks(set50Stocks, setHDStocks)
  const allStockDetail = await getAllStockDetail(browser, interestingStocks)
  console.log(allStockDetail)

  await browser.close()
})()
