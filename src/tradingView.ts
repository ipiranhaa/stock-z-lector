import { Browser, Page } from 'puppeteer'
import { getElementValue, handleGetElements } from './utilities'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150  Safari/537.36'

const topDetailXPath = '//*[@id="anchor-page-1"]/div/div[3]/div[3]'
const summaryXPath = '//*[@id="technicals-root"]/div/div/div[2]/div[2]/span[2]'

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export interface TradingViewDetail {
  advice: string
}

export interface TradingViewStock {
  [stock: string]: TradingViewDetail
}

export const getStockTechnical = async (browser: Browser, stocks: string[]) => {
  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.setDefaultNavigationTimeout(0)
  const result: TradingViewStock = {}

  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index]
    console.info(`Getting ${stock} technicals...`)

    await page.goto(`https://www.tradingview.com/symbols/SET-${stock}/technicals/`)

    // Wait for 1 second to wait data display
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await page.waitForXPath(topDetailXPath)
    await page.waitForXPath(summaryXPath)

    const adviceElements = await handleGetElements(() => page.$x(summaryXPath))
    const advice = await getElementValue(adviceElements[0])
    result[stock] = {
      advice,
    }
    console.info(`Get ${stock} technicals... DONE`)
  }

  page.close()

  return result
}
