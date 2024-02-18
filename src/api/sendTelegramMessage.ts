/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
// api/sendTelegramMessage.js
import axios from 'axios';
import { child, get, push, ref, set } from 'firebase/database';
import { database } from 'src/firebase/firebase.config';

const saveLogsStatusSendMessageTelegram = async (chatId: number, keyQuestions: string[]) => {
  const saveLogStatusSendPollRef = ref(database, 'save_logs_status_send_poll_telegram');
  for (const keyQuestion of keyQuestions) {
    const keyQuestionPath = `${keyQuestion}/`;
    // Kiểm tra xem keyQuestion đã tồn tại trong collection chưa
    const snapshot = await get(child(saveLogStatusSendPollRef, keyQuestionPath));

    if (snapshot.exists()) {
      const listUserSentSuccessRef = child(
        saveLogStatusSendPollRef,
        `${keyQuestionPath}/listUserSentSuccess`
      );
      const listUserSentSuccessSnapshot = await get(listUserSentSuccessRef);

      if (listUserSentSuccessSnapshot.exists()) {
        const listUserSentSuccess = listUserSentSuccessSnapshot.val();
        if (!listUserSentSuccess.includes(chatId)) {
          listUserSentSuccess.push(chatId);
          await set(listUserSentSuccessRef, listUserSentSuccess);
        }
      } else {
        await set(listUserSentSuccessRef, [chatId]);
      }
    } else {
      await set(child(saveLogStatusSendPollRef, keyQuestionPath), {
        keyQuestion,
        listUserSentSuccess: [chatId],
      });
    }
  }
};

export const sendTelegramMessage = async (
  chatIds: {
    telegram_id: number;
    nguoi_nuoc_ngoai: boolean;
  }[],
  question: string[],
  questionEng: string[],
  expireTime: string,
  keyQuestion: string[]
) => {
  try {
    const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const messageContent = `
           *BẦU CỬ HỘI ĐỒNG V3 COMPANY 2024*

Đã đến thời gian bỏ phiếu : *${question}*
*Thời hạn :* ${expireTime}

    `;
    const messageContentEng = `
*Shareholder election V3 COMPANY 2024*

It's time to vote: : *${questionEng}*
*Due time :* ${expireTime}

`;

    // Tạo một hàng đợi để lưu tất cả các tin nhắn được gửi đi
    const sendMessagesQueue = [];

    // Thêm các tin nhắn vào hàng đợi
    for (const item of chatIds) {
      const button = {
        text: item.nguoi_nuoc_ngoai === true ? 'Click To Vote' : 'Click để bỏ phiếu',
        web_app: { url: 'https://vote-v3.vercel.app' },
      };
      const keyboard = {
        inline_keyboard: [[button]],
      };

      const data = {
        chat_id: item.telegram_id,
        text: item.nguoi_nuoc_ngoai === true ? messageContentEng : messageContent,
        parse_mode: 'MarkdownV2',
        reply_markup: JSON.stringify(keyboard),
      };

      // Thêm request gửi tin nhắn vào hàng đợi
      sendMessagesQueue.push(axios.post(TELEGRAM_API_URL, data));
    }

    // Gửi tất cả các tin nhắn đồng thời
    const responses = await Promise.all(sendMessagesQueue);

    // Xử lý phản hồi từ API Telegram và lưu logs vào Firebase
    for (let i = 0; i < chatIds.length; i += 1) {
      const chatId = chatIds[i].telegram_id;
      const response = responses[i];
      await saveLogsStatusSendMessageTelegram(response.data.result.chat.id, keyQuestion);
      console.log(`response khi gửi tin nhắn đến ${chatId}:`, response);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
};
