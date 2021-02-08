import { JittaStockDetail } from './jitta'

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

export const prioratiseStock = (stockDetailList: JittaStockDetail[]) => {
  /* 
  Ordering by
    1. Score
    2. Line percentage
    3. Factor percentage
  */

  return stockDetailList.sort(byScore)
}
