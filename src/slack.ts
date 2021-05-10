import dotenv from 'dotenv'
import { WebClient, Block } from '@slack/web-api'
import { StockDetail } from './utilities'

dotenv.config()

const web = new WebClient(process.env.SLACK_TOKEN)
const channelId = '#stock'

interface Section {
  type: string
  text: {
    type: string
    text: string
  }
  accessory?: {
    type: string
    text: {
      type: string
      emoji: boolean
      text: string
    }
    url: string
  }
}

const craftMessage = (stocks: StockDetail[]) => {
  const strongBuy: StockDetail[] = []
  const strongSell: StockDetail[] = []

  const emptySection: Section = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'Nothing',
    },
  }

  const computeStockSection = ({
    name,
    score,
    factorPercentage,
    dvdYield,
  }: StockDetail): Section => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*<https://www.tradingview.com/symbols/SET-${name}|${name}>* - ${score.toFixed(
        2
      )}\nFactors rate: ${factorPercentage}, DVD Yield: ${dvdYield}`,
    },
  })

  stocks.forEach((stock) => {
    if (stock.advice === 'Strong Buy') {
      strongBuy.push(stock)
    } else if (stock.advice === 'Strong Sell') {
      strongSell.push(stock)
    }
  })

  const strongBuySections = strongBuy.map((stock) => computeStockSection(stock))
  const strongSellSections = strongSell.map((stock) => computeStockSection(stock))

  if (!strongBuySections.length) {
    strongBuySections.push(emptySection)
  }

  if (!strongSellSections.length) {
    strongSellSections.push(emptySection)
  }

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Strong Buy',
      },
    },
    ...strongBuySections,
    {
      type: 'divider',
    },
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Strong Sell',
      },
    },
    ...strongSellSections,
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*<https://stock-z-lector.vercel.app/|Go to app>*',
      },
    },
  ] as Block[]
}

export const sendSlack = async (stocks: StockDetail[]) => {
  const message = craftMessage(stocks)
  const response = await web.chat.postMessage({
    channel: channelId,
    text: 'Daily report',
    blocks: message,
  })
  console.log('Slack message sent: ', response.ts)
}
