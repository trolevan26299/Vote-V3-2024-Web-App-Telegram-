import {
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
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataSnapshot, get, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { IDataQuestionSelect, IHistoryVoted } from 'src/types/votedh.types';
import { styles } from '../styles';
import ResultChartLeft from './result-chart-left';
import ResultChartRight from './result-chart-right';

interface result_vote {
  id: string;
  answer: string;
  number_vote: string;
  rate_vote: string;
  share_vote: string;
  rate_share: string;
}
interface info_holder_vote {
  code: string;
  name: string;
  share: string;
  percent_holding: string;
  poll_answer: string;
  answer: string;
  answer_time: string;
}

export default function ResultView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const tableLabelsResultVote = [
    { id: 'id', label: 'ID' },
    { id: 'answer', label: 'Câu trả lời' },
    { id: 'number_vote', label: 'Phiếu bầu' },
    { id: 'rate_vote', label: 'Tỷ lệ phiếu bầu %' },
    { id: 'share_vote', label: 'Cổ phần bầu' },
    { id: 'rate_share', label: 'Tỷ lệ CP %' },
  ];
  const tableLabelsInfoShareHolderVote = [
    { id: 'stt', label: 'STT' },
    { id: 'code', label: 'Mã CD' },
    { id: 'name', label: 'Tên CĐ' },
    { id: 'share', label: 'Cổ phần' },
    { id: 'percent_holding', label: '% Nắm giữ' },
    { id: 'poll_answer', label: 'Poll Trả lời' },
    { id: 'answer', label: 'Câu trả lời' },
    { id: 'answer_time', label: 'Thời gian trả lời' },
  ];

  const result_vote: result_vote[] = [
    {
      id: '1',
      answer: 'Tán thành',
      number_vote: '2',
      rate_vote: '66,67%',
      share_vote: '30.000',
      rate_share: '100%',
    },
    {
      id: '2',
      answer: 'Không tán thành',
      number_vote: '1',
      rate_vote: '46,67%',
      share_vote: '20.000',
      rate_share: '60%',
    },
    {
      id: '3',
      answer: 'Chưa bầu chọn',
      number_vote: '5',
      rate_vote: '86,67%',
      share_vote: '50.000',
      rate_share: '80%',
    },
  ];
  const info_holder_vote: info_holder_vote[] = [
    {
      code: 'M3232131AAXZ',
      name: 'Lincoln',
      share: '66,67%',
      percent_holding: '30.000',
      poll_answer: '1',
      answer: '23213',
      answer_time: '12:30:00 17/112/2023',
    },
    {
      code: 'M3232131AAXZ',
      name: 'Lincoln',
      share: '66,67%',
      percent_holding: '30.000',
      poll_answer: '1',
      answer: '23213',
      answer_time: '12:30:00 17/112/2023',
    },
    {
      code: 'M3232131AAXZ',
      name: 'Lincoln',
      share: '66,67%',
      percent_holding: '30.000',
      poll_answer: '1',
      answer: '23213',
      answer_time: '12:30:00 17/112/2023',
    },
  ];

  // CODE
  // handle select answer
  const [answer, setAnswer] = React.useState('');

  const handleChangeSelectAnswer = (event: SelectChangeEvent) => {
    setAnswer(event.target.value);
  };

  // data from firebase state --------------------------------------------------
  const [historySendPollData, setHistorySendPollData] = useState<IHistorySendPoll[]>([]);
  const [danhSachPollData, setDanhSachPollData] = useState<IQuestion[]>([]);
  const [listHistoryVoted, setListHistoryVoted] = useState<IHistoryVoted[]>([]);
  const [infoListSharesHolder, setInfoListSharesHolder] = useState<any>([]);

  // CODE FOR SELECT QUESTION FROM FIREBASE
  const existingKeys = new Set<string>();

  // Lọc và merge dữ liệu từ ds_poll_id
  const questionSelectData: any = historySendPollData.reduce((result, historyItem) => {
    // Duyệt qua mỗi phần tử trong ds_poll_id của historyItem
    historyItem?.ds_poll_id?.forEach((poll) => {
      // Kiểm tra xem đã có key này trong Set chưa
      if (!existingKeys.has(poll.key as string)) {
        // Nếu chưa có, thêm vào mảng kết quả và đánh dấu là đã xuất hiện
        existingKeys.add(poll.key as string);
        result.push(poll);
      }
    });
    return result;
  }, [] as IHistorySendPoll[]);
  const [questionSelect, SetQuestionSelect] = useState<string>(questionSelectData[0]?.key || '');
  // Function handle data
  const handleChangeSelectQuestion = (event: SelectChangeEvent) => {
    SetQuestionSelect(event.target.value);
  };
  const pollDataByKey = danhSachPollData.find((poll) => poll.key === questionSelect);

  // List result by question
  const listResultByQuestion: any = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const obj of listHistoryVoted) {
    // Bạn lọc các object trong thuộc tính detail theo điều kiện của bạn
    let filteredArray = obj.detail.filter((item) => item.key_question === questionSelect);
    filteredArray = filteredArray.map((item) => ({ ...item, ma_cd: obj.ma_cd }));
    // Bạn push các object trong filteredArray vào result
    listResultByQuestion.push(...filteredArray);
  }

  // FUNCTION TO CALCULATE TOTLA CP
  const calculateTotalCP = (itemPoll: number) => {
    const listInfoForAnswer = listResultByQuestion?.filter(
      (item: any) => item.answer_select_id === String(itemPoll)
    );
    const totalNumberCP = listInfoForAnswer?.reduce(
      (accumulator: any, current: any) =>
        accumulator +
        (infoListSharesHolder?.find((item2: any) => item2.ma_cd === current.ma_cd)?.cp_tham_du ||
          0),
      0
    );
    return totalNumberCP || 0;
  };

  // GET DATA TỪ FIREBASE ---------------------------------------------------------------
  useEffect(() => {
    // get data từ firebase realtime
    const userRef = ref(database, FIREBASE_COLLECTION.POLL_PROCESS);
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      if (dataSnapShot) {
        const ls_gui_poll = snapshot.val().ls_gui_poll ?? {};
        const danh_sach_poll = snapshot.val().danh_sach_poll ?? {};
        const ls_poll = snapshot.val().ls_poll ?? {};
        const listHistorySendPoll = Object.keys(ls_gui_poll).map((key) => ({
          key,
          ...snapshot.val().ls_gui_poll[key],
        }));
        const listPoll = Object.keys(danh_sach_poll).map((key) => ({
          key,
          ...snapshot.val().danh_sach_poll[key],
        }));
        const lsVoted = Object.keys(ls_poll).map((key) => ({
          key,
          ...snapshot.val().ls_poll[key],
        }));

        setHistorySendPollData(listHistorySendPoll);
        setDanhSachPollData(listPoll);
        setListHistoryVoted(lsVoted);
      }
    };
    const unsubscribe = onValue(userRef, onDataChange);
    return () => {
      // Detach the listener
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Get Data danh sách cổ đông từ firebase không realtime
    const userRef = ref(database, FIREBASE_COLLECTION.THONG_TIN_CD);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const dataObject = snapshot.val();
          const dataArray = Object.values(dataObject);
          setInfoListSharesHolder(dataArray);
        } else {
          console.log('No Data');
        }
      } catch (error) {
        console.error('Error when get data:', error);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // END CODE
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
          ...styles.box_answer_result,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ width: '60%' }}>
            <Box className="name-content" sx={{ ...styles.box_name_content }}>
              <Typography sx={{ width: '15%' }}>Chọn câu hỏi :</Typography>
              <FormControl sx={{ width: '85% !important' }} size="small">
                <InputLabel id="demo-simple-select-label" sx={{ width: '100%' }} size="small">
                  Chọn câu hỏi
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={questionSelect}
                  label="Chọn Câu Hỏi"
                  onChange={handleChangeSelectQuestion}
                  sx={{ width: '50% !important' }}
                >
                  {questionSelectData.map((item: IDataQuestionSelect) => (
                    <MenuItem value={item.key}>{item.ten_poll}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box className="name-content" sx={{ ...styles.box_question, mt: '10px' }}>
              <Typography sx={{ width: '15%' }}>Nội dung :</Typography>
              <Typography sx={{ width: '85%' }}>
                {danhSachPollData.find((item) => item.key === questionSelect)?.noi_dung}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{ backgroundColor: alpha(theme.palette.primary.dark, 0.8) }}
          >
            Trình chiếu
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '5px',
          gap: '10%',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <Box sx={{ width: '30%', textAlign: 'center' }}>
          <Card>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Scrollbar>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>SL Tham Gia :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Gửi :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chưa Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
        </Box>
        <Box sx={{ width: '30%', textAlign: 'center' }}>
          <Card>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Scrollbar>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>SL Tham Gia :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Gửi :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chưa Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '5px',
          gap: '10%',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <ResultChartLeft calculateTotalCP={calculateTotalCP} pollDataByKey={pollDataByKey} />
        <ResultChartRight
          pollDataByKey={pollDataByKey}
          listResultByQuestion={listResultByQuestion}
          historySendPollData={historySendPollData}
          questionSelect={questionSelect}
        />
      </Box>
      <Box
        sx={{
          marginTop: '5px',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <Typography variant="h6">Kết quả bầu cử :</Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table size="small">
                <TableHeadCustom headLabel={tableLabelsResultVote} />
                <TableBody>
                  {result_vote.map((item: result_vote) => (
                    <TableRow>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.answer}</TableCell>
                      <TableCell>{item.number_vote}</TableCell>
                      <TableCell>{item.rate_vote}</TableCell>
                      <TableCell>{item.share_vote}</TableCell>
                      <TableCell>{item.rate_share}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Box>
      <Box
        sx={{
          marginTop: '5px',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <Typography variant="h6">Thông tin cổ đông bầu cử :</Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table size="small">
                <TableHeadCustom headLabel={tableLabelsInfoShareHolderVote} />
                <TableBody>
                  {info_holder_vote.map((item: info_holder_vote, index) => (
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.share}</TableCell>
                      <TableCell>{item.percent_holding}</TableCell>
                      <TableCell>{item.poll_answer}</TableCell>
                      <TableCell>{item.answer}</TableCell>
                      <TableCell>{item.answer_time}</TableCell>
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
