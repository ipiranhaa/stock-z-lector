import { Browser, ElementHandle, Page } from 'puppeteer'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150  Safari/537.36'

const priceXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[1]/div[1]/div/div[2]'
const lossChanceXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[1]/div[2]/div[2]'
const lineXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[3]'
const scoreXPath =
  '//*[@id="app"]/div/div[3]/div/div/div/div[3]/div[1]/div/div/div[1]/div[1]/div/div[2]'

//
// ─── UTILITIES ──────────────────────────────────────────────────────────────────
//

const getElementValue = async (element: ElementHandle) =>
  await element.evaluate((element: Element) => element.innerHTML)

const getLine = async (elements: ElementHandle[]) => {
  const selectedElement = elements[0]
  const getPercentValue = (html: string) => html.split('%')[0]
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

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export interface JittaStockDetail {
  name: string
  price: string
  lossChance: string
  linePercentage: string
  score: string
}

export const getStockDetail = async (browser: Browser, stock: string) => {
  console.info(`Getting ${stock.toUpperCase()} detail...`)

  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.goto(`https://www.jitta.com/stock/bkk:${stock}`)

  const priceElements = await page.$x(priceXPath)
  const price = await getElementValue(priceElements[0])

  const lossChanceElements = await page.$x(lossChanceXPath)
  const lossChance = await getElementValue(lossChanceElements[0])

  const lineElements = await page.$x(lineXPath)
  const linePercentage = await getLine(lineElements)

  const ScoreElements = await page.$x(scoreXPath)
  const score = await getScore(ScoreElements)

  console.info(`Get ${stock.toUpperCase()} detail... DONE`)

  return { name: stock, price, lossChance, linePercentage, score } as JittaStockDetail
}
