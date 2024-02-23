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
import { DataSnapshot, get, onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { IDataQuestionSelect, IHistoryVoted } from 'src/types/votedh.types';
import { numberWithCommas } from 'src/utils/numberWithComma';
import { styles } from '../styles';
import ResultChartLeft from './result-chart-left';
import ResultChartRight from './result-chart-right';

interface result_vote {
  answer: string;
  numberTurn: number;
  rate_vote: number;
  share_vote: number;
  rate_share: number;
}
interface info_holder_vote {
  ma_cd: string;
  ten_cd: string;
  cp_tham_du: number;
  ty_le_cp_tham_du: number;
  answerVoted: string;
  time_voted: string;
}
interface info_holder_no_vote {
  ma_cd: string;
  ten_cd: string;
  cp_tham_du: number;
  ty_le_cp_tham_du: number;
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
    { id: 'answer', label: 'Câu trả lời' },
    { id: 'answer_time', label: 'Thời gian trả lời' },
  ];

  const tableLabelsInfoShareHolderNoVote = [
    { id: 'stt', label: 'STT' },
    { id: 'code', label: 'Mã CD' },
    { id: 'name', label: 'Tên CĐ' },
    { id: 'share', label: 'Cổ phần' },
    { id: 'percent_holding', label: '% Nắm giữ' },
  ];

  // CODE

  // data from firebase state --------------------------------------------------
  const [historySendPollData, setHistorySendPollData] = useState<IHistorySendPoll[]>([]);
  const [danhSachPollData, setDanhSachPollData] = useState<IQuestion[]>([]);
  const [listHistoryVoted, setListHistoryVoted] = useState<IHistoryVoted[]>([]);
  const [infoListSharesHolder, setInfoListSharesHolder] = useState<any[]>([]);

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
    // lọc các object trong thuộc tính detail theo điều kiện
    console.log('obj:',obj)
    let filteredArray = obj.detail?.filter((item) => item.key_question === questionSelect);
    console.log('filteredArray', filteredArray)
    filteredArray = filteredArray.map((item) => ({ ...item, ma_cd: obj.ma_cd }));
    //  push các object trong filteredArray vào result
    listResultByQuestion.push(...filteredArray);
  }
console.log('list history voted:',listHistoryVoted)
console.log('question select:', questionSelect)
  // FUNCTION TO CALCULATE TOTAL CP
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

  // Code lấy ra list cổ đông đã gửi poll theo câu hỏi ==================================
  const filteredArray =
    historySendPollData &&
    historySendPollData.filter(
      (obj) => obj.ds_poll_id?.some((item) => item.key === questionSelect)
    );

  const uniqueGuiDenObjects: any = [];

  filteredArray?.forEach((item: any) => {
    item.gui_den.forEach((obj: any) => {
      const exists = uniqueGuiDenObjects.some((uniqueObj: any) => uniqueObj.ma_cd === obj.ma_cd);
      if (!exists) {
        uniqueGuiDenObjects.push(obj);
      }
    });
  });
  //  tạo một Set để lưu trữ các ma_cd đã xuất hiện
  const seenMaCd: string[] = [];

  //  Tổng số user nhận được câu hỏi
  const totalUserReceivedQuestion =
    (filteredArray &&
      filteredArray
        .flatMap((obj) => obj.gui_den) // Chuyển mảng 2D thành mảng 1D
        .filter((item) => {
          // Nếu ma_cd đã xuất hiện, bỏ qua phần tử này
          if (seenMaCd.includes(item?.ma_cd as string)) {
            return false;
          }
          // Nếu chưa xuất hiện, thêm ma_cd vào mảng và giữ lại phần tử này
          seenMaCd.push(item?.ma_cd as string);
          return true;
        }).length) ||
    0;

  // tổng cổ phần đã bầu
  const totalCPVoted = listResultByQuestion.reduce(
    (accumulator: any, current: any) =>
      accumulator +
      (infoListSharesHolder?.find((item: any) => item.ma_cd === current.ma_cd)?.cp_tham_du || 0),
    0
  );
  // tổng cổ phần đã đã gửi poll
  const totalCPSentPoll = uniqueGuiDenObjects.reduce(
    (accumulator: any, current: any) =>
      accumulator +
      (infoListSharesHolder?.find((item: any) => item.ma_cd === current.ma_cd)?.cp_tham_du || 0),
    0
  );

  // tổng cổ phần cổ đông gửi poll (CP đã bầu  + CP chưa bầu)

  const totalShares = infoListSharesHolder
    .filter((item) => item.trang_thai === 'Tham dự')
    .reduce((sum, item) => sum + item.cp_tham_du, 0);

  // End Code lấy ra list cổ đông đã gửi poll theo câu hỏi ==============================

  // DATA Table kết quả bầu cử

  const dataResultVote =
    (pollDataByKey &&
      pollDataByKey.dap_an?.map((item: any) => ({
        answer: item.vi,
        numberTurn: listResultByQuestion.filter(
          (item2: any) => item2.answer_select_id === String(item.id)
        ).length,
        rate_vote:
          (listResultByQuestion.filter((item3: any) => Number(item3.answer_select_id) === item.id)
            .length /
            uniqueGuiDenObjects.length) *
          100,
        share_vote: calculateTotalCP(item.id as number),
        rate_share: (calculateTotalCP(item.id as number) / totalCPSentPoll) * 100,
      }))) ||
    [];

  // const totalVoted =
  dataResultVote?.push({
    answer: 'Chưa bầu chọn',
    numberTurn: totalUserReceivedQuestion - listResultByQuestion.length,
    rate_vote: Math.round(
      100 - dataResultVote.reduce((sum, item) => sum + Number(item.rate_vote), 0)
    ),
    share_vote: totalCPSentPoll - totalCPVoted,
    rate_share: ((totalCPSentPoll - totalCPVoted) / totalCPSentPoll) * 100,
  });

  // END Data Table kết quả bầu cử

  // Data Table thông tin cổ đông bầu cử

  const dataTableInfoVoted = listResultByQuestion.map((item: any) => {
    const sharesHolder = infoListSharesHolder.find((item2: any) => item.ma_cd === item2.ma_cd);
    const answerVoted = pollDataByKey?.dap_an?.find(
      (item3: any) => item.answer_select_id && String(item3.id) === item.answer_select_id
    )?.vi;

    return {
      ma_cd: item.ma_cd,
      ten_cd: sharesHolder?.ten_cd,
      cp_tham_du: sharesHolder?.cp_tham_du,
      ty_le_cp_tham_du: sharesHolder?.ty_le_cp_tham_du,
      answerVoted,
      time_voted: item.time_voted,
    };
  });

  // END Data Table thông tin cổ đông bầu cử

  // Data Table No Vote

  const dataTableInfoNoVote = uniqueGuiDenObjects
    .filter((data: any) => data.status === 'sent')
    .map((item: any) => {
      const sharesHolder = infoListSharesHolder.find((item2: any) => item.ma_cd === item2.ma_cd);
      return {
        ma_cd: item.ma_cd,
        ten_cd: item.ten_cd,
        cp_tham_du: sharesHolder?.cp_tham_du,
        ty_le_cp_tham_du: sharesHolder?.ty_le_cp_tham_du,
      };
    });

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
                      <TableCell align="left">
                        {
                          infoListSharesHolder.filter((item: any) => item?.trang_thai === 'Tham dự')
                            .length
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Gửi :</TableCell>
                      <TableCell align="left">{uniqueGuiDenObjects?.length}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Bầu Chọn :</TableCell>
                      <TableCell align="left">
                        {uniqueGuiDenObjects.filter((item: any) => item.status === 'voted').length}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chưa Bầu Chọn :</TableCell>
                      <TableCell align="left">
                        {' '}
                        {uniqueGuiDenObjects.filter((item: any) => item.status === 'sent').length}
                      </TableCell>
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
                      <TableCell>CP tham dự:</TableCell>
                      <TableCell align="left">{numberWithCommas(totalShares)} CP</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CP đã bầu :</TableCell>
                      <TableCell align="left">{numberWithCommas(totalCPVoted)} CP</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CP chưa bầu :</TableCell>
                      <TableCell align="left">
                        {numberWithCommas(totalCPSentPoll - totalCPVoted)} CP
                      </TableCell>
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
          totalUserReceivedQuestion={totalUserReceivedQuestion}
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

                <TableBody sx={{ margin: 'auto !important' }}>
                  {dataResultVote.map((item: result_vote, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.answer}</TableCell>
                      <TableCell>{item.numberTurn}</TableCell>
                      <TableCell>{item.rate_vote.toFixed(1)} %</TableCell>
                      <TableCell>{numberWithCommas(item.share_vote)} CP</TableCell>
                      <TableCell>{item.rate_share.toFixed(1)} %</TableCell>
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
                  {dataTableInfoVoted.map((item: info_holder_vote, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.ma_cd}</TableCell>
                      <TableCell>{item.ten_cd}</TableCell>
                      <TableCell>{numberWithCommas(item.cp_tham_du)}</TableCell>
                      <TableCell>{((item?.ty_le_cp_tham_du || 0) * 100).toFixed(2)}%</TableCell>
                      <TableCell>{item.answerVoted}</TableCell>
                      <TableCell>{item.time_voted}</TableCell>
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
        <Typography variant="h6">Thông tin cổ đông chưa bầu cử :</Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table size="small">
                <TableHeadCustom headLabel={tableLabelsInfoShareHolderNoVote} />
                <TableBody>
                  {dataTableInfoNoVote.map((item: info_holder_no_vote, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.ma_cd}</TableCell>
                      <TableCell>{item.ten_cd}</TableCell>
                      <TableCell>{numberWithCommas(item.cp_tham_du)}</TableCell>
                      <TableCell>{((item?.ty_le_cp_tham_du || 0) * 100).toFixed(2)}%</TableCell>
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
