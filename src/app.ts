import puppeteer, { Browser } from 'puppeteer'

import { getStockByIndex, getStockIndustry } from './set'
import { getAllStockDetail, JittaStockDetail } from './jitta'
import { getStockTechnical } from './tradingView'
import { prioratiseStock, StockDetail, stampDatetime, writingManager } from './utilities'
;(async () => {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
  })

  const set50Stocks = await getStockByIndex(browser, 'SET50')
  const set100Stocks = await getStockByIndex(browser, 'SET100')
  const setHDStocks = await getStockByIndex(browser, 'SETHD')
  const set100StocksWithIndustry = await getStockIndustry(browser, set100Stocks)
  const allJittaStockDetail = await getAllStockDetail(browser, set100Stocks)
  const set100TechnicalStocks = await getStockTechnical(browser, set100Stocks)

  await browser.close()

  const mergedStockDetail: StockDetail[] = allJittaStockDetail.map((jittaDetail) => ({
    ...jittaDetail,
    ...set100TechnicalStocks[jittaDetail.name],
    ...set100StocksWithIndustry[jittaDetail.name],
  }))

  const sortedSET100Result = prioratiseStock(mergedStockDetail)
  const sortedSET50Result = sortedSET100Result.filter((stock: JittaStockDetail) =>
    set50Stocks.includes(stock.name.toUpperCase())
  )
  const sortedSETHDResult = sortedSET100Result.filter((stock: JittaStockDetail) =>
    setHDStocks.includes(stock.name.toUpperCase())
  )

  const formattedSET100Json = stampDatetime(sortedSET100Result)
  const formattedSET50Json = stampDatetime(sortedSET50Result)
  const formattedSETHDJson = stampDatetime(sortedSETHDResult)

  writingManager(formattedSET100Json, formattedSET50Json, formattedSETHDJson)
})()
