/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Box, Button, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import axios from 'axios';
import { get, ref, remove } from 'firebase/database';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { useBoolean } from 'src/hooks/use-boolean';

interface IHistorySendMessage {
  chatId: number;
  messageId: number;
}
export default function DeleteMessageTelegram() {
  const theme = useTheme();
  const confirm = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const [historySendMessageList, setHistorySendMessageList] = useState<IHistorySendMessage[]>([]);
  const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;

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
