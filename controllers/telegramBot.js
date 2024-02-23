const sequelize = require('../db');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TEL_BOT_API;
const { User } = require('../models/models')
const { Op } = require("sequelize");

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

class BotController {
    async start() {
        try {
            bot.onText(/\/start/, async (msg) => {
                const chatId = msg.chat.id;
                if (chatId) {
                    // Send the response back to the user
                    bot.sendMessage(chatId, "Telegram id 👉 " + '||' + msg.from.id + "||", { parse_mode: 'markdownV2' });
                }

            });

            bot.on('message', (msg) => {
                if (msg.text != '/start') {
                }

            });
        } catch (error) {
            console.log(12, error.stak);
        }
    }

    async sendMessage(sendText, id) {
        try {
            if (id && sendText) {
                bot.sendMessage(id, sendText);
            }
            return 'send message'
        } catch (error) {
            console.log(51, error.stak);
            return error
        }
    }
}

module.exports = new BotController();
