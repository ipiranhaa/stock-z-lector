import { Browser, ElementHandle, Page } from 'puppeteer'

type StockIndexing = 'SET50' | 'SET100' | 'SETHD'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150  Safari/537.36'
const tableBodyXPath = '//*[@id="maincontent"]/div/div[2]/div/div/div/div[3]/table/tbody/tr'

const getAllStockByElements = async (elements: ElementHandle[]) => {
  const stocks = []
  for (let index = 0; index < elements.length; index++) {
    const name = await elements[index].$eval('td > a', (a: Element) => a.innerHTML)
    stocks.push(name.trim())
  }

  return stocks
}

export const getStockByIndex = async (browser: Browser, indexing: StockIndexing) => {
  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.goto(
    `https://marketdata.set.or.th/mkt/sectorquotation.do?sector=${indexing}&language=th&country=TH`
  )
  const elements = await page.$x(tableBodyXPath)
  const stocks = await getAllStockByElements(elements)

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
