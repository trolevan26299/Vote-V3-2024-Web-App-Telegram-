'use client';

import {
  Alert,
  Box,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataSnapshot, get, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IHistorySendPoll, IListSender, IQuestion } from 'src/types/setting';
import { IDataQuestionSelect, IHistoryVoted } from 'src/types/votedh.types';
import { bgGradient } from '../../../theme/css';
import DHContentLeft from '../dh-content-left';
import DHContentRight from '../dh-content-right';
import DHContentTable from '../dh-content-table';

export default function ProcessDHView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  // data from firebase state
  const [historySendPollData, setHistorySendPollData] = useState<IHistorySendPoll[]>([]);
  const [danhSachPollData, setDanhSachPollData] = useState<IQuestion[]>([]);
  const [listHistoryVoted, setListHistoryVoted] = useState<IHistoryVoted[]>([]);
  const [totalSharesHolder, setTotalSharesHolder] = useState<any>([]);

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

  // CODE FOR SELECT QUESTION
  // Handle select question
  const [questionSelect, SetQuestionSelect] = useState<string>(questionSelectData[0]?.key || '');
  const handleChangeSelectQuestion = (event: SelectChangeEvent) => {
    SetQuestionSelect(event.target.value);
  };

  const pollDataByKey = danhSachPollData.find((poll) => poll.key === questionSelect);

  // Tiến trình gửi : hàm check xem câu hỏi được select đã gửi đến bao nhiêu người rồi ,và thấy thông tin những người được gửi không trùng nhau
  const numberProcessSendPoll = () => {
    const newArray: IListSender[] = [];

    historySendPollData.forEach((item) => {
      // Lọc qua từng phần tử và chấm đến thuộc tính ds_poll_id
      const dsPollIdArray = item.ds_poll_id || [];

      dsPollIdArray.forEach((dsPollItem) => {
        // Kiểm tra nếu có object nào có key === questionSelect
        if (dsPollItem.key === questionSelect) {
          // Chấm đến thuộc tính gui_den và lọc để kiểm tra sự tồn tại
          const guiDenArray = item.gui_den || [];
          let isExisting = false;

          guiDenArray.forEach((guiDenItem) => {
            if (newArray.some((i) => i.ma_cd === guiDenItem.ma_cd)) {
              isExisting = true;
            }
          });

          // Nếu không tồn tại thì thêm vào mảng mới
          if (!isExisting) {
            newArray.push(...guiDenArray);
          }
        }
      });
    });

    return newArray;
  };
  const numberSendPoll = numberProcessSendPoll();
  const percentSendPollData = ((numberSendPoll.length || 0) / totalSharesHolder.length) * 100;

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

  const calculateTotalCP = (itemPoll: number) => {
    const listInfoForAnswer = listResultByQuestion?.filter(
      (item: any) => item.answer_select_id === String(itemPoll)
    );
    const totalNumberCP = listInfoForAnswer?.reduce(
      (accumulator: any, current: any) =>
        accumulator +
        (totalSharesHolder?.find((item2: any) => item2.ma_cd === current.ma_cd)?.cp_tham_du || 0),
      0
    );
    return totalNumberCP || 0;
  };

  const totalAllCP = listResultByQuestion.reduce(
    (accumulator: any, current: any) =>
      accumulator +
      (totalSharesHolder?.find((item: any) => item.ma_cd === current.ma_cd)?.cp_tham_du || 0),
    0
  );
  const dataTable =
    (pollDataByKey &&
      pollDataByKey?.dap_an?.map((item) => ({
        answer: item?.vi || '',
        turn: listResultByQuestion.filter(
          (item2: any) => item2.answer_select_id === String(item.id)
        ).length,
        numberCP: calculateTotalCP(item.id as number),
        percent: ((calculateTotalCP(item.id as number) / totalAllCP) * 100).toFixed(1),
      }))) ||
    [];

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
    // Get Data danh sách cổ đông không realtime
    const userRef = ref(database, FIREBASE_COLLECTION.THONG_TIN_CD);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const dataObject = snapshot.val();
          const dataArray = Object.values(dataObject);
          setTotalSharesHolder(dataArray);
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

  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <CustomBreadcrumbs
        heading="Tiến trình bầu cử Đại Hội"
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 1, md: 1 },
        }}
      />

      <Alert
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: alpha(theme.palette.primary.light, 0.2),
            endColor: alpha(theme.palette.primary.main, 0.2),
          }),
          color: '#000',
          width: '100% !important',
        }}
      >
        <FormControl sx={{ width: '100% !important' }} size="small">
          <InputLabel id="demo-simple-select-label" sx={{ width: '100%' }} size="small">
            Chọn câu hỏi
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={questionSelect}
            label="Chọn Câu Hỏi"
            onChange={handleChangeSelectQuestion}
            sx={{ minWidth: '100% !important' }}
          >
            {questionSelectData.map((item: IDataQuestionSelect) => (
              <MenuItem value={item.key}>{item.ten_poll}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography color="#000" mt={2}>
          Nội dung : {danhSachPollData.find((item) => item.key === questionSelect)?.noi_dung}
        </Typography>
      </Alert>
      <Box
        className="box_dh_content"
        sx={{
          marginTop: '20px',
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{ textAlign: 'center', paddingLeft: { xs: '0px', md: '0px' } }}
        >
          <Grid item xs={12} md={6} lg={6}>
            <DHContentLeft
              calculateTotalCP={calculateTotalCP}
              percentSendPollData={percentSendPollData}
              pollDataByKey={pollDataByKey}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <DHContentRight
              pollDataByKey={pollDataByKey}
              listResultByQuestion={listResultByQuestion}
              historySendPollData={historySendPollData}
              questionSelect={questionSelect}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <DHContentTable
              tableData={dataTable}
              tableLabels={[
                { id: 'top', label: 'Top' },
                { id: 'answer', label: 'Đáp án' },
                { id: 'turn', label: 'Lượt bầu' },
                { id: 'numberCP', label: 'Số CP' },
                { id: 'percent', label: '%' },
              ]}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
