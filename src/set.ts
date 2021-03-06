import { Browser, ElementHandle, Page } from 'puppeteer'
import { getElementValue, handleGetElements } from './utilities'

type StockIndexing = 'SET50' | 'SET100' | 'SETHD'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150  Safari/537.36'

const tableBodyXPath = '//*[@id="maincontent"]/div/div[2]/div/div/div/div[3]/table/tbody/tr'

const industryXPath =
  '//*[@id="maincontent"]/div/div[3]/table/tbody/tr[3]/td/div/div[1]/div[2]/div[2]'
const sectorXPath =
  '//*[@id="maincontent"]/div/div[3]/table/tbody/tr[3]/td/div/div[1]/div[3]/div[2]'

//
// ─── UTILITIES ──────────────────────────────────────────────────────────────────
//

const getAllStockByElements = async (elements: ElementHandle[]) => {
  const stocks = []
  for (let index = 0; index < elements.length; index++) {
    const name = await elements[index].$eval('td > a', (a: Element) => a.innerHTML)
    stocks.push(name.trim())
  }

  return stocks
}

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export interface Industry {
  industry: string
  sector: string
}

export interface StockWithIndustry {
  [key: string]: Industry
}

export const getStockIndustry = async (browser: Browser, stocks: string[]) => {
  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  const result: StockWithIndustry = {}

  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index]
    console.info(`Getting ${stock} industry...`)

    await page.goto(
      `https://www.set.or.th/set/companyprofile.do?symbol=${stock}&language=en&country=US`
    )
    const industryElements = await handleGetElements(() => page.$x(industryXPath))
    const sectorElements = await handleGetElements(() => page.$x(sectorXPath))
    const industry = await getElementValue(industryElements[0])
    const sector = await getElementValue(sectorElements[0])
    result[stock] = {
      industry: industry.replace('&amp;', '&'),
      sector: sector.replace('&amp;', '&'),
    }
    console.info(`Get ${stock} industry... DONE`)
  }

  page.close()

  return result
}

export const getStockByIndex = async (browser: Browser, indexing: StockIndexing) => {
  console.info(`Getting ${indexing} stock list...`)

  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.goto(
    `https://marketdata.set.or.th/mkt/sectorquotation.do?sector=${indexing}&language=en&country=US`
  )
  const elements = await handleGetElements(() => page.$x(tableBodyXPath))
  const stocks = await getAllStockByElements(elements)
  page.close()

  console.info(`Get ${indexing} stock list... DONE`)

  return stocks
}

export const intersecStocks = (listA: string[], listB: string[]) => {
  let bigList = listA
  let smallList = listB

  if (listA.length < listB.length) {
    bigList = listB
    smallList = listA
  }

  return bigList.filter((item) => smallList.includes(item))
}
