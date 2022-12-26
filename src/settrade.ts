import { format, addYears } from 'date-fns'
import { Browser, ElementHandle, Page } from 'puppeteer'
import { userAgent } from './puppeteer-config'
import { dateFormat } from './settings'
import { getElementValue, handleGetElements } from './utilities'
import mapThMonthToNumber from './utils/mapThMonthToNumber'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const XdTabButtonXPath =
  '//*[@id="__layout"]/div/div[2]/div[3]/div/div/div/div/div[1]/div[2]/div[1]/button[2]'
const lastDividendDateXPath = '//*[contains(@class, "table-hover-underline")]/tbody/tr[1]/td[1]'

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export interface SetTradeStockDetail {
  dividend: {
    lastDate: string
    predictedDate: string
  }
}

interface SetTradeStockIndex {
  [name: string]: SetTradeStockDetail
}

export const getStockEvent = async (browser: Browser, stocks: string[]) => {
  const page: Page = await browser.newPage()
  await page.setUserAgent(userAgent)
  await page.setDefaultNavigationTimeout(0)
  const result: SetTradeStockIndex = {}

  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index]
    console.info(`Getting ${stock} XD detail...`)

    await page.goto(`https://www.settrade.com/th/equities/quote/${stock}/rights-benefits`)

    // Note: Handle disappear row of table
    let lastDividendDate: string | undefined
    try {
      const [xdButtonElement] = (await page.$x(XdTabButtonXPath)) as ElementHandle<Element>[]
      await xdButtonElement.click()
      await page.waitForXPath(lastDividendDateXPath, { timeout: 15000 })
      const lastDividendDateElements = (await handleGetElements(() =>
        page.$x(lastDividendDateXPath)
      )) as ElementHandle<Element>[]
      const thDate = await getElementValue(lastDividendDateElements[0])
      const [date, thMonth, thYear] = thDate.trim().split(' ')
      const dateNo = Number(date) >= 10 ? date : `0${date}`
      lastDividendDate = `${dateNo}/${mapThMonthToNumber(thMonth)}/${Number(thYear) - 543}` // 29/04/2022
    } catch {
      lastDividendDate = '-'
    }

    let predictedDividendDate = '-'

    if (lastDividendDate && lastDividendDate !== '-') {
      const [predictedDividendDay, predictedDividendMonth, predictedDividendYear] =
        lastDividendDate.split('/')
      predictedDividendDate = format(
        addYears(
          new Date(
            Number(predictedDividendYear),
            Number(predictedDividendMonth) - 1,
            Number(predictedDividendDay)
          ),
          1
        ),
        dateFormat
      )
    }

    result[stock] = {
      dividend: {
        lastDate: lastDividendDate,
        predictedDate: predictedDividendDate,
      },
    }
    console.info(`Get ${stock} XD detail... DONE`)
  }

  await page.close()

  return result
}
