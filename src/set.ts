import { Browser, ElementHandle, Page } from 'puppeteer'
import { industries, Industry } from './configuration/industries'
import { defaultOptions } from './puppeteer-config'
import { getElementValue, handleGetElements } from './utilities'

type StockIndexing = 'SET50' | 'SET100' | 'SETHD' | 'MAI'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150  Safari/537.36'

const tableBodyXPath = '//*[@id="maincontent"]/div/div[2]/div/div/div/div[3]/table/tbody/tr'

const peXPath = '//*[@id="maincontent"]/div/div[3]/table/tbody/tr[2]/td/div[2]/div[1]/div[2]'
const pbvXPath = '//*[@id="maincontent"]/div/div[3]/table/tbody/tr[2]/td/div[3]/div[1]/div[2]'
const dvdYieldXPath = '//*[@id="maincontent"]/div/div[3]/table/tbody/tr[2]/td/div[2]/div[2]/div[2]'

const industryXPath =
  '//*[@id="maincontent"]/div/div[3]/table/tbody/tr[3]/td/div/div[1]/div[2]/div[2]'
const sectorXPath =
  '//*[@id="maincontent"]/div/div[3]/table/tbody/tr[3]/td/div/div[1]/div[3]/div[2]'

//
// ─── UTILITIES ──────────────────────────────────────────────────────────────────
//

const getAllStockByElements = async (elements: ElementHandle<Node>[]) => {
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

export interface SETStockDetail {
  pe: number | string
  pbv: number | string
  dvdYield: string
  industry: string
  sector: string
}

export interface SETStockDetailIndex {
  [key: string]: SETStockDetail
}

export const getStockProfile = async (browser: Browser, stocks: string[]) => {
  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.setDefaultNavigationTimeout(0)
  const result: SETStockDetailIndex = {}

  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index]
    console.info(`Getting SET ${stock} profile...`)

    await page.goto(
      `https://www.set.or.th/set/companyprofile.do?symbol=${stock}&language=en&country=US`
    )

    await page.waitForXPath(peXPath, defaultOptions)
    await page.waitForXPath(pbvXPath, defaultOptions)
    await page.waitForXPath(dvdYieldXPath, defaultOptions)
    await page.waitForXPath(industryXPath, defaultOptions)
    await page.waitForXPath(sectorXPath, defaultOptions)

    const peElements = (await handleGetElements(() => page.$x(peXPath))) as ElementHandle<Element>[]
    const pbvElements = (await handleGetElements(() =>
      page.$x(pbvXPath)
    )) as ElementHandle<Element>[]
    const dvdYieldElements = (await handleGetElements(() =>
      page.$x(dvdYieldXPath)
    )) as ElementHandle<Element>[]
    const industryElements = (await handleGetElements(() =>
      page.$x(industryXPath)
    )) as ElementHandle<Element>[]
    const sectorElements = (await handleGetElements(() =>
      page.$x(sectorXPath)
    )) as ElementHandle<Element>[]

    const pe = await getElementValue(peElements[0])
    const pbv = await getElementValue(pbvElements[0])
    const dvdYield = await getElementValue(dvdYieldElements[0])
    const industry = await getElementValue(industryElements[0])
    const sector = await getElementValue(sectorElements[0])

    result[stock] = {
      pe: Number(pe) || '',
      pbv: Number(pbv) || '',
      dvdYield: `${dvdYield.trim()}%`,
      industry: industry.replace('&amp;', '&'),
      sector: sector.replace('&amp;', '&'),
    }
    console.info(`Get SET ${stock} profile... DONE`)
  }

  page.close()

  return result
}

export const getStockByIndex = async (
  browser: Browser,
  indexing: StockIndexing,
  industry?: Industry
) => {
  const industryLogPrefix = industry ? ` - ${industry}` : ''
  console.info(`Getting ${indexing}${industryLogPrefix} stock list...`)

  let url = `https://classic.set.or.th/mkt/sectorquotation.do?sector=${indexing}&language=en&country=US`
  if (industry) {
    url = `https://classic.set.or.th/mkt/sectorquotation.do?market=${indexing}&sector=${industry}&language=en&country=US`
  }

  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.setDefaultNavigationTimeout(0)
  await page.goto(url)

  await page.waitForXPath(tableBodyXPath, defaultOptions)

  const elements = await handleGetElements(() => page.$x(tableBodyXPath))
  const stocks = await getAllStockByElements(elements)
  page.close()

  console.info(`Get ${indexing}${industryLogPrefix} stock list... DONE`)

  return stocks
}

export const getMAIStock = async (browser: Browser) => {
  const industryCodeList = Object.keys(industries) as Industry[]
  const maiPromises = industryCodeList.map((industry) => getStockByIndex(browser, 'MAI', industry))

  const result = await Promise.all(maiPromises).then((stockByIndustries) => {
    return stockByIndustries.reduce((total, stocks) => {
      return [...total, ...stocks]
    }, [])
  })

  return result
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
