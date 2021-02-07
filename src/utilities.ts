import { JittaStockDetail } from './jitta'

//
// ─── UTILITIES ──────────────────────────────────────────────────────────────────
//

const byScore = (aDetail: JittaStockDetail, bDetail: JittaStockDetail) => {
  const aScore = Number(aDetail.score)
  const bScore = Number(bDetail.score)

  const aLinePercentage = Number(aDetail.linePercentage.split('%')[0])
  const bLinePercentage = Number(bDetail.linePercentage.split('%')[0])

  return bScore - aScore || aLinePercentage - bLinePercentage
}

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export const prioratiseStock = (stockDetailList: JittaStockDetail[]) => {
  /* 
  Ordering by
    1. Score
    2. Line percentage
  */

  return stockDetailList.sort(byScore)
}
