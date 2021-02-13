import { ElementHandle } from 'puppeteer'
import { JittaStockDetail } from './jitta'
import { Industry } from './set'

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

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export interface StockDetail extends JittaStockDetail, Industry {}

export const prioratiseStock = (stockDetailList: StockDetail[]) => {
  /* 
  Ordering by
    1. Score
    2. Line percentage
    3. Factor percentage
  */

  return stockDetailList.sort(byScore)
}

export const getElementValue = async (element: ElementHandle) =>
  await element.evaluate((element: Element) => element.innerHTML)
