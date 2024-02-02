// api/sendTelegramMessage.js
import axios from 'axios';

export const sendTelegramMessage = async (
  chatIds: {
    telegram_id: number;
    nguoi_nuoc_ngoai: boolean;
  }[],
  question: string[],
  questionEng: string[],
  expireTime: string
) => {
  try {
    const botToken = '6708017268:AAH6tuMNYB4Yh3qBRDHvBThEmRsXzKd3wO4';
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
[Please click here to vote](https://t.me/voteV3_2024_bot/voteApp)
`;
    // Inline keyboard button
    // const inlineKeyboard = {
    //   inline_keyboard: [
    //     [
    //       {
    //         text: 'Click here to open mini app',
    //         switch_inline_query_current_chat: 'voteV3', // Đặt command của mini-app của bạn ở đây
    //       },
    //     ],
    //   ],
    // };

    // Gửi tin nhắn cho từng chat ID trong mảng
    const sendMessages = chatIds.map(async (item) => {
      const data = {
        chat_id: item.telegram_id,
        text: item.nguoi_nuoc_ngoai === true ? messageContentEng : messageContent,
        parse_mode: 'MarkdownV2',
        // reply_markup: JSON.stringify(inlineKeyboard),
      };

      // Gửi yêu cầu POST sử dụng Axios
      const response = await axios.post(TELEGRAM_API_URL, data);

      // Xử lý phản hồi từ API Telegram
      console.log(`response khi gửi tin nhắn đến ${item.telegram_id}:`, response);
    });

    // Đợi cho tất cả các tin nhắn được gửi xong
    await Promise.all(sendMessages);
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
};
