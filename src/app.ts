import fs from 'fs'

import puppeteer, { Browser } from 'puppeteer'
import { format, utcToZonedTime } from 'date-fns-tz'

import { getStockByIndex, getStockIndustry } from './set'
import { getAllStockDetail, JittaStockDetail } from './jitta'
import { prioratiseStock, StockDetail } from './utilities'

const dateTimeFormat = 'dd/MM/yyyy HH:mm:ss'
const dateFormatOption = { timeZone: 'Asia/Bangkok' }

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

  await browser.close()

  const mergedStockDetail: StockDetail[] = allJittaStockDetail.map((jittaDetail) => ({
    ...jittaDetail,
    ...set100StocksWithIndustry[jittaDetail.name],
  }))

  const sortedSET100Result = prioratiseStock(mergedStockDetail)
  const sortedSET50Result = sortedSET100Result.filter((stock: JittaStockDetail) =>
    set50Stocks.includes(stock.name.toUpperCase())
  )
  const sortedSETHDResult = sortedSET100Result.filter((stock: JittaStockDetail) =>
    setHDStocks.includes(stock.name.toUpperCase())
  )

  const formattedSET100Json = JSON.stringify(
    {
      createdAt: format(
        utcToZonedTime(new Date(), dateFormatOption.timeZone),
        dateTimeFormat,
        dateFormatOption
      ),
      results: sortedSET100Result,
    },
    null,
    4
  )
  const formattedSET50Json = JSON.stringify(
    {
      createdAt: format(
        utcToZonedTime(new Date(), dateFormatOption.timeZone),
        dateTimeFormat,
        dateFormatOption
      ),
      results: sortedSET50Result,
    },
    null,
    4
  )
  const formattedSETHDJson = JSON.stringify(
    {
      createdAt: format(
        utcToZonedTime(new Date(), dateFormatOption.timeZone),
        dateTimeFormat,
        dateFormatOption
      ),
      results: sortedSETHDResult,
    },
    null,
    4
  )

  fs.writeFile('src/indexing/SET100.json', formattedSET100Json, (err) => {
    if (err) throw err
    console.log('Save SET100.json DONE')
  })

  fs.writeFile('src/indexing/SET50.json', formattedSET50Json, (err) => {
    if (err) throw err
    console.log('Save SET50.json DONE')
  })

  fs.writeFile('src/indexing/SETHD.json', formattedSETHDJson, (err) => {
    if (err) throw err
    console.log('Save SETHD.json DONE')
  })
})()
