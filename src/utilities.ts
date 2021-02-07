import { JittaStockDetail } from './jitta'

//
// ─── UTILITIES ──────────────────────────────────────────────────────────────────
//

const byScore = (aDetail: JittaStockDetail, bDetail: JittaStockDetail) => {
  const aLinePercentage = Number(aDetail.linePercentage.split('%')[0])
  const bLinePercentage = Number(bDetail.linePercentage.split('%')[0])

  return (
    bDetail.score - aDetail.score ||
    aLinePercentage - bLinePercentage ||
    bDetail.factorPercentage - aDetail.factorPercentage
  )
}

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export const prioratiseStock = (stockDetailList: JittaStockDetail[]) => {
  /* 
  Ordering by
    1. Score
    2. Line percentage
    3. Factor percentage
  */

  return stockDetailList.sort(byScore)
}
