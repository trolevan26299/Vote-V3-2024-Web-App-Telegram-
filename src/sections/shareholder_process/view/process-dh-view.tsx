/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
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
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { useUser } from 'src/firebase/user_accesss_provider';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useStringState } from 'src/stores/questionSelectUser.provider';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { IHistoryVoted } from 'src/types/votedh.types';
import { convertToMilliseconds } from 'src/utils/convertTimeStringToMiliSeconds';
import { currentTimeUTC7 } from 'src/utils/currentTimeUTC+7';
import { bgGradient } from '../../../theme/css';
import DHContentRight from '../dh-content-right';
import DHContentTable from '../dh-content-table';

interface ApprovePercentage {
  key: string;
  approve_percentage: number;
}

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
  const [isNewQuestion, setIsNewQuestion] = useState(false);

  // CODE FOR SELECT QUESTION
  // Handle select question
  const [questionSelect, SetQuestionSelect] = useState<string>(danhSachPollData[0]?.key || '');

  const handleChangeSelectQuestion = (event: SelectChangeEvent) => {
    SetQuestionSelect(event.target.value);
  };

  const filterArray =
    historySendPollData &&
    historySendPollData.filter(
      (obj) => obj.ds_poll_id?.some((item) => item.key === questionSelect)
    );
  const uniqueGuiDenObjects: any = [];

  filterArray?.forEach((item: any) => {
    item.gui_den.forEach((obj: any) => {
      const exists = uniqueGuiDenObjects.some((uniqueObj: any) => uniqueObj.ma_cd === obj.ma_cd);
      if (!exists) {
        uniqueGuiDenObjects.push(obj);
      }
    });
  });

  const pollDataByKey = danhSachPollData.filter((item) => item.group === questionSelect);

  // List result by question
  const listResultByQuestion: any = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const obj of listHistoryVoted) {
    //  lọc các object trong thuộc tính detail theo điều kiện
    let filteredArray = obj.detail?.filter((item) => item.key_question === questionSelect);
    filteredArray = filteredArray?.map((item) => ({ ...item, ma_cd: obj.ma_cd }));
    //  push các object trong filteredArray vào result

    if (listResultByQuestion !== undefined && filteredArray !== undefined) {
      listResultByQuestion.push(...filteredArray);
    }
  }

  // xử lý lấy ra những nhóm câu hỏi đã gửi đi
  const unitGroupQuestionSendVote = historySendPollData
    .map((item) => item.groupQuestionSelect)
    .filter((value, index, self) => self.indexOf(value) === index);

  const handleClosePopup = () => {
    setIsNewQuestion(false);
  };

  // ====================== For content right ======================================================
  // logic lấy ra đã gửi nhóm câu hỏi được select cho bao nhiêu người
  const listUserSendPoll = historySendPollData
    ?.filter((item) => item.groupQuestionSelect === questionSelect)
    .map((item2) => item2.gui_den)
    .flatMap((item3) => item3);

  console.log('pollDataByKey', pollDataByKey);
  console.log('listUserSendPoll', listUserSendPoll);
  // list tổng cổ phần theo list câu hỏi trong group question
  const totalShareholderByGroupSelect = listUserSendPoll?.reduce(
    (total, userSendPoll) => total + (userSendPoll?.cp_tham_du || 0),
    0
  );
  console.log('totalShareholderByGroupSelect', totalShareholderByGroupSelect);
  // logic lấy ra câu trả lời của người dùng(đáp án , cp tham dự) theo từng câu hỏi có trong group question select
  const listResultByQuestionSelect = pollDataByKey
    ?.map((pollItem) => {
      const historyItems = listHistoryVoted.filter(
        (history) => history.detail?.some((detailItem) => detailItem.key_question === pollItem.key)
      );

      if (historyItems.length > 0) {
        const resultItems = historyItems.map((historyItem) => {
          const detailItem = historyItem.detail.find(
            (detailItemVoted) => detailItemVoted.key_question === pollItem.key
          );
          return {
            key: pollItem.key,
            answer_select_id: detailItem?.answer_select_id,
            cp_tham_du: historyItem.cp_tham_du,
          };
        });
        return resultItems;
      }
      return null;
    })
    .flat()
    .filter((item) => item !== null);
  console.log('listResultByQuestionSelect', listResultByQuestionSelect);

  // logic tính phần trăm "Tán thành" và không tán thành theo cổ phần tham dự theo từng câu hỏi được gửi trong group question select
  const calculatePercentResultByQuestion = (answerId: string): ApprovePercentage[] =>
    pollDataByKey
      ?.map((pollItem) => {
        const totalApproveShares = listResultByQuestionSelect
          ?.filter(
            (resultItem) =>
              resultItem &&
              resultItem.key === pollItem.key &&
              resultItem.answer_select_id === answerId
          )
          .reduce((total, resultItem) => (resultItem ? total + resultItem.cp_tham_du : total), 0);
        if (
          totalApproveShares !== undefined &&
          totalShareholderByGroupSelect !== undefined &&
          totalShareholderByGroupSelect !== 0
        ) {
          const approvePercentage = (totalApproveShares / totalShareholderByGroupSelect) * 100;
          return {
            key: pollItem.key,
            approve_percentage: approvePercentage,
          };
        }
        // Trả về null cho trường hợp không xác định
        return null;
      })
      .filter((item): item is ApprovePercentage => item !== null);

  // logic tính số phần trăm chưa bình chọn
  const percentNoVoteByQuestion = pollDataByKey?.map((pollItem) => {
    const totalApprovePercentage =
      calculatePercentResultByQuestion('0')?.find((item) => item?.key === pollItem.key)
        ?.approve_percentage || 0;
    const totalDisApprovePercentage =
      calculatePercentResultByQuestion('2')?.find((item) => item?.key === pollItem.key)
        ?.approve_percentage || 0;

    const totalNoVotePercentage = 100 - totalApprovePercentage - totalDisApprovePercentage;

    return {
      key: pollItem.key,
      no_vote_shares: totalNoVotePercentage,
    };
  });

  // % số người đã bình chọn trên tổng số người được gửi câu hỏi select
  const percentUserVoted =
    ((listUserSendPoll?.filter((item) => item?.status === 'voted')?.length || 0) /
      (listUserSendPoll?.length || 0)) *
      100 || 0;

  // ======================= End for content right==================================================

  const dataTable = pollDataByKey.map((pollItem) => {
    // Lọc danh sách các kết quả bỏ phiếu cho câu hỏi hiện tại từ listResultByQuestionSelect
    const approveResults = listResultByQuestionSelect.filter(
      (resultItem) => resultItem?.key === pollItem.key && resultItem?.answer_select_id === '0'
    );
    const disapproveResults = listResultByQuestionSelect.filter(
      (resultItem) => resultItem?.key === pollItem.key && resultItem?.answer_select_id === '2'
    );

    // Tính tổng số cp_tham_du cho từng loại kết quả
    const totalApproveShares = approveResults.reduce((total, resultItem) => {
      if (resultItem) {
        return total + resultItem.cp_tham_du;
      }
      return total;
    }, 0);
    const totalDisapproveShares = disapproveResults.reduce((total, resultItem) => {
      if (resultItem) {
        return total + resultItem.cp_tham_du;
      }
      return total;
    }, 0);
    const percentApprove = (totalApproveShares / totalShareholderByGroupSelect) * 100;
    const percentDisApprove = (totalDisapproveShares / totalShareholderByGroupSelect) * 100;

    // Xây dựng các chuỗi cho cột approve và disapprove
    const approveString = `Lượt: ${approveResults.length} | ${totalApproveShares.toLocaleString(
      'vi-VN'
    )} CP (${percentApprove.toFixed(2)} %)`;
    const disapproveString = `Lượt: ${
      disapproveResults.length
    } | ${totalDisapproveShares.toLocaleString('vi-VN')} CP (${percentDisApprove.toFixed(2)} %)`;

    // Trả về dữ liệu cho mỗi hàng trong bảng
    return {
      question: `${
        !user
          ? `${pollItem.ten_poll} (${pollItem.ten_poll_en}) `
          : user.nguoi_nuoc_ngoai
          ? pollItem.ten_poll_en
          : pollItem.ten_poll
      }`,
      approve: approveString,
      disApprove: disapproveString,
    };
  });
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
        // if (user && listPoll && listPoll.length > 0) {
        //   SetQuestionSelect(listPoll[listPoll.length - 1]?.key);
        // }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          width: '100% !important',
        }}
      >
        <FormControl sx={{ width: user ? '250px !important' : '700px' }} size="small" fullWidth>
          <InputLabel id="demo-simple-select-label" sx={{ width: '100% !important' }} size="small">
            {!user
              ? 'Chọn nhóm câu hỏi (Select Group Question)'
              : user.nguoi_nuoc_ngoai === true
              ? 'Select group question'
              : 'Chọn nhóm câu hỏi'}
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
            {unitGroupQuestionSendVote.map(
              (item: string | undefined, index: number) =>
                item && (
                  <MenuItem key={index} value={item as string} sx={{ minWidth: '100% important' }}>
                    {`${
                      !user ? 'Nhóm(Group)' : user.nguoi_nuoc_ngoai ? 'Group' : 'Nhóm'
                    }   ${item}`}
                  </MenuItem>
                )
            )}
          </Select>
        </FormControl>
        <Typography sx={{ color: theme.palette.text.primary }} mt={1}>
          <>
            <Box fontWeight="fontWeightBold" display="inline">
              {!user
                ? 'Nội dung (Content) :'
                : user.nguoi_nuoc_ngoai === true
                ? 'Content :'
                : 'Nội dung :'}
            </Box>
            {danhSachPollData.map((item) => (
              <Box>
                {item.group === questionSelect ? (
                  <Box>
                    <Box fontWeight="fontWeightBold" display="inline">
                      {item.ten_poll}
                    </Box>
                    : {item.noi_dung}
                  </Box>
                ) : null}
              </Box>
            ))}
          </>
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
          {/* <Grid item xs={12} md={6} lg={6}>
            <DHContentLeft
              calculateTotalCP={calculateTotalCP}
              pollDataByKey={pollDataByKey}
              percentProcess={percentProcess}
            />
          </Grid> */}

          <Grid item xs={12} md={12} lg={12}>
            <DHContentRight
              pollDataByKey={pollDataByKey}
              calculatePercentResultByQuestion={calculatePercentResultByQuestion}
              percentNoVoteByQuestion={percentNoVoteByQuestion}
              percentUserVoted={percentUserVoted}
            />
          </Grid>
          <Grid item xs={12}>
            <DHContentTable
              tableData={dataTable}
              tableLabels={[
                {
                  id: 'question',
                  label: !user
                    ? 'Câu hỏi (Question)'
                    : user.nguoi_nuoc_ngoai
                    ? 'Question'
                    : 'Câu hỏi',
                },
                {
                  id: 'approve',
                  label: !user
                    ? 'Tán thành (Approve)'
                    : user.nguoi_nuoc_ngoai
                    ? 'Approve'
                    : 'Tán thành',
                },
                {
                  id: '',
                  label: !user
                    ? 'Không tán thành (DisApprove)'
                    : user.nguoi_nuoc_ngoai
                    ? 'DisApprove'
                    : 'Không tán thành',
                },
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
