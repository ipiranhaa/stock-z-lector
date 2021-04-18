import puppeteer, { Browser } from 'puppeteer'

import { getStockByIndex, getMAIStock, getStockProfile } from './set'
import { getAllStockDetail, JittaStockDetail } from './jitta'
import { getStockTechnical, TradingViewStock } from './tradingView'
import {
  prioratiseStock,
  StockDetail,
  stampDatetime,
  writingManager,
  parsingSETAndMAIStocks,
} from './utilities'
;(async () => {
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
  })

  const set50Stocks = await getStockByIndex(browser, 'SET50')
  const set100Stocks = await getStockByIndex(browser, 'SET100')
  const setHDStocks = await getStockByIndex(browser, 'SETHD')
  const maiStocks = await getMAIStock(browser)
  const summaryStocks = [...set100Stocks, ...maiStocks]

  const allStockProfiles = await getStockProfile(browser, summaryStocks)
  const allJittaStockDetail = await getAllStockDetail(browser, summaryStocks)

  // Note: Manual resolve advice because tradingview does not have some mai stocks detail.
  const set100TechnicalStocks = await getStockTechnical(browser, set100Stocks)
  const maiTechnicalStocks = maiStocks.reduce((summary, name) => {
    const manipulatedSummary = summary
    manipulatedSummary[name] = {
      advice: '',
    }
    return manipulatedSummary
  }, {} as TradingViewStock)
  const allTechnicalStocks: TradingViewStock = { ...set100TechnicalStocks, ...maiTechnicalStocks }

  await browser.close()

  const mergedStockDetail: StockDetail[] = allJittaStockDetail.map((jittaDetail) => ({
    ...jittaDetail,
    ...allTechnicalStocks[jittaDetail.name],
    ...allStockProfiles[jittaDetail.name],
  }))

  const sortedAllResult = prioratiseStock(mergedStockDetail)
  const [sortedSET100Result, sortedMAIResult] = parsingSETAndMAIStocks(sortedAllResult, maiStocks)
  const sortedSET50Result = sortedSET100Result.filter((stock: JittaStockDetail) =>
    set50Stocks.includes(stock.name.toUpperCase())
  )
  const sortedSETHDResult = sortedSET100Result.filter((stock: JittaStockDetail) =>
    setHDStocks.includes(stock.name.toUpperCase())
  )

  const formattedSET100Json = stampDatetime(sortedSET100Result)
  const formattedSET50Json = stampDatetime(sortedSET50Result)
  const formattedSETHDJson = stampDatetime(sortedSETHDResult)
  const formattedMAIJson = stampDatetime(sortedMAIResult)

  writingManager(formattedSET100Json, formattedSET50Json, formattedSETHDJson, formattedMAIJson)
})()
