import fs from 'fs'

import puppeteer, { Browser } from 'puppeteer'
import { getStockByIndex, intersecStocks } from './set'
import { getStockDetail, JittaStockDetail } from './jitta'
import { prioratiseStock } from './utilities'

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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
  })

  const set50Stocks = await getStockByIndex(browser, 'SET50')
  const set100Stocks = await getStockByIndex(browser, 'SET100')
  const setHDStocks = await getStockByIndex(browser, 'SETHD')
  const interestingStocks = intersecStocks(set100Stocks, setHDStocks)
  const allStockDetail = await getAllStockDetail(browser, interestingStocks)

  await browser.close()

  const sortedSet100Result = prioratiseStock(allStockDetail)
  const sortedSet50Result = sortedSet100Result.filter((stock: JittaStockDetail) =>
    set50Stocks.includes(stock.name.toUpperCase())
  )
  const formattedSET100Json = JSON.stringify(sortedSet100Result, null, 4)
  const formattedSET50Json = JSON.stringify(sortedSet50Result, null, 4)

  fs.writeFile('src/indexing/SET100.json', formattedSET100Json, (err) => {
    if (err) throw err
    console.log('Save SET100.json DONE')
  })

  fs.writeFile('src/indexing/SET50.json', formattedSET50Json, (err) => {
    if (err) throw err
    console.log('Save SET50.json DONE')
  })
})()
