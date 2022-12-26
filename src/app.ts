import puppeteer, { Browser } from 'puppeteer'

import { getStockByIndex, getMAIStock, getStockProfile } from './set'
import { getAllStockDetail, JittaStockDetail } from './jitta'
import {
  prioratiseStock,
  StockDetail,
  stampDatetime,
  writingManager,
  parsingSETAndMAIStocks,
} from './utilities'
import { getStockEvent } from './settrade'
import { sendSlack } from './slack'
;(async () => {
  try {
    const browser: Browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        width: 1980,
        height: 1080,
      },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized'],
    })

    const [set50Stocks, set100Stocks, setHDStocks, maiStocks] = await Promise.all([
      getStockByIndex(browser, 'SET50'),
      getStockByIndex(browser, 'SET100'),
      getStockByIndex(browser, 'SETHD'),
      getMAIStock(browser),
    ])

    // ─── For Manual Testing ──────────────────────────────────────

    // const [set50Stocks, set100Stocks, setHDStocks, maiStocks] = [
    //   ['BANPU'],
    //   ['ACE', 'BANPU', 'BCH'],
    //   ['BCH'],
    //   ['AU'],
    // ]

    const summaryStocks = [...set100Stocks, ...maiStocks]

    const [allStockProfiles, allJittaStockDetail, allStockDividendDetail] = await Promise.all([
      getStockProfile(browser, summaryStocks),
      getAllStockDetail(browser, summaryStocks),
      getStockEvent(browser, summaryStocks),
    ])

    await browser.close()

    const mergedStockDetail: StockDetail[] = allJittaStockDetail.map((jittaDetail) => ({
      ...jittaDetail,
      ...allStockProfiles[jittaDetail.name],
      ...allStockDividendDetail[jittaDetail.name],
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

    sendSlack()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
})()
