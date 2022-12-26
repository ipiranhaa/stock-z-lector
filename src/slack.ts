import dotenv from 'dotenv'
import { WebClient } from '@slack/web-api'

dotenv.config()

const web = new WebClient(process.env.SLACK_TOKEN)
const channelId = '#stock'

export const sendSlack = async () => {
  const message = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Strong Buy',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Updated stock indexes*`,
      },
    },
  ]
  const response = await web.chat.postMessage({
    channel: channelId,
    text: 'Report',
    blocks: message,
  })
  console.log('Slack message sent: ', response.ts)
}
