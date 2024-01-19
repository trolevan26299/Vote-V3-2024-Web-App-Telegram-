import {
  Box,
  Button,
  Card,
  Chip,
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
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataSnapshot, get, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { sendTelegramMessage } from 'src/api/sendTelegramMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { styles } from '../styles';
import { IUserAccess } from 'src/types/userAccess.types';

export default function SendVoteView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const tableLabels = [
    { id: 'name_question', label: 'Tên nội dung' },
    { id: 'receiver', label: 'Gửi đến' },
    { id: 'send_time', label: 'Thời gian gửi' },
    { id: 'time_limit', label: 'Thời gian giới hạn' },
    { id: 'status', label: 'Trạng thái' },
  ];

  // handle select answer
  const [answer, setAnswer] = React.useState('');

  const [historySendPoll, setHistorySendPoll] = useState<IHistorySendPoll[]>([]);
  const [listQuestion, setListQuestion] = useState<IQuestion[]>([]);
  const [listSharesHolders, setListSharesHolders] = useState<IUserAccess[]>([]);

  console.log('historySendPoll:', historySendPoll);
  console.log('listQuestion:', listQuestion);
  console.log('listSharesHolders', listSharesHolders);
  const handleChangeSelectAnswer = (event: SelectChangeEvent) => {
    setAnswer(event.target.value);
  };
  // handle select shareholder
  const [shareholder, setShareHolder] = React.useState('');

  const handleChangeSelectShareHolder = (event: SelectChangeEvent) => {
    setShareHolder(event.target.value);
  };
  // handle select time
  const [time, setTime] = React.useState('');

  const handleChangeSelectTime = (event: SelectChangeEvent) => {
    setTime(event.target.value);
  };

  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.POLL_PROCESS);
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      if (dataSnapShot) {
        const listQuestionWithKeys = Object.keys(snapshot.val().danh_sach_poll).map((key) => ({
          key,
          ...snapshot.val().danh_sach_poll[key],
        }));
        const listHistorySendPoll = Object.keys(snapshot.val().ls_gui_poll).map((key) => ({
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
          setListSharesHolders(snapshot.val());
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
          <Typography sx={{ width: '15%' }}>Chọn câu hỏi :</Typography>
          <FormControl sx={{ width: '50%' }} size="small">
            <InputLabel id="demo-select-small-label">Câu hỏi</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={answer}
              label="Câu hỏi"
              onChange={handleChangeSelectAnswer}
            >
              <MenuItem value="">
                <em>Vui lòng chọn câu hỏi</em>
              </MenuItem>
              {listQuestion.map((item) => (
                <MenuItem value={item.key} key={item.key}>
                  {item.ten_poll}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box className="name-content" sx={{ ...styles.box_question, mb: '35px', mt: '10px' }}>
          <Typography sx={{ width: '15%' }}>Nội dung :</Typography>
          <Typography sx={{ width: '50%' }}>
            {listQuestion.find((item) => item.key === answer)?.noi_dung}
          </Typography>
        </Box>
        <Box className="name-content" sx={styles.box_name_content}>
          <Typography sx={{ width: '15%' }}>Chọn Cổ Đông gửi :</Typography>
          <FormControl sx={{ width: '50%' }} size="small">
            <InputLabel id="demo-select-small-label">Chọn Cổ Đông</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={shareholder}
              label="Chọn Cổ Đông"
              onChange={handleChangeSelectShareHolder}
            >
              <MenuItem value="">
                <em>Vui lòng chọn cổ đông</em>
              </MenuItem>
              <MenuItem value={10}>Tất cả</MenuItem>
              <MenuItem value={20}>Ông A </MenuItem>
              <MenuItem value={30}>Ông B</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className="name-content" sx={{ ...styles.box_name_content, mt: '30px' }}>
          <Typography sx={{ width: '15%' }}>Thời gian giới hạn :</Typography>
          <FormControl sx={{ width: '50%' }} size="small">
            <InputLabel id="demo-select-small-label">Thời gian giới hạn</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={time}
              label="Câu hỏi"
              onChange={handleChangeSelectTime}
            >
              <MenuItem value="">
                <em>Vui lòng chọn thời gian</em>
              </MenuItem>
              <MenuItem value={10}>1 Giờ</MenuItem>
              <MenuItem value={20}>2 Giờ </MenuItem>
              <MenuItem value={30}>3 Giờ</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="name-content" sx={{ ...styles.box_name_content, marginTop: '50px' }}>
          <Box sx={{ width: '15%' }} />
          <Button
            variant="contained"
            sx={{ width: '50%' }}
            onClick={() => sendTelegramMessage([2108274089, 6359530967])}
          >
            Gửi
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
                        {listQuestion.find((item) => item.key === row.ds_poll_id)?.ten_poll}
                      </TableCell>

                      <TableCell align="left">{row.gui_den}</TableCell>

                      <TableCell align="left">{row.thoi_gian_gui}</TableCell>
                      <TableCell align="left">{row.thoi_gian_ket_Thuc}</TableCell>
                      <TableCell align="left">
                        {row.trang_thai === 'Success' ? (
                          <Chip label={row.trang_thai} color="primary" sx={{ width: '100px' }} />
                        ) : (
                          <Chip label={row.trang_thai} color="error" sx={{ width: '100px' }} />
                        )}
                      </TableCell>
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
