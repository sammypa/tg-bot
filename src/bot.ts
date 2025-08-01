import { Telegraf } from 'telegraf';
import { db } from "../src/lib/db";
import * as dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN || '');

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || '';
  const firstName = ctx.from.first_name || '';

  console.log("User started bot:", { userId, username, firstName });

  try {
    // Save or update user
    await db.query(
      `INSERT INTO telegram_ids (user_id, username)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE username = VALUES(username)`,
      [userId, username]
    );

    // Check if user is in the group
    const member = await ctx.telegram.getChatMember(process.env.GROUP_ID!, userId);

    if (
      member.status === 'member' ||
      member.status === 'creator' ||
      member.status === 'administrator'
    ) {
      ctx.reply(`✅ Hi ${firstName}, you're already in the group. Thank you!`);
    } else {
      ctx.reply('❌ Please join our Telegram group before proceeding: https://t.me/dyfusionchain');
    }

  } catch (err) {
    console.error('Error in bot /start:', err);
    ctx.reply('⚠️ Failed to save your details. Please try again later.');
  }
});

bot.launch();
