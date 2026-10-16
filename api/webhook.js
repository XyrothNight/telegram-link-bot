const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const WEBSITE_URL = process.env.WEBSITE_URL;

export default async function handler(req, res) {
  // Only accept POST requests from Telegram
  if (req.method !== "POST") {
    return res.status(200).send("Bot is running!");
  }

  // Verify that the request contains our secret
  const receivedSecret =
    req.headers["x-telegram-bot-api-secret-token"];

  if (
    !WEBHOOK_SECRET ||
    receivedSecret !== WEBHOOK_SECRET
  ) {
    return res.status(401).send("Unauthorized");
  }

  // Read the incoming Telegram update
  const update = req.body;

  // Ignore updates that are not text messages
  if (!update || !update.message) {
    return res.status(200).send("OK");
  }

  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text || "";

  // Respond only when the user sends /start
  if (!/^\/start(?:@\w+)?(?:\s|$)/.test(text)) {
    return res.status(200).send("OK");
  }

  // Send the website link to the user
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text:
            "Welcome to Xnight CN!\n\n" +
            "Xnight CN is a private, invite-only community built for Chinese Web3 users to connect, engage, and grow together on 𝕏.\n\n" +
            "Access is limited. Explore our website to learn more about the community.\n\n" +
            "👇 Tap below to explore Xnight CN\n" +
            "(Send access request if you are eligible)",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔗 Explore Xnight CN",
                  url: WEBSITE_URL,
                },
              ],
            ],
          },
        }),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      console.error("Telegram API error:", result);
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Failed to send message:", error);

    return res.status(500).send("Failed to send message");
  }
}