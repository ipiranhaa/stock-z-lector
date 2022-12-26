import { Browser, ElementHandle, Page } from 'puppeteer'
import { defaultOptions, userAgent } from './puppeteer-config'
import { getElementValue, handleGetElements } from './utilities'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const priceXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[1]/div[1]/div/div[2]'
const lossChanceXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[1]/div[2]/div[2]'
const lineXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[3]'
const scoreXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[2]'

const factorXPath = '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[5]/div[1]/div'

const notFoundXPath = '//*[@id="app"]/div/div[3]/div/div/div[1]/div/div/div/h1'

//
// ─── UTILITIES ──────────────────────────────────────────────────────────────────
//

const getLine = async (elements: ElementHandle[]) => {
  const selectedElement = elements[0]
  const getPercentValue = (html: string) => html.split('%')[0].replace('&gt; ', '')
  const percentHtml = await selectedElement.evaluate((element: Element) => element.innerHTML)
  const percent = getPercentValue(percentHtml)
  const indicator = await selectedElement.$eval('span', (element: Element) => element.innerHTML)
  const isUnderLine = indicator.toLowerCase().includes('under')
  const result = isUnderLine ? `-${percent}%` : `+${percent}%`

  return result
}

const getScore = async (elements: ElementHandle[]) => {
  const selectedElement = elements[0]
  const getScoreValue = (html: string) => html.split('</span>')[1].split('<span')[0]
  const scoreHtml = await selectedElement.evaluate((element: Element) => element.innerHTML)

  return getScoreValue(scoreHtml)
}

const getFactorScore = async (elements: ElementHandle[]) => {
  const selectedElement = elements[0]
  const factorHtmls = await selectedElement.$$eval(
    'div > span:first-child',
    (elements: Element[]) => elements.map((element) => element.innerHTML)
  )
  const total = factorHtmls
    .map((factorHtml) => Number(factorHtml.split('(')[1].split(')')[0]))
    .reduce((total, score) => total + score, 0)

  return { totalFactorScore: total, factorCount: factorHtmls.length }
}

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export interface JittaStockDetail {
  name: string
  price: string
  lossChance: string
  linePercentage: string
  score: number
  factorPercentage: string
}

const getStockDetail = async (browser: Browser, stock: string) => {
  const stockName = stock.toUpperCase()
  console.info(`Getting ${stockName} detail...`)

  try {
    const page: Page = await browser.newPage()
    await page.setUserAgent(userAgent)
    await page.setViewport({ width: 1366, height: 768 })
    await page.setDefaultNavigationTimeout(0)
    await page.goto(`https://www.jitta.com/stock/bkk:${stock}`)

    const notFoundTitle = await page.$x(notFoundXPath)
    if (!notFoundTitle.length) {
      let price = ''
      let lossChance = ''
      let linePercentage = ''
      let score = ''
      let totalFactorPercentage = ''

      try {
        await page.waitForXPath(priceXPath, defaultOptions)
        const priceElements = (await handleGetElements(() =>
          page.$x(priceXPath)
        )) as ElementHandle<Element>[]
        price = await getElementValue(priceElements[0])
      } catch {
        price = 'N/A'
      }

      try {
        await page.waitForXPath(lossChanceXPath, defaultOptions)
        const lossChanceElements = (await handleGetElements(() =>
          page.$x(lossChanceXPath)
        )) as ElementHandle<Element>[]
        lossChance = await getElementValue(lossChanceElements[0])
      } catch {
        lossChance = 'N/A'
      }

      try {
        await page.waitForXPath(lineXPath, defaultOptions)
        const lineElements = (await handleGetElements(() =>
          page.$x(lineXPath)
        )) as ElementHandle<Element>[]
        linePercentage = await getLine(lineElements)
      } catch {
        linePercentage = 'N/A'
      }

      try {
        await page.waitForXPath(scoreXPath, defaultOptions)
        const scoreElements = (await handleGetElements(() =>
          page.$x(scoreXPath)
        )) as ElementHandle<Element>[]
        score = await getScore(scoreElements)
      } catch {
        score = 'N/A'
      }

      // Factors
      try {
        await page.waitForXPath(factorXPath, defaultOptions)
        const factorElements = (await page.$x(factorXPath)) as ElementHandle<Element>[]
        const { totalFactorScore, factorCount } = await getFactorScore(factorElements)
        totalFactorPercentage = `${((totalFactorScore / (100 * factorCount)) * 100).toFixed(2)}%`
      } catch {
        totalFactorPercentage = 'N/A'
      }

      await page.close()

      console.info(`Get ${stockName} detail... DONE`)

      return {
        name: stockName,
        price,
        lossChance,
        linePercentage,
        score: Number(score),
        factorPercentage: totalFactorPercentage,
      } as JittaStockDetail
    } else {
      // Stock detail page not available
      return {
        name: stockName,
        price: '-',
        lossChance: '-',
        linePercentage: '-',
        score: NaN,
        factorPercentage: '-',
      } as JittaStockDetail
    }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const getAllStockDetail = async (browser: Browser, stocks: string[]) => {
  const result = []
  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index].toLowerCase()
    const detail = await getStockDetail(browser, stock)
    result.push(detail)
  }

  return result
}
