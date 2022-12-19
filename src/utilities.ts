import fs from 'fs'

import { format, utcToZonedTime } from 'date-fns-tz'
import { ElementHandle } from 'puppeteer'

import { JittaStockDetail } from './jitta'
import { SETStockDetail } from './set'
import { TradingViewDetail } from './tradingView'
import { dateTimeFormat } from './settings'
import { SetTradeStockDetail } from './settrade'

const dateFormatOption = { timeZone: 'Asia/Bangkok' }
const directoryFormat = 'yyyyMMdd'

//
// ─── UTILITIES ──────────────────────────────────────────────────────────────────
//

const byScore = (aDetail: JittaStockDetail, bDetail: JittaStockDetail) => {
  const aLinePercentage = Number(aDetail.linePercentage.split('%')[0])
  const bLinePercentage = Number(bDetail.linePercentage.split('%')[0])

  const aFactorPercentage = Number(aDetail.factorPercentage.split('%')[0])
  const bFactorPercentage = Number(bDetail.factorPercentage.split('%')[0])

  return (
    bDetail.score - aDetail.score ||
    aLinePercentage - bLinePercentage ||
    bFactorPercentage - aFactorPercentage
  )
}

const createDirectory = (dirPath: string) => {
  fs.mkdir(dirPath, { recursive: true }, (err) => {
    if (err) {
      throw err
    }
    console.log(`${dirPath} directory is created.`)
  })
}

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export const handleGetElements = async (
  promiseFactory: () => Promise<ElementHandle<Node>[]>,
  retryCount = 2
): Promise<ElementHandle<Node>[]> => {
  const elements = await promiseFactory()

  if (elements.length !== 0) return elements

  if (retryCount <= 0) {
    throw new Error('Cannot find elements from Xpath')
  }

  return await handleGetElements(promiseFactory, retryCount - 1)
}

export interface StockDetail
  extends JittaStockDetail,
    SETStockDetail,
    TradingViewDetail,
    SetTradeStockDetail {}

export const prioratiseStock = (stockDetailList: StockDetail[]) => {
  /* 
  Ordering by
    1. Score
    2. Line percentage
    3. Factor percentage
  */

  return stockDetailList.sort(byScore)
}

export const getElementValue = async (element: ElementHandle<Element>): Promise<string> =>
  element.evaluate((element) => element.innerHTML)

export const parsingSETAndMAIStocks = (
  stocks: StockDetail[],
  maiStockList: string[]
): StockDetail[][] => {
  const set100: StockDetail[] = []
  const mai: StockDetail[] = []

  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index]
    if (maiStockList.includes(stock.name.toUpperCase())) {
      mai.push(stock)
    } else {
      set100.push(stock)
    }
  }

  return [set100, mai]
}

export const stampDatetime = (data: StockDetail[]) =>
  JSON.stringify({
    createdAt: format(
      utcToZonedTime(new Date(), dateFormatOption.timeZone),
      dateTimeFormat,
      dateFormatOption
    ),
    results: data,
  })

export const writingManager = (SET100: string, SET50: string, SET1HD: string, MAI: string) => {
  const dirName = format(
    utcToZonedTime(new Date(), dateFormatOption.timeZone),
    directoryFormat,
    dateFormatOption
  )
  const historyPath = `src/indexing/${dirName}`
  createDirectory(historyPath)

  // Main files
  fs.writeFile('src/indexing/SET100.json', SET100, (err) => {
    if (err) throw err
    console.log('Save SET100.json DONE')
  })

  fs.writeFile('src/indexing/SET50.json', SET50, (err) => {
    if (err) throw err
    console.log('Save SET50.json DONE')
  })

  fs.writeFile('src/indexing/SETHD.json', SET1HD, (err) => {
    if (err) throw err
    console.log('Save SETHD.json DONE')
  })

  fs.writeFile('src/indexing/MAI.json', MAI, (err) => {
    if (err) throw err
    console.log('Save MAI.json DONE')
  })

  // History files
  fs.writeFile(`${historyPath}/SET100.json`, SET100, (err) => {
    if (err) throw err
    console.log('Save history of SET100.json DONE')
  })

  fs.writeFile(`${historyPath}/SET50.json`, SET50, (err) => {
    if (err) throw err
    console.log('Save history of SET50.json DONE')
  })

  fs.writeFile(`${historyPath}/SETHD.json`, SET1HD, (err) => {
    if (err) throw err
    console.log('Save history of SETHD.json DONE')
  })

  fs.writeFile(`${historyPath}/MAI.json`, MAI, (err) => {
    if (err) throw err
    console.log('Save history of MAI.json DONE')
  })
}
