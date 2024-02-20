/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
// api/sendTelegramMessage.js
import axios from 'axios';
import { child, get, push, ref, set } from 'firebase/database';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';

const saveLogsStatusSendMessageTelegram = async (chatId: number, keyQuestions: string[]) => {
  const saveLogStatusSendPollRef = ref(database, FIREBASE_COLLECTION.LOGS_STATUS_SEND_POLL);
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
const saveHistorySendMessageBot = async (messageId: number, chatId: number) => {
  const saveLogStatusSendPollRef = ref(database, FIREBASE_COLLECTION.HISTORY_SEND_MESSAGE_BOT);

  try {
    // Tạo một reference mới cho mỗi dữ liệu được lưu
    const newMessageRef = push(saveLogStatusSendPollRef);

    // Định nghĩa dữ liệu mới để lưu vào Firebase
    const newMessageData = {
      messageId,
      chatId,
    };

    // Sử dụng set() để lưu dữ liệu mới vào Firebase
    await set(newMessageRef, newMessageData);

    console.log('Message history saved successfully:', newMessageData);
  } catch (error) {
    console.error('Error saving message history:', error);
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

  try {
    // hàng đợi để gửi tin nhắn và lưu log
    const sendMessagesQueue = chatIds.map(async (item) => {
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

      try {
        // Gửi tin nhắn và chờ phản hồi
        const response = await axios.post(TELEGRAM_API_URL, data);
        console.log(`Response khi gửi tin nhắn đến ${item.telegram_id}:`, response);
        // Lưu log
        // await saveLogsStatusSendMessageTelegram(item.telegram_id, keyQuestion);
        return { chatId: item.telegram_id, message_id: response.data.result.message_id };
      } catch (error) {
        console.error(`Error sending message to chatId ${item.telegram_id}:`, error);
        return { chatId: item.telegram_id, error };
      }
    });

    // Đợi cho tất cả các tin nhắn được gửi
    const results = await Promise.all(sendMessagesQueue);
    for (const result of results) {
      const { chatId, message_id, error } = result;
      if (!error) {
        await saveLogsStatusSendMessageTelegram(chatId, keyQuestion);
        await saveHistorySendMessageBot(message_id, chatId);
      }
    }
  } catch (error) {
    console.error('Error sending messages to Telegram:', error);
  }
};
