/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

'use client';

import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataSnapshot, child, onValue, push, ref, runTransaction, set } from 'firebase/database';
import { enqueueSnackbar } from 'notistack';
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
import { IHistoryVoted, ISelectedAnswer } from 'src/types/votedh.types';
import { convertToMilliseconds } from 'src/utils/convertTimeStringToMiliSeconds';
import { currentTimeUTC7 } from 'src/utils/currentTimeUTC+7';
import { bgGradient } from '../../../theme/css';
import VoteDHTable from '../vote-dh-table';
import axios from 'axios';
import { GenerateUniqueID } from 'src/utils/getUuid';

export default function VoteDHView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const { updateStringValue } = useStringState();
  // LIST DATA SEND POLL FROM FIREBASE

  const [historySendPollData, setHistorySendPollData] = useState<IHistorySendPoll[]>([]);
  const [danhSachPollData, setDanhSachPollData] = useState<IQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<ISelectedAnswer[]>([]);
  const [listHistoryVoted, setListHistoryVoted] = useState<IHistoryVoted[]>([]);

  const arrayDataHistoryVoted = (
    listHistoryVoted.find((item) => item.ma_cd === user?.ma_cd)?.detail || []
  ).map((item) => {
    const pollInfo = danhSachPollData.find((poll) => poll.key === item.key_question) || {};
    const { ten_poll, ten_poll_en, noi_dung, noi_dung_en, dap_an } = pollInfo;

    return {
      question: !user || user.nguoi_nuoc_ngoai === false ? ten_poll : ten_poll_en,
      content: !user || user.nguoi_nuoc_ngoai === false ? noi_dung : noi_dung_en,
      answer:
        !user || user.nguoi_nuoc_ngoai === false
          ? dap_an?.find((dap_an_item) => dap_an_item.id === Number(item.answer_select_id))?.vi
          : dap_an?.find((dap_an_item) => dap_an_item.id === Number(item.answer_select_id))?.en,
      time: item.time_voted,
    };
  });

  // handle change form
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    questionKey: string,
    key_history_send_poll: string,
    groupQuestionSelect?: string
  ) => {
    const selectedAnswerId = (event.target as HTMLInputElement).value;

    // Kiểm tra xem ý kiến này đã được chọn trước đó hay chưa
    const existingAnswerIndex = selectedAnswers.findIndex(
      (answer) => answer.key_question === questionKey
    );

    // Nếu đã chọn, cập nhật giá trị mới
    if (existingAnswerIndex !== -1) {
      const updatedSelectedAnswers = [...selectedAnswers];
      updatedSelectedAnswers[existingAnswerIndex].answer_select_id = selectedAnswerId;
      updatedSelectedAnswers[existingAnswerIndex].time_voted = currentTimeUTC7();
      updatedSelectedAnswers[existingAnswerIndex].key_history_send_poll = key_history_send_poll;
      updatedSelectedAnswers[existingAnswerIndex].ma_cd = user?.ma_cd;
      setSelectedAnswers(updatedSelectedAnswers);
    } else {
      // Nếu chưa chọn, thêm vào danh sách
      setSelectedAnswers((prevSelectedAnswers) => [
        ...prevSelectedAnswers,
        {
          key_question: questionKey,
          answer_select_id: selectedAnswerId,
          time_voted: currentTimeUTC7(),
          key_history_send_poll,
        },
      ]);
    }
  };

  // LIST POLL QUESTION SATISFIED
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

  // Tổng số câu hỏi mà user sẽ phải trả lời
  const numberQuestionNoVote = filteredData.reduce(
    (total, item) => total + (item?.ds_poll_id?.length ?? 0),
    0
  );

  const updateHistorySendPoll = async () => {
    // update lịch sử gửi poll khi gửi ý kiến thành công
    // status : sent => voted
    // Tạo mảng mới với dữ liệu đã được cập nhật
    const updatedFilteredData = filteredData.map((item) => {
      // Kiểm tra xem item có thuộc tính gui_den hay không
      if (item.gui_den) {
        // Lọc qua mảng item.gui_den và tìm đến object có ma_cd === user?.ma_cd
        const updatedGuiDen = item.gui_den.map((den) => {
          // Nếu ma_cd trùng với user?.ma_cd, thì cập nhật thuộc tính status thành 'voted'
          if (den.ma_cd === user?.ma_cd) {
            return { ...den, status: 'voted' };
          }
          // Nếu ma_cd không trùng, giữ nguyên object
          return den;
        });

        // Trả về một bản sao của item với gui_den đã được cập nhật
        return { ...item, gui_den: updatedGuiDen };
      }

      // Nếu item không có gui_den, giữ nguyên item
      return item;
    });

    const historySendVoteRef = ref(database, 'poll_process/ls_gui_poll');

    for (const item of updatedFilteredData) {
      if (item.key) {
        const itemRef = child(historySendVoteRef, item.key);

        // Use runTransaction() instead of update()
        await runTransaction(itemRef, (currentData) => {
          // If currentData exists, merge it with the new data
          if (currentData) {
            return { ...currentData, ...item };
          }
          // If currentData does not exist, just return the new data
          return item;
        });
        router.push(paths.dashboard.process.dh);
      }
    }
  };

  // const handleSubmitVote = async () => {
  //   const dataExist =
  //     listHistoryVoted.length > 0
  //       ? listHistoryVoted.find((item) => item?.ma_cd === user?.ma_cd)
  //       : undefined; // Tìm xem đã gửi voted lần nào chưa
  //   const historyVotedRef = ref(
  //     database,
  //     `poll_process/ls_poll/${dataExist ? dataExist?.key : ''}`
  //   ); // nếu có rồi đổi ref để chỉnh sửa , nếu chưa ref để thêm mới

  //   const newRef = push(historyVotedRef);

  //   await set(dataExist ? historyVotedRef : newRef, {
  //     ma_cd: user?.ma_cd,
  //     cp_tham_du: user?.cp_tham_du,
  //     detail: dataExist ? [...dataExist.detail, ...selectedAnswers] : selectedAnswers,
  //   })
  //     .then(() => {
  //       updateHistorySendPoll();
  //       updateStringValue(selectedAnswers[0].key_question);
  //       enqueueSnackbar(
  //         user && user.nguoi_nuoc_ngoai === true ? 'Send Success !' : 'Gửi ý kiến thành công  !',
  //         { variant: 'success' }
  //       );
  //     })
  //     .catch((error) => {
  //       enqueueSnackbar('Gửi ý kiến lỗi !', { variant: 'error' });
  //       console.log('Error saving data:', error);
  //     });
  // };
  const handleSubmitVote = async () => {
    const dataExist =
      listHistoryVoted.length > 0
        ? listHistoryVoted.find((item) => item?.ma_cd === user?.ma_cd)
        : undefined; // Tìm xem đã gửi voted lần nào chưa

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_HOST_API}/vote`, {
        key: dataExist ? dataExist?.key : GenerateUniqueID(),
        ma_cd: user?.ma_cd,
        cp_tham_du: user?.cp_tham_du,
        detail: dataExist ? [...dataExist.detail, ...selectedAnswers] : selectedAnswers,
      });
      if (response) {
        updateHistorySendPoll();
        updateStringValue(selectedAnswers[0].key_question);
        enqueueSnackbar(
          user && user.nguoi_nuoc_ngoai === true ? 'Send Success !' : 'Gửi ý kiến thành công  !',
          { variant: 'success' }
        );
      }
      console.log('response', response);
    } catch (error) {
      enqueueSnackbar('Gửi ý kiến lỗi !', { variant: 'error' });
      console.log('Error saving data:', error);
    }
  };

  // GET DATA FROM FIREBASE
  useEffect(() => {
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

  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <CustomBreadcrumbs
        heading={!user || user.nguoi_nuoc_ngoai === false ? 'Bỏ phiếu đại hội' : 'Congress Poll'}
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 1, md: 1 },
        }}
      />
      <Box
        sx={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          ...bgGradient({
            direction: '135deg',
            startColor: alpha(theme.palette.primary.light, 0.2),
            endColor: alpha(theme.palette.primary.main, 0.2),
          }),
          gap: '20px',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
        {filteredData.map(
          (item) =>
            item.ds_poll_id?.map((item2) => (
              <Box
                className="box_form"
                sx={{
                  ...bgGradient({
                    direction: '135deg',
                    startColor: alpha(theme.palette.primary.light, 0.2),
                    endColor: alpha(theme.palette.primary.main, 0.2),
                  }),
                  padding: '10px',
                  borderRadius: '10px',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <FormControl>
                    <Box marginBottom={1.5}>
                      <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                        {!user || user.nguoi_nuoc_ngoai === false
                          ? danhSachPollData.find((item3) => item3.key === item2.key)?.ten_poll
                          : danhSachPollData.find((item3) => item3.key === item2.key)?.ten_poll_en}
                      </Typography>
                      <Typography>
                        {!user || user.nguoi_nuoc_ngoai === false ? 'Nội dung:' : 'Content:'}
                        {!user || user.nguoi_nuoc_ngoai === false
                          ? danhSachPollData.find((item3) => item3.key === item2.key)?.noi_dung
                          : danhSachPollData.find((item3) => item3.key === item2.key)?.noi_dung_en}
                      </Typography>
                    </Box>
                    <Box
                      className="box_answer"
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '30px',
                      }}
                    >
                      <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                        {!user || user.nguoi_nuoc_ngoai === false
                          ? 'Ý kiến của bạn:'
                          : 'Your answer:'}
                      </Typography>
                      <RadioGroup
                        aria-labelledby="demo-controlled-radio-buttons-group"
                        name="controlled-radio-buttons-group"
                        value={
                          selectedAnswers.find(
                            (itemSelectAnswer) => itemSelectAnswer.key_question === item2.key
                          )?.answer_select_id || ''
                        }
                        onChange={(event) =>
                          handleChange(
                            event,
                            item2.key as string,
                            item.key as string,
                            item?.groupQuestionSelect
                          )
                        }
                        sx={{ display: 'flex', flexDirection: 'row' }}
                      >
                        {danhSachPollData
                          .find((item3) => item3.key === item2.key)
                          ?.dap_an?.map((itemAnswer) => (
                            <FormControlLabel
                              key={itemAnswer.id}
                              value={itemAnswer.id}
                              control={<Radio />}
                              label={
                                !user || user.nguoi_nuoc_ngoai === false
                                  ? itemAnswer.vi
                                  : itemAnswer.en
                              }
                            />
                          ))}
                      </RadioGroup>
                    </Box>
                  </FormControl>
                </Box>
              </Box>
            ))
        )}
        {filteredData.length > 0 ? (
          <Button
            variant="contained"
            sx={{ width: { sx: '100%', md: '10%' } }}
            onClick={() => handleSubmitVote()}
            disabled={numberQuestionNoVote !== selectedAnswers.length}
          >
            {!user || user.nguoi_nuoc_ngoai === false ? 'Gửi ý kiến' : 'Submit your answer'}
          </Button>
        ) : (
          <Box
            sx={{
              width: 1,
              height: '100px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>
              {!user || user.nguoi_nuoc_ngoai === false
                ? 'Không có câu hỏi cần trả lời'
                : 'No have question need answer'}
            </Typography>
          </Box>
        )}
      </Box>
      <Box className="vote-history-table" sx={{ marginTop: '50px' }}>
        <Typography variant="h6" sx={{ pb: '10px' }}>
          {!user || user.nguoi_nuoc_ngoai === false
            ? 'Lịch sử bỏ phiếu của bạn :'
            : 'Your voting History :'}
        </Typography>
        <VoteDHTable
          tableData={arrayDataHistoryVoted}
          tableLabels={[
            {
              id: 'question',
              label: !user || user.nguoi_nuoc_ngoai === false ? 'Câu hỏi' : 'Question',
            },
            {
              id: 'content',
              label: !user || user.nguoi_nuoc_ngoai === false ? 'Nội dung' : 'Content',
            },
            {
              id: 'answer',
              label: !user || user.nguoi_nuoc_ngoai === false ? 'Câu trả lời' : 'Answer',
            },
            {
              id: 'time_send_vote',
              label: !user || user.nguoi_nuoc_ngoai === false ? 'Thời gian gửi' : 'Sending Time',
            },
          ]}
        />
      </Box>
    </Container>
  );
}
