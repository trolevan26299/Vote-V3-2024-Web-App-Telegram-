// api/sendTelegramMessage.js
import axios from 'axios';

export const sendTelegramMessage = async (chatIds: number[]) => {
  try {
    const botToken = '6872762324:AAGptEaYwW5EQB7q7qLZbc9HYOsawXK1DTg';
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const messageContent = `
           *BẦU CỬ HỘI ĐỒNG V3 COMPANY 2024*

*Thời hạn :* 1 Giờ
*Nội dung :* Thông qua bầu cử theo cổ phần

[Click vào đây để tham gia](https://t.me/voteV3Bot/voteappv3)
    `;

    // Gửi tin nhắn cho từng chat ID trong mảng
    const sendMessages = chatIds.map(async (chatId: number) => {
      const data = {
        chat_id: chatId,
        text: messageContent,
        parse_mode: 'MarkdownV2',
      };

      // Gửi yêu cầu POST sử dụng Axios
      const response = await axios.post(TELEGRAM_API_URL, data);

      // Xử lý phản hồi từ API Telegram
      console.log(`response khi gửi tin nhắn đến ${chatId}:`, response);
    });

    // Đợi cho tất cả các tin nhắn được gửi xong
    await Promise.all(sendMessages);
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
};
