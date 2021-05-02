import { format, addYears } from 'date-fns'
import { Browser, Page } from 'puppeteer'
import { century, dateFormat } from './settings'
import { getElementValue, handleGetElements } from './utilities'

//
// ─── SETTINGS ───────────────────────────────────────────────────────────────────
//

const userAgent =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150  Safari/537.36'

const lastDividendDateXPath =
  '//*[@id="maincontent"]/div/div[1]/div[1]/div/div[2]/div[5]/div/div/table/tbody/tr[1]/td[1]'

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
  const result: SetTradeStockIndex = {}

  for (let index = 0; index < stocks.length; index++) {
    const stock = stocks[index]
    console.info(`Getting ${stock} XD detail...`)

    await page.goto(
      `https://www.settrade.com/C04_07_stock_rightsandbenefit_p1.jsp?txtSymbol=${stock}`
    )

    // Note: Handle disappear row of table
    let lastDividendDate: string | undefined
    try {
      await page.waitForXPath(lastDividendDateXPath, { timeout: 15000 })
      const lastDividendDateElements = await handleGetElements(() => page.$x(lastDividendDateXPath))
      lastDividendDate = await getElementValue(lastDividendDateElements[0])
    } catch {
      lastDividendDate = undefined
    }

    let predictedDividendDate = '-'
    let formattedLastDividendDate = '-'

    if (lastDividendDate && lastDividendDate !== '-') {
      const [lastDividendDay, lastDividendMonth, lastDividendYear] = lastDividendDate.split('/')
      const lastDividendFullYear = `${century}${lastDividendYear}`
      formattedLastDividendDate = `${lastDividendDay}/${lastDividendMonth}/${lastDividendFullYear}`

      const [
        predictedDividendDay,
        predictedDividendMonth,
        predictedDividendYear,
      ] = lastDividendDate.split('/')
      predictedDividendDate = format(
        addYears(
          new Date(
            Number(`${century}${predictedDividendYear}`),
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
        lastDate: formattedLastDividendDate,
        predictedDate: predictedDividendDate,
      },
    }
    console.info(`Get ${stock} XD detail... DONE`)
  }

  page.close()

  return result
}
