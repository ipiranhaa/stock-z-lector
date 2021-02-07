import fs from 'fs'

import puppeteer, { Browser } from 'puppeteer'
import { getStockByIndex, intersecStocks } from './set'
import { getStockDetail, JittaStockDetail } from './jitta'
import { prioratiseStock } from './utilities'

// const set50Results = [
//   {
//     name: 'bbl',
//     price: '฿123.00',
//     lossChance: '49.7%',
//     linePercentage: '+67.92%',
//     score: '4.21',
//   },
//   {
//     name: 'intuch',
//     price: '฿55.75',
//     lossChance: '51.4%',
//     linePercentage: '+164.49%',
//     score: '3.65',
//   },
//   {
//     name: 'ivl',
//     price: '฿38.25',
//     lossChance: '49.7%',
//     linePercentage: '+722.47%',
//     score: '4.26',
//   },
//   {
//     name: 'kbank',
//     price: '฿138.00',
//     lossChance: '46.9%',
//     linePercentage: '+24.81%',
//     score: '4.15',
//   },
//   {
//     name: 'ktb',
//     price: '฿12.20',
//     lossChance: '44.5%',
//     linePercentage: '-30.63%',
//     score: '4.50',
//   },
//   {
//     name: 'lh',
//     price: '฿7.90',
//     lossChance: '51.4%',
//     linePercentage: '+87.78%',
//     score: '3.87',
//   },
//   {
//     name: 'ptt',
//     price: '฿39.00',
//     lossChance: '51.4%',
//     linePercentage: '+143.40%',
//     score: '3.68',
//   },
//   {
//     name: 'pttep',
//     price: '฿109.00',
//     lossChance: '44.5%',
//     linePercentage: '-55.33%',
//     score: '4.33',
//   },
//   {
//     name: 'pttgc',
//     price: '฿62.00',
//     lossChance: '54.0%',
//     linePercentage: '+716.42%',
//     score: '2.40',
//   },
//   {
//     name: 'scb',
//     price: '฿99.50',
//     lossChance: '49.7%',
//     linePercentage: '+98.22%',
//     score: '4.22',
//   },
//   {
//     name: 'scc',
//     price: '฿371.00',
//     lossChance: '45.0%',
//     linePercentage: '+13.03%',
//     score: '5.36',
//   },
//   {
//     name: 'tisco',
//     price: '฿94.25',
//     lossChance: '45.2%',
//     linePercentage: '-15.92%',
//     score: '5.56',
//   },
//   {
//     name: 'top',
//     price: '฿58.75',
//     lossChance: '57.7%',
//     linePercentage: '+100.00%',
//     score: '0.85',
//   },
//   {
//     name: 'ttw',
//     price: '฿12.00',
//     lossChance: '43.1%',
//     linePercentage: '+93.44%',
//     score: '6.22',
//   },
// ]

// const set100results = [
//   {
//     name: 'ap',
//     price: '฿7.50',
//     lossChance: '44.5%',
//     linePercentage: '-70.77%',
//     score: '4.65',
//   },
//   {
//     name: 'bbl',
//     price: '฿123.00',
//     lossChance: '49.7%',
//     linePercentage: '+67.92%',
//     score: '4.21',
//   },
//   {
//     name: 'bcp',
//     price: '฿26.00',
//     lossChance: '54.0%',
//     linePercentage: '+441.43%',
//     score: '2.30',
//   },
//   {
//     name: 'bcpg',
//     price: '฿15.00',
//     lossChance: '49.7%',
//     linePercentage: '+99.70%',
//     score: '4.65',
//   },
//   {
//     name: 'gunkul',
//     price: '฿2.60',
//     lossChance: '44.5%',
//     linePercentage: '-28.66%',
//     score: '4.21',
//   },
//   {
//     name: 'hana',
//     price: '฿54.25',
//     lossChance: '49.7%',
//     linePercentage: '+199.65%',
//     score: '4.29',
//   },
//   {
//     name: 'intuch',
//     price: '฿55.75',
//     lossChance: '51.4%',
//     linePercentage: '+164.49%',
//     score: '3.65',
//   },
//   {
//     name: 'ivl',
//     price: '฿38.25',
//     lossChance: '49.7%',
//     linePercentage: '+722.47%',
//     score: '4.26',
//   },
//   {
//     name: 'kbank',
//     price: '฿138.00',
//     lossChance: '46.9%',
//     linePercentage: '+24.81%',
//     score: '4.15',
//   },
//   {
//     name: 'kkp',
//     price: '฿57.25',
//     lossChance: '45.2%',
//     linePercentage: '-9.68%',
//     score: '5.09',
//   },
//   {
//     name: 'ktb',
//     price: '฿12.20',
//     lossChance: '44.5%',
//     linePercentage: '-30.63%',
//     score: '4.50',
//   },
//   {
//     name: 'lh',
//     price: '฿7.90',
//     lossChance: '51.4%',
//     linePercentage: '+87.78%',
//     score: '3.87',
//   },
//   {
//     name: 'major',
//     price: '฿19.50',
//     lossChance: '49.7%',
//     linePercentage: '+494.03%',
//     score: '4.75',
//   },
//   {
//     name: 'mbk',
//     price: '฿12.80',
//     lossChance: '46.6%',
//     linePercentage: '+35.98%',
//     score: '4.08',
//   },
//   {
//     name: 'ori',
//     price: '฿7.55',
//     lossChance: '43.9%',
//     linePercentage: '-77.20%',
//     score: '5.26',
//   },
//   {
//     name: 'ptt',
//     price: '฿39.00',
//     lossChance: '51.4%',
//     linePercentage: '+143.40%',
//     score: '3.68',
//   },
//   {
//     name: 'pttep',
//     price: '฿109.00',
//     lossChance: '44.5%',
//     linePercentage: '-55.33%',
//     score: '4.33',
//   },
//   {
//     name: 'pttgc',
//     price: '฿62.00',
//     lossChance: '54.0%',
//     linePercentage: '+716.42%',
//     score: '2.40',
//   },
//   {
//     name: 'qh',
//     price: '฿2.30',
//     lossChance: '46.6%',
//     linePercentage: '+36.34%',
//     score: '4.32',
//   },
//   {
//     name: 'scb',
//     price: '฿99.50',
//     lossChance: '49.7%',
//     linePercentage: '+98.22%',
//     score: '4.22',
//   },
//   {
//     name: 'scc',
//     price: '฿371.00',
//     lossChance: '45.0%',
//     linePercentage: '+13.03%',
//     score: '5.36',
//   },
//   {
//     name: 'tasco',
//     price: '฿20.50',
//     lossChance: '51.4%',
//     linePercentage: '+91.10%',
//     score: '3.05',
//   },
//   {
//     name: 'tcap',
//     price: '฿33.25',
//     lossChance: '45.0%',
//     linePercentage: '+15.69%',
//     score: '5.69',
//   },
//   {
//     name: 'thani',
//     price: '฿4.18',
//     lossChance: '43.9%',
//     linePercentage: '-64.67%',
//     score: '5.99',
//   },
//   {
//     name: 'tisco',
//     price: '฿94.25',
//     lossChance: '45.2%',
//     linePercentage: '-15.92%',
//     score: '5.56',
//   },
//   {
//     name: 'top',
//     price: '฿58.75',
//     lossChance: '57.7%',
//     linePercentage: '+100.00%',
//     score: '0.85',
//   },
//   {
//     name: 'tpipp',
//     price: '฿4.42',
//     lossChance: '43.9%',
//     linePercentage: '-69.92%',
//     score: '5.47',
//   },
//   {
//     name: 'ttw',
//     price: '฿12.00',
//     lossChance: '43.1%',
//     linePercentage: '+93.44%',
//     score: '6.22',
//   },
//   {
//     name: 'tvo',
//     price: '฿32.75',
//     lossChance: '47.4%',
//     linePercentage: '-11.43%',
//     score: '3.90',
//   },
//   {
//     name: 'whaup',
//     price: '฿4.14',
//     lossChance: '45.7%',
//     linePercentage: '-13.23%',
//     score: '4.29',
//   },
// ]

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

  fs.writeFile('dist/SET100.json', formattedSET100Json, (err) => {
    if (err) throw err
    console.log('Save SET100.json DONE')
  })

  fs.writeFile('dist/SET50.json', formattedSET50Json, (err) => {
    if (err) throw err
    console.log('Save SET50.json DONE')
  })
})()
