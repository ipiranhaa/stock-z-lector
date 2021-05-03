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
  const buy: StockDetail[] = []
  const strongSell: StockDetail[] = []

  const emptySection: Section = {
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: 'Nothing',
    },
  }

  const computeStockSection = ({ name, factorPercentage, dvdYield }: StockDetail): Section => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${name}* - Score\nFactors rate: ${factorPercentage}, DVD: ${dvdYield}`,
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        emoji: true,
        text: 'View',
      },
      url: `https://www.tradingview.com/symbols/SET-${name}`,
    },
  })

  stocks.forEach((stock) => {
    if (stock.advice === 'Strong Buy') {
      strongBuy.push(stock)
    } else if (stock.advice === 'Buy') {
      buy.push(stock)
    } else if (stock.advice === 'Strong Sell') {
      strongSell.push(stock)
    }
  })

  const strongBuySections = strongBuy.map((stock) => computeStockSection(stock))
  const buySections = buy.map((stock) => computeStockSection(stock))
  const strongSellSections = strongSell.map((stock) => computeStockSection(stock))

  if (!strongBuySections.length) {
    strongBuySections.push(emptySection)
  }

  if (!buySections.length) {
    buySections.push(emptySection)
  }

  if (!strongSellSections.length) {
    strongSellSections.push(emptySection)
  }

  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*_Strong Buy_*',
      },
    },
    ...strongBuySections,
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*_Buy_*',
      },
    },
    ...buySections,
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*_Strong Sell_*',
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
        text: '*<https://stock-z-lector.vercel.app/|Show more>*',
      },
    },
  ] as Block[]
}

export const sendSlack = async (stocks: StockDetail[]) => {
  const message = craftMessage(stocks)
  const res = await web.chat.postMessage({
    channel: channelId,
    text: 'Exceptions',
    blocks: message,
  })
  console.log('Slack message sent: ', res.ts)
}
