'use client';

import { Icon } from '@iconify/react';
import LoadingButton from '@mui/lab/LoadingButton';
import { DialogContentText, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DataSnapshot, get, onValue, push, ref, remove, runTransaction } from 'firebase/database';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTelegram } from 'src/telegram/telegram.provider';
import { IHistorySendPoll } from 'src/types/setting';
import { convertToMilliseconds } from 'src/utils/convertTimeStringToMiliSeconds';
import { currentTimeUTC7 } from 'src/utils/currentTimeUTC+7';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import Iconify from '../../../components/iconify';
import { useUser } from '../../../firebase/user_accesss_provider';

export default function QuestionAndAnswer() {
  const { user } = useUser();
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>();
  const [inputQuestion, setInputQuestion] = useState<String>();
  const [sending, setSending] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [historySendPollData, setHistorySendPollData] = useState<IHistorySendPoll[]>([]);
  const [deleteSelected, setDeleteSelected] = useState<any>(null);
  const telegramContext = useTelegram();

  const [userAccess, setUserAccess] = useState<any>();
useEffect(() => {
  if (userAccess) {
    if (!user?.telegram_id) {
      router.push(paths.auth.jwt.login);
    }}
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [userAccess,user])

  useEffect(() => {
    setUserAccess(telegramContext?.user);
  }, [telegramContext]);

  const handleClosePopup = () => {
    setIsNewQuestion(false);
  };



  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.QA);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        const ls_questions: any[] = [];
        console.log('snapshot', snapshot.val());

        if (snapshot.exists()) {
          // Lặp qua từng đối tượng trong collection, nếu trùng telegram_id >> thì lấy nội dung show ra
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const { key } = childSnapshot;
            if (data && String(data.user.telegram_id) === String(user?.telegram_id)) {
              ls_questions.push({ ...data, key });
            }
          });
          setQuestions(ls_questions);
          console.groupEnd();
        } else {
          setQuestions([]);
          console.log('No Data');
        }
      } catch (error) {
        console.error('Error when get data :', error);
      }
    };
    fetchData();
  }, [inputQuestion, user?.telegram_id, deleteSelected]);

  useEffect(() => {
    // hàm dùng để check nếu có câu hỏi mới và còn hạn thì sẽ hiện popup thông báo quay lại câu hỏi
    const filteredData = historySendPollData.filter((item) => {
      // Kiểm tra xem item có thuộc tính gui_den và thoi_gian_ket_thuc hay không
      if (item.gui_den && item.thoi_gian_ket_thuc) {
        // Chuyển đổi item.thoi_gian_ket_thuc thành số mili giây
        const endTime = convertToMilliseconds(item.thoi_gian_ket_thuc);
        // Chuyển đổi currentTimeUTC7 thành số mili giây
        const currentUTC7Date = convertToMilliseconds(currentTimeUTC7());

        // Kiểm tra xem endTime có lớn hơn currentUTC7Date không
        if (endTime > currentUTC7Date) {
          // Lọc qua mảng item.gui_den và trả về những phần tử có ma_cd bằng user?.ma_cd và status bằng 'sent'
          const filteredDen = item.gui_den.filter(
            (den) => den.ma_cd === user?.ma_cd && den.status === 'sent'
          );

          // Nếu có ít nhất một phần tử thỏa mãn điều kiện trong gui_den, trả về mảng đó
          if (filteredDen.length > 0) {
            return true;
          }
        }
      }

      // Nếu không thỏa mãn điều kiện hoặc không có phần tử nào thỏa mãn trong gui_den, trả về false
      return false;
    });
    if (filteredData.length > 0) {
      setIsNewQuestion(true);
    } else {
      setIsNewQuestion(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historySendPollData]);
  useEffect(() => {
    // get data từ firebase realtime
    const userRef = ref(database, FIREBASE_COLLECTION.POLL_PROCESS);
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      if (dataSnapShot) {
        const ls_gui_poll = snapshot.val().ls_gui_poll ?? {};

        const listHistorySendPoll = Object.keys(ls_gui_poll).map((key) => ({
          key,
          ...snapshot.val().ls_gui_poll[key],
        }));
        setHistorySendPollData(listHistorySendPoll);
      }
    };
    const unsubscribe = onValue(userRef, onDataChange);
    return () => {
      // Detach the listener
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onQuestionInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuestion(event.target.value);
  };

  const onClickSendButton: React.MouseEventHandler<HTMLButtonElement> = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    // Update loading -> true
    setSending(true);

    const refQA = ref(database, FIREBASE_COLLECTION.QA);
    const newRefQA = push(refQA);

    await runTransaction(newRefQA, (currentData) =>
      // If currentData exists, merge it with the new data
      ({
        user,
        content: inputQuestion,
        time: currentTimeUTC7(),
      })
    )
      .then(() => {
        enqueueSnackbar(
          user && user.nguoi_nuoc_ngoai ? 'Send question success !' : 'Gửi câu hỏi thành công !',
          { variant: 'success' }
        );
      })
      .catch((error) => {
        enqueueSnackbar(user && user.nguoi_nuoc_ngoai ? 'Send failed !' : 'Gửi thất bại !', {
          variant: 'error',
        });
        console.log('Error send question:', error);
      });
    setSending(false);
    setInputQuestion('');
  };
  const handleDeleteQuestion = (item: any) => {
    setIsDeleteOpen(true);
    setDeleteSelected(item);
  };
  const handleClose = () => {
    setIsDeleteOpen(false);
    setDeleteSelected(null);
  };

  const handleOke = async () => {
    if (deleteSelected) {
      const refDelQuestion = ref(database, `${FIREBASE_COLLECTION.QA}/${deleteSelected.key}`);
      remove(refDelQuestion)
        .then(() => {
          setDeleteSelected(null);
          setIsDeleteOpen(false);
          enqueueSnackbar(user && user.nguoi_nuoc_ngoai ? 'Delete Success !' : 'Xóa Thành Công !', {
            variant: 'success',
          });
        })
        .catch((error) => {
          enqueueSnackbar(user && user.nguoi_nuoc_ngoai ? 'Delete failed !' : 'Xóa thất bại !', {
            variant: 'error',
          });
        });
    }
  };
  return (
    <Stack direction="column" spacing={0.7} sx={{ m: 1 }}>
      <CustomBreadcrumbs
        heading={user && user.nguoi_nuoc_ngoai ? 'Make a question' : 'Mời quý cổ đông đặt câu hỏi'}
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 1, md: 1 },
        }}
      />
      <Typography variant="overline">
        {user && user.nguoi_nuoc_ngoai ? 'Content Question :' : 'Nội dung câu hỏi :'}
      </Typography>
      <TextField
        variant="outlined"
        placeholder={
          user && user.nguoi_nuoc_ngoai
            ? 'Enter the content you want to ask'
            : 'Nhập nội dung điều bạn thắc mắc'
        }
        multiline
        rows={4}
        maxRows={20}
        onChange={onQuestionInput}
        value={inputQuestion}
      />
      <Box display="flex" justifyContent="flex-end">
        <LoadingButton
          color="success"
          startIcon={<Iconify icon="material-symbols:send" width={20} />}
          loading={sending}
          variant="contained"
          sx={{ width: '25%' }}
          onClick={onClickSendButton}
          disabled={!inputQuestion}
        >
          {user && user.nguoi_nuoc_ngoai ? 'Send' : 'Gửi'}
        </LoadingButton>
      </Box>
      <Typography variant="overline">
        {user && user.nguoi_nuoc_ngoai ? 'Your question :' : 'Câu hỏi của bạn :'}
      </Typography>
      <List>
        {questions?.map((item, index) => (
          <ListItem
            key={item.key}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(item)}>
                <Iconify icon="ic:baseline-delete" width={25} color="#ff5630" />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${user && user.nguoi_nuoc_ngoai ? 'Question' : 'Câu hỏi'} ${index + 1}:`}
              secondary={item.content}
            />
          </ListItem>
        ))}
      </List>
      <Dialog
        open={isDeleteOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {user && user.nguoi_nuoc_ngoai ? 'Confirm' : 'Xác nhận'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {user && user.nguoi_nuoc_ngoai
              ? 'Are you sure you want to delete the question ?'
              : 'Bạn chắc chắn muốn xóa câu hỏi ?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            {user && user.nguoi_nuoc_ngoai ? 'Cancel' : 'Hủy'}
          </Button>
          <Button variant="contained" color="success" onClick={handleOke} autoFocus>
            {user && user.nguoi_nuoc_ngoai ? 'Oke' : 'Đồng ý'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isNewQuestion}
        onClose={handleClosePopup}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            textAlign: 'center',
            padding: '12px !important',
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
          }}
        >
          <Typography sx={{ width: '90%', fontWeight: 600, fontSize: '18px' }}>
            {user?.nguoi_nuoc_ngoai === true ? "It's time to vote" : ' Đã đến thời gian bỏ phiếu !'}
          </Typography>
          <Icon
            style={{ width: '10%', textAlign: 'center', fontSize: '30px', cursor: 'pointer' }}
            icon="ic:outline-close"
            onClick={() => handleClosePopup()}
          />
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ textAlign: 'center' }}>
            {user?.nguoi_nuoc_ngoai === true
              ? 'Please click the following button to vote.'
              : 'Vui lòng nhấn vào nút sau để thực hiện bỏ phiếu.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button fullWidth variant="contained" onClick={() => router.push(paths.dashboard.voteDH)}>
            {user?.nguoi_nuoc_ngoai === true ? 'Vote' : 'Bỏ Phiếu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
