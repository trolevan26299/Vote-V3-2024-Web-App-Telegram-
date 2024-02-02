import {
  Autocomplete,
  Box,
  Button,
  Card,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataSnapshot, get, onValue, push, ref, set, update } from 'firebase/database';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { sendTelegramMessage } from 'src/api/sendTelegramMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { IUserAccess } from 'src/types/userAccess.types';
import { ExpireTimeFunc } from 'src/utils/calculatorTimeExpire';
import { currentTimeUTC7 } from 'src/utils/currentTimeUTC+7';
import { styles } from '../styles';

export default function SendVoteView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const tableLabels = [
    { id: 'name_question', label: 'Tên nội dung' },
    { id: 'receiver', label: 'Gửi đến' },
    { id: 'send_time', label: 'Thời gian gửi' },
    { id: 'time_limit', label: 'Thời gian giới hạn' },
  ];

  // handle select answer
  const [inputValueTextAnswer, setInputValueTextAnswer] = useState('');
  const [answerSelect, setAnswerSelect] = React.useState<IQuestion[]>([]);

  // handle select shareholder
  const allOption: IUserAccess = {
    ten_cd: 'Tất cả',
  };
  const [inputValueTextShareHolder, setInputValueTextShareHolder] = useState('');
  const [shareHolderSelect, setShareHolderSelect] = React.useState<IUserAccess[]>([]);

  // handle select time expired
  const [expireTime, setExpireTime] = React.useState<string>('');
  console.log('expireTime', expireTime);
  console.log('Thời gian hết hạn :', ExpireTimeFunc(currentTimeUTC7, expireTime));

  // list history send poll from firebase
  const [historySendPoll, setHistorySendPoll] = useState<IHistorySendPoll[]>([]);

  // list question from firebase
  const [listQuestion, setListQuestion] = useState<IQuestion[]>([]);

  // listSharesHolders from firebase
  const [listSharesHolders, setListSharesHolders] = useState<IUserAccess[]>([]);

  const handleChangeSelectShareHolder = (event: React.SyntheticEvent, values: any) => {
    if (values.some((value: IUserAccess) => value.ten_cd === 'Tất cả')) {
      // If "All" is selected, set all options except "All"
      setShareHolderSelect(listSharesHolders.filter((option) => option.ten_cd !== 'Tất cả'));
    } else {
      setShareHolderSelect(values);
    }
  };
  // handle select time

  const handleChangeSelectExpireTime = (event: SelectChangeEvent) => {
    setExpireTime(event.target.value);
  };

  // Onchange for answer select
  const handleActionSelectAnswer = (event: React.SyntheticEvent, values: any) => {
    setAnswerSelect(values);
  };

  const setInitFormWhenSubmit = () => {
    setAnswerSelect([]);
    setShareHolderSelect([]);
    setExpireTime('');
  };

  // hàm trình chiếu muốn show tiến trình bầu cử của câu hỏi
  const handleShowResultQuestionForAdmin = () => {
    const keyShowFirebaseRef = ref(database, 'question_result_show_admin');
    const updateData = {
      key: answerSelect[0].key,
    };
    update(keyShowFirebaseRef, updateData)
      .then(() => {
        console.log('Trình chiếu câu hỏi thành công !');
      })
      .catch((error) => {
        console.log('Trình chiếu câu hỏi thất bại ,lỗi:', error);
      });
  };
  // ================================== HANDLER SUBMIT FORM =======================================
  const handlerSubmitForm = async (type?: string) => {
    const historySendVoteRef = ref(database, 'poll_process/ls_gui_poll');
    const newRef = push(historySendVoteRef);
    await set(newRef, {
      ds_poll_id: answerSelect.map((item) => ({ key: item.key, ten_poll: item.ten_poll })),
      gui_den: shareHolderSelect.map((item) => ({
        ma_cd: item.ma_cd,
        ten_cd: item.ten_cd,
        status: 'sent',
      })),
      is_active: true,
      thoi_gian_gui: currentTimeUTC7,
      thoi_gian_ket_thuc: ExpireTimeFunc(currentTimeUTC7, expireTime),
    })
      .then(() => {
        enqueueSnackbar('Gửi Thành Công !', { variant: 'success' });
        sendTelegramMessage(
          shareHolderSelect.map((item) => ({
            telegram_id: item.telegram_id as number,
            nguoi_nuoc_ngoai: item.nguoi_nuoc_ngoai as boolean,
          })),
          answerSelect.map((item) => item.ten_poll as string),
          answerSelect.map((item) => item.ten_poll_en as string),

          ExpireTimeFunc(currentTimeUTC7, expireTime)
        );
        if (type) {
          handleShowResultQuestionForAdmin();
        }
        setInitFormWhenSubmit();
      })
      .catch((error) => {
        enqueueSnackbar('Lưu thông tin lỗi !', { variant: 'error' });
        console.error('Error saving data:', error);
      });
  };

  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.POLL_PROCESS);
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      if (dataSnapShot) {
        const danh_sach_poll = snapshot.val().danh_sach_poll ?? {};
        const ls_gui_poll = snapshot.val().ls_gui_poll ?? {};
        const listQuestionWithKeys = Object.keys(danh_sach_poll).map((key) => ({
          key,
          ...danh_sach_poll[key],
        }));
        const listHistorySendPoll = Object.keys(ls_gui_poll).map((key) => ({
          key,
          ...snapshot.val().ls_gui_poll[key],
        }));
        setListQuestion(listQuestionWithKeys);
        setHistorySendPoll(listHistorySendPoll);
      } else {
        console.log('No data available');
      }
    };
    const unsubscribe = onValue(userRef, onDataChange);

    // Clean up the listener when the component unmounts
    return () => {
      // Detach the listener
      unsubscribe();
    };
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
    <Container sx={{ maxWidth: '100% !important' }}>
      <CustomBreadcrumbs
        heading="Gửi nội dung bỏ phiếu cho Cổ Đông"
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 1, md: 1 },
        }}
      />
      <Box
        sx={{
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          ...styles.box_form_setting_vote_setting,
        }}
      >
        <Box className="name-content" sx={{ ...styles.box_name_content }}>
          <Typography sx={{ width: '15%' }}>Chọn câu hỏi:</Typography>
          <Autocomplete
            multiple
            limitTags={4}
            value={answerSelect}
            onChange={handleActionSelectAnswer}
            inputValue={inputValueTextAnswer}
            onInputChange={(event, newInputValue) => {
              setInputValueTextAnswer(newInputValue);
            }}
            id="controllable-states-demo"
            options={listQuestion}
            getOptionLabel={(option) => option.ten_poll as string}
            renderInput={(params) => (
              <TextField {...params} placeholder="Câu hỏi" label="Chọn câu hỏi" size="small" />
            )}
            sx={{ width: '50%' }}
            size="small"
          />
        </Box>

        <Box className="name-content" sx={{ ...styles.box_name_content }}>
          <Typography sx={{ width: '15%' }}>Nội dung câu hỏi:</Typography>
          {answerSelect.length > 0 && (
            <Box
              sx={{
                width: '50%',
                border: '1px solid #dbeae4',
                borderRadius: '8px',
                padding: '8.5px 14px',
              }}
            >
              {answerSelect.map((item) => (
                <Typography sx={{ width: '100%' }}>
                  - {item.ten_poll} : {item.noi_dung}
                </Typography>
              ))}
            </Box>
          )}
        </Box>

        <Box className="name-content" sx={styles.box_name_content}>
          <Typography sx={{ width: '15%' }}>Chọn Cổ Đông gửi :</Typography>
          <Autocomplete
            multiple
            limitTags={4}
            value={shareHolderSelect}
            onChange={handleChangeSelectShareHolder}
            inputValue={inputValueTextShareHolder}
            onInputChange={(event, newInputValue) => {
              setInputValueTextShareHolder(newInputValue);
            }}
            id="controllable-states-demo"
            options={[allOption, ...listSharesHolders]}
            getOptionLabel={(option) => option.ten_cd as string}
            renderInput={(params) => (
              <TextField {...params} placeholder="Cổ đông" label="Chọn cổ đông" size="small" />
            )}
            sx={{ width: '50%' }}
            size="small"
          />
        </Box>
        <Box className="name-content" sx={{ ...styles.box_name_content, mt: '30px' }}>
          <Typography sx={{ width: '15%' }}>Thời gian giới hạn :</Typography>
          <FormControl sx={{ width: '50%' }} size="small">
            <InputLabel id="demo-select-small-label">Thời gian giới hạn</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={expireTime}
              label="Câu hỏi"
              onChange={handleChangeSelectExpireTime}
            >
              <MenuItem value="">
                <em>Vui lòng chọn thời gian</em>
              </MenuItem>
              <MenuItem value={1}>1 Giờ</MenuItem>
              <MenuItem value={2}>2 Giờ </MenuItem>
              <MenuItem value={3}>3 Giờ</MenuItem>
              <MenuItem value={4}>4 Giờ</MenuItem>
              <MenuItem value={5}>5 Giờ</MenuItem>
              <MenuItem value={6}>6 Giờ</MenuItem>
              <MenuItem value={12}>12 Giờ</MenuItem>
              <MenuItem value={24}>24 Giờ</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="name-content" sx={{ ...styles.box_name_content, marginTop: '50px' }}>
          <Box sx={{ width: '15%' }} />
          <Button
            variant="contained"
            color="info"
            disabled={answerSelect.length < 0 || shareHolderSelect.length < 0 || expireTime === ''}
            sx={{ width: '24.5%' }}
            onClick={() => handlerSubmitForm()}
          >
            Gửi
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={answerSelect.length < 0 || shareHolderSelect.length < 0 || expireTime === ''}
            sx={{ width: '24.5%' }}
            onClick={() => handlerSubmitForm('sentAndShow')}
          >
            Gửi & Trình Chiếu
          </Button>
        </Box>
      </Box>
      <Box className="list_question" sx={{ marginTop: '20px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Lịch sử gửi
        </Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 640 }}>
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {historySendPoll.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>
                        {row?.ds_poll_id?.map((item) => item.ten_poll).join(' | ')}
                      </TableCell>

                      <TableCell align="left">
                        {row?.gui_den?.length === listSharesHolders.length
                          ? 'Tất cả '
                          : row?.gui_den?.map((item) => item.ten_cd).join(' | ')}
                      </TableCell>

                      <TableCell align="left">{row.thoi_gian_gui}</TableCell>
                      <TableCell align="left">{row.thoi_gian_ket_thuc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Box>
    </Container>
  );
}
