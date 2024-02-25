'use client';

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
import { get, push, ref, remove, runTransaction } from 'firebase/database';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { currentTimeUTC7 } from 'src/utils/currentTimeUTC+7';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import Iconify from '../../../components/iconify';
import { useUser } from '../../../firebase/user_accesss_provider';

export default function QuestionAndAnswer() {
  const { user } = useUser();
  const [questions, setQuestions] = useState<any[]>();
  const [inputQuestion, setInputQuestion] = useState<String>();
  const [sending, setSending] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteSelected, setDeleteSelected] = useState<any>(null);
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
    </Stack>
  );
}
