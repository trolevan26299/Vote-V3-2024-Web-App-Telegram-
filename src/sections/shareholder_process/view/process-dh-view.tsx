/* eslint-disable no-nested-ternary */

'use client';

import { Icon } from '@iconify/react';
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { useUser } from 'src/firebase/user_accesss_provider';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useStringState } from 'src/stores/questionSelectUser.provider';
import { IHistorySendPoll, IListSender, IQuestion } from 'src/types/setting';
import { IHistoryVoted } from 'src/types/votedh.types';
import { convertToMilliseconds } from 'src/utils/convertTimeStringToMiliSeconds';
import { currentTimeUTC7 } from 'src/utils/currentTimeUTC+7';
import { bgGradient } from '../../../theme/css';
import DHContentLeft from '../dh-content-left';
import DHContentRight from '../dh-content-right';
import DHContentTable from '../dh-content-table';

export default function ProcessDHView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const { stringValue } = useStringState();
  // data from firebase state
  const [historySendPollData, setHistorySendPollData] = useState<IHistorySendPoll[]>([]);
  const [danhSachPollData, setDanhSachPollData] = useState<IQuestion[]>([]);
  const [listHistoryVoted, setListHistoryVoted] = useState<IHistoryVoted[]>([]);
  const [totalSharesHolder, setTotalSharesHolder] = useState<any>([]);
  const [isNewQuestion, setIsNewQuestion] = useState(false);

  // CODE FOR SELECT QUESTION
  // Handle select question
  const [questionSelect, SetQuestionSelect] = useState<string>(danhSachPollData[0]?.key || '');

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
          const isExisting = guiDenArray.some((guiDenItem) =>
            newArray.some((i) => i.ma_cd === guiDenItem.ma_cd)
          );

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
  const percentSendPollData =
    ((numberSendPoll.length || 0) /
      totalSharesHolder.filter((item: any) => item.trang_thai === 'Tham dự').length) *
    100;

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
        answer:
          ((!user
            ? `${item.vi}(${item.en})`
            : user.nguoi_nuoc_ngoai === true
            ? item.en
            : item.vi) as string) || '',
        turn: listResultByQuestion.filter(
          (item2: any) => item2.answer_select_id === String(item.id)
        ).length,
        numberCP: calculateTotalCP(item.id as number),
        percent: ((calculateTotalCP(item.id as number) / totalAllCP || 0) * 100).toFixed(1),
      }))) ||
    [];

  const handleClosePopup = () => {
    setIsNewQuestion(false);
  };

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
    // get data từ firebase realtime
    const userRef = ref(database, 'question_result_show_admin');
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      if (dataSnapShot) {
        const key_question_admin_show = snapshot.val();
        if (!user) {
          SetQuestionSelect(key_question_admin_show.key);
        }
      }
    };
    const unsubscribe = onValue(userRef, onDataChange);
    return () => {
      // Detach the listener
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stringValue !== undefined && stringValue !== '' && user) {
      SetQuestionSelect(stringValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringValue]);

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
        heading={(!user
          ? 'Tiến trình bỏ phiếu nội dung Đại Hội Cổ Đông (Polling process for shareholder meeting content)'
          : user.nguoi_nuoc_ngoai === true
          ? 'Polling process for shareholder meeting content'
          : 'Tiến trình bỏ phiếu nội dung Đại Hội Cổ Đông'
        )?.toString()}
        links={[{ name: '' }]}
        sizeHeader={user ? 'h4' : 'h3'}
        sx={{
          mb: { xs: 1, md: 1 },
          textAlign: typeof user === 'undefined' ? 'center' : undefined,
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
          minWidth: '100% !important',
        }}
      >
        <FormControl sx={{ minWidth: '100% !important' }} size="small" fullWidth>
          <InputLabel id="demo-simple-select-label" sx={{ width: '100%' }} size="small">
            {!user
              ? 'Chọn câu hỏi (Select Question)'
              : user.nguoi_nuoc_ngoai === true
              ? 'Select answer'
              : 'Chọn câu hỏi'}
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={questionSelect}
            label="Chọn Câu Hỏi"
            onChange={handleChangeSelectQuestion}
            sx={{ minWidth: '100% !important' }}
            fullWidth
          >
            {danhSachPollData.map((item: IQuestion) => (
              <MenuItem value={item.key} sx={{ minWidth: '100% important' }}>
                {!user
                  ? `${item.ten_poll} (${item.ten_poll_en})`
                  : user.nguoi_nuoc_ngoai === true
                  ? item.ten_poll_en
                  : item.ten_poll}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography sx={{ color: theme.palette.text.primary }} mt={2}>
          {!user ? (
            <>
              <Box fontWeight="fontWeightBold" display="inline">
                Nội dung (Content) :
              </Box>
              {danhSachPollData.find((item) => item.key === questionSelect)?.noi_dung} (
              {danhSachPollData.find((item) => item.key === questionSelect)?.noi_dung_en})
            </>
          ) : user.nguoi_nuoc_ngoai === true ? (
            <>
              <Box fontWeight="fontWeightBold" display="inline">
                Content
              </Box>
              : {danhSachPollData.find((item) => item.key === questionSelect)?.noi_dung_en}
            </>
          ) : (
            <>
              <Box fontWeight="fontWeightBold" display="inline">
                Nội dung
              </Box>
              : {danhSachPollData.find((item) => item.key === questionSelect)?.noi_dung}
            </>
          )}
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
              percentSendPollData={percentSendPollData}
              calculateTotalCP={calculateTotalCP}
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
          <Grid item xs={12}>
            <DHContentTable
              tableData={dataTable}
              tableLabels={[
                { id: 'top', label: 'Top' },
                {
                  id: 'answer',
                  label: !user
                    ? 'Đáp án (Answers)'
                    : user.nguoi_nuoc_ngoai === true
                    ? 'Answers'
                    : 'Đáp án',
                },
                {
                  id: 'turn',
                  label: !user
                    ? 'Lượt bầu (Votes)'
                    : user.nguoi_nuoc_ngoai === true
                    ? 'Votes'
                    : 'Lượt bầu',
                },
                {
                  id: 'numberCP',
                  label: !user
                    ? 'Số cổ phần (Number of shares)'
                    : user.nguoi_nuoc_ngoai === true
                    ? 'Number of shares'
                    : 'Số cổ phần',
                },
                { id: 'percent', label: '%' },
              ]}
            />
          </Grid>
        </Grid>
      </Box>
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
    </Container>
  );
}
