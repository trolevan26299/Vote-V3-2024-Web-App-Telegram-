/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Box, Button, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import axios from 'axios';
import { get, push, ref, remove, set } from 'firebase/database';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { useBoolean } from 'src/hooks/use-boolean';
import { IUserAccess } from 'src/types/userAccess.types';

interface IHistorySendMessage {
  chatId: number;
  messageId: number;
}
export default function DeleteMessageTelegram() {
  const theme = useTheme();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [historySendMessageList, setHistorySendMessageList] = useState<IHistorySendMessage[]>([]);
  const [listSharesHolders, setListSharesHolders] = useState<IUserAccess[]>([]);
  const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;

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

  const sendMakeQuestion = async () => {
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const messageContent = `
  *ĐẶT CÂU HỎI*
Click vào nút bên dưới để tiến hành đặt câu hỏi
`;
    const messageContentEng = `
  *MAKE QUESTION*
  Click the button below to ask a question
`;

    try {
      const sendMessagesQueue = listSharesHolders.map(async (item) => {
        const button = {
          text: item.nguoi_nuoc_ngoai === true ? 'Click To make question' : 'Click để đặt câu hỏi',
          web_app: { url: 'https://vote-v3.vercel.app/dashboard/question-and-answer' },
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
        await saveHistorySendMessageBot(message_id, Number(chatId) );
      }
    }
    } catch (error) {
      console.error('Error sending messages to Telegram:', error);
    }
  };


  const handleDeleteMessageAll = async () => {
    try {
      // Lặp qua mỗi tin nhắn trong historySendMessageList và gửi yêu cầu xóa đến Telegram API
      const deleteMessagePromises = historySendMessageList.map(async (message) => {
        const { chatId, messageId } = message;
        await axios.post(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
          chat_id: chatId,
          message_id: messageId,
        });
        console.log(`Deleted message with ID ${messageId} for chat ID ${chatId}`);
      });

      // Chờ cho tất cả các promise hoàn thành
      await Promise.all(deleteMessagePromises);

      // Xóa tất cả các tin nhắn từ Firebase trong khối finally
    } catch (error) {
      console.error('Error deleting messages:', error);
    } finally {
      try {
        const messagesRef = ref(database, FIREBASE_COLLECTION.HISTORY_SEND_MESSAGE_BOT);
        await remove(messagesRef);
        enqueueSnackbar('Xóa Thành Công !', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Xóa lỗi !', { variant: 'error' });
        console.error('Error saving data:', error);
      } finally {
        confirm.onFalse();
      }
    }
  };

  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.HISTORY_SEND_MESSAGE_BOT);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert the object into an array
          const historySendMessageArray = Object.values(data);

          setHistorySendMessageList(historySendMessageArray as IHistorySendMessage[]);
        } else {
          console.log('No Data');
        }
      } catch (error) {
        console.error('Error when get data :', error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.THONG_TIN_CD);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convert the object into an array
          const sharesHoldersArray = Object.values(data);

          setListSharesHolders(
            sharesHoldersArray.filter((item: any) => item.trang_thai === 'Tham dự') as IUserAccess[]
          );
        } else {
          console.log('No Data');
        }
      } catch (error) {
        console.error('Error when get data :', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box>
      <Box
        sx={{
          width: '50%',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
        }}
      >
        <Typography variant="h4" textAlign="center" sx={{ paddingTop: '3%', paddingBottom: '1%' }}>
          Gửi tin nhắn thêm câu hỏi đến cổ đông
        </Typography>
        <Typography variant="caption" color="InfoText" textAlign="center">
          * Chức năng này sẽ gửi tin nhắn chứa form câu hỏi thêm đến cho tất cả cổ đông
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: '50%', margin: 'auto', marginY: '5%' }}
          onClick={sendMakeQuestion}
        >
          Gửi
        </Button>
      </Box>
      <Box
        sx={{
          marginTop: '20px!important',
          width: '50%',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
        }}
      >
        <Typography variant="h4" textAlign="center" sx={{ paddingTop: '3%', paddingBottom: '1%' }}>
          Xóa Tin nhắn
        </Typography>
        <Typography variant="caption" color="error" textAlign="center">
          * Chức năng này sẽ xóa toàn bộ tin nhắn giữa bot và người dùng
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ width: '50%', margin: 'auto', marginY: '5%' }}
          onClick={confirm.onTrue}
        >
          Xóa
        </Button>
      </Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xóa Toàn Bộ Tin Nhắn"
        content="Bạn có chắc chắn muốn xóa tất cả tin nhắn không ? "
        action={
          <Button variant="contained" color="warning" onClick={handleDeleteMessageAll}>
            Xóa
          </Button>
        }
      />
    </Box>
  );
}
