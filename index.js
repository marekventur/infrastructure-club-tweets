const { App } = require('@slack/bolt');
var Twitter = require('twitter');

const ACKS_NEEDED = 2;

// For local development
require('dotenv').config();

// Initializes your app with your bot token and signing secret
const slack = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

var twitter = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const tweet = (status) => new Promise((resolve, reject) => {
  twitter.post("statuses/update", { status }, (error, tweet) => {
    if (error) {
      return reject(error);
    } 
    resolve(tweet);
  })
})

slack.message(/[tT]weet:/, async({event, client}) => {
  await client.reactions.add({
    timestamp: event.ts,
    channel: event.channel,
    name: "bird",
  })
});

slack.event("reaction_added", async({event, client, say}) => {
  const {item} = event;
  const { message } = await client.reactions.get({ timestamp: item.ts, channel: item.channel, full: true })
  const birdReactions = message.reactions.find(e => e.name === "bird");
  if (birdReactions && birdReactions.count > ACKS_NEEDED) {
    const [_, text] = message.text.split(/[Tt]weet[: ]+/);
    if (text) {
      try { 
        const {user, id_str} = await tweet(text);
        const url = `https://twitter.com/${user.screen_name}/status/${id_str}`;
        console.log("Tweeted:", text, url);
        await say({
          text: url,
          thread_ts: message.thread_ts || message.ts,
        });
      } catch (e) {
        console.log("Twitter error:", e);
      }
    }    
  }
});

(async () => {
  await slack.start(process.env.PORT || 3000);
  console.log('Slack bot is running');
})();

