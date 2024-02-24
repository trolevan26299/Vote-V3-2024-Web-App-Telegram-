/* eslint-disable no-nested-ternary */
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
import { DataSnapshot, get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { sendTelegramMessage } from 'src/api/sendTelegramMessage';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IHistorySendPoll, IQuestion, ISendPollStatusSuccess } from 'src/types/setting';
import { IUserAccess } from 'src/types/userAccess.types';
import { IHistoryVoted } from 'src/types/votedh.types';
import { ExpireTimeFunc } from 'src/utils/calculatorTimeExpire';
import { currentTimeUTC7 } from 'src/utils/currentTimeUTC+7';
import { styles } from '../styles';

export default function SendVoteView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const tableLabels = [
    { id: 'grouQuestionSelect', label: 'Nhóm Câu hỏi' },
    { id: 'name_question', label: 'Tên nội dung' },
    { id: 'receiver', label: 'Gửi đến' },
    { id: 'send_time', label: 'Thời gian gửi' },
    { id: 'time_limit', label: 'Thời gian giới hạn' },
  ];

  // handle select answer
  const [answerSelect, setAnswerSelect] = React.useState<IQuestion[]>([]);
  const [groupQuestionSelect, setGroupQuestionSelect] = React.useState<string>('');

  // handle select shareholder
  const allOption: IUserAccess = {
    ten_cd: 'Tất cả',
  };
  const [inputValueTextShareHolder, setInputValueTextShareHolder] = useState('');
  const [shareHolderSelect, setShareHolderSelect] = React.useState<IUserAccess[]>([]);

  // handle select time expired
  const [expireTime, setExpireTime] = React.useState<string>('');

  // handle change Choose question for check logs
  const [questionCheckLog, setQuestionCheckLog] = React.useState<string>('');

  const [listSendPollStatusSuccess, setListSendPollStatusSuccess] = useState<
    ISendPollStatusSuccess[]
  >([]);

  // list history send poll from firebase
  const [historySendPoll, setHistorySendPoll] = useState<IHistorySendPoll[]>([]);

  // list question from firebase
  const [listQuestion, setListQuestion] = useState<IQuestion[]>([]);
  // listSharesHolders from firebase
  const [listSharesHolders, setListSharesHolders] = useState<IUserAccess[]>([]);

  // list Hitsory Poll
  const [listHistoryPoll, setListHistoryPoll] = useState<IHistoryVoted[]>([]);

  // lấy ra các nhóm câu hỏi
  const listGroupQuestion = listQuestion
    .map((item) => item.group)
    .filter((value, index, self) => self.indexOf(value) === index);

  // list ma_cd send poll success
  const listCDSendPollSuccess = listSendPollStatusSuccess
    .filter((item) => item.keyQuestion === questionCheckLog)
    .flatMap((item) => {
      const listUserSentSuccess = item.listUserSentSuccess.toString();
      return listSharesHolders
        .filter(
          (holder) =>
            holder.telegram_id !== undefined &&
            listUserSentSuccess.includes(holder.telegram_id.toString())
        )
        .map((holder) => holder.ten_cd);
    });

  // Code lấy ra list cổ đông đã gửi poll theo câu hỏi ==================================
  const filteredArray =
    historySendPoll &&
    historySendPoll.filter((obj) => obj.ds_poll_id?.some((item) => item.key === questionCheckLog));
  const uniqueGuiDenObjects: any = [];
  filteredArray?.forEach((item: any) => {
    item.gui_den.forEach((obj: any) => {
      const exists = uniqueGuiDenObjects.some((uniqueObj: any) => uniqueObj.ma_cd === obj.ma_cd);
      if (!exists) {
        uniqueGuiDenObjects.push(obj);
      }
    });
  });

  // list ma_cd send poll fail
  const missingPollList = uniqueGuiDenObjects.filter(
    (obj: any) =>
      // Kiểm tra xem obj.ten_cd có trong listCDSendPollSuccess không
      !listCDSendPollSuccess.some((name) => name === obj.ten_cd)
  );

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
    setExpireTime(String(event.target.value));
  };
  const handleChangeQuestionCheckLogs = (event: SelectChangeEvent) => {
    setQuestionCheckLog(String(event.target.value));
  };

  // Onchange for answer select

  // Onchange for group question select
  const handleGroupQuestionSelect = (values: any) => {
    // setAnswerSelect([]);
    setAnswerSelect(listQuestion.filter((item) => item.group === values));
    setGroupQuestionSelect(values);
  };

  const setInitFormWhenSubmit = () => {
    setAnswerSelect([]);
    setShareHolderSelect([]);
    setExpireTime('');
    setGroupQuestionSelect('');
  };

  // hàm trình chiếu muốn show tiến trình bầu cử của câu hỏi
  const handleShowResultQuestionForAdmin = () => {
    const keyShowFirebaseRef = ref(database, FIREBASE_COLLECTION.QUESTION_SHOW_BY_ADMIN);
    const updateData = {
      key: answerSelect[0].group,
    };
    update(keyShowFirebaseRef, updateData)
      .then(() => {
        enqueueSnackbar('Trình chiếu thành công !', { variant: 'success' });
      })
      .catch((error) => {
        console.log('Trình chiếu câu hỏi thất bại ,lỗi:', error);
        enqueueSnackbar('Trình chiếu thất bại !', { variant: 'default' });
      });
  };

  // hàm tìm xem trong "ls_gui_poll" có câu hỏi này đã gửi cho ứng viên trước đó chưa , trả ra mảng các phần tử có trong historySendPoll trùng lặp
  function filterCheckHistorySendPollExist(
    historySendPollCheck: IHistorySendPoll[],
    answerSelectCheck: IQuestion[],
    shareHolderSelectCheck: IUserAccess[]
  ) {
    return historySendPollCheck
      .filter((item) => {
        const dsPollIdArray = item.ds_poll_id || [];
        return dsPollIdArray.some((dsPollItem) =>
          answerSelectCheck.some((answerItem) => answerItem.key === dsPollItem.key)
        );
      })
      .filter((item) => {
        const guiDenArray = item.gui_den || [];
        return guiDenArray.some((guiDenItem) =>
          shareHolderSelectCheck.some(
            (shareHolderItem) => shareHolderItem.ma_cd === guiDenItem.ma_cd
          )
        );
      });
  }
  // hàm check xem những câu hỏi gửi đi ,trong list user thì user đó đã trả lời chưa?
  // nếu trả lời rồi thì loại bỏ kết quả vote của user đó ra khỏi ls_poll

  async function checkAndDeleteAnswerPoll() {
    shareHolderSelect.forEach(async (shareHolder) => {
      const shareholderHistory = listHistoryPoll.find(
        (history) => history.ma_cd === shareHolder.ma_cd
      );

      if (shareholderHistory) {
        const filteredDetails = shareholderHistory.detail.filter(
          (detail) => !answerSelect.some((answer) => answer.key === detail.key_question)
        );
        const shareholderRef = ref(database, `poll_process/ls_poll/${shareholderHistory.key}`);
        if (filteredDetails.length > 0) {
          await update(shareholderRef, { detail: filteredDetails });
        } else {
          await remove(shareholderRef);
        }
      }
    });
  }

  // hàm loại bỏ các phần tử trùng lặp ở trên ra khỏi dữ liệu trong firebase
  async function updateFirebaseDataExist(
    finalFilteredHistorySendPollCheckExist: IHistorySendPoll[],
    shareHolderSelectCheckExist: IUserAccess[]
  ) {
    finalFilteredHistorySendPollCheckExist.forEach(async (item) => {
      const { key, gui_den } = item;
      if (gui_den && gui_den.length > 0) {
        // Loại bỏ các phần tử giống với shareHolderSelect
        const updatedGuiDen = gui_den.filter(
          (denItem) =>
            !shareHolderSelectCheckExist.some(
              (shareHolderItem) => shareHolderItem.ma_cd === denItem.ma_cd
            )
        );

        if (updatedGuiDen.length === 0) {
          // Nếu sau khi loại bỏ mà mảng trở thành rỗng, xóa key
          // await admin.database().ref(`poll_process/ls_gui_poll/${key}`).remove();
          await remove(ref(database, `poll_process/ls_gui_poll/${key}`));
        } else {
          // Ngược lại, cập nhật mảng gui_den mới
          await update(ref(database, `poll_process/ls_gui_poll/${key}`), {
            gui_den: updatedGuiDen,
          });
        }
      }
    });
  }

  // console.log('finalFilteredHistorySendPoll', finalFilteredHistorySendPoll);
  // ================================== HANDLER SUBMIT FORM =======================================
  const handlerSubmitForm = async (type?: string) => {
    await checkAndDeleteAnswerPoll();
    await updateFirebaseDataExist(
      filterCheckHistorySendPollExist(historySendPoll, answerSelect, shareHolderSelect),
      shareHolderSelect
    );

    const historySendVoteRef = ref(database, 'poll_process/ls_gui_poll');
    const newRef = push(historySendVoteRef);
    await set(newRef, {
      ds_poll_id: answerSelect.map((item) => ({
        key: item.key,
        ten_poll: item.ten_poll,
        ten_poll_en: item.ten_poll_en,
      })),
      gui_den: shareHolderSelect.map((item) => ({
        ma_cd: item.ma_cd,
        ten_cd: item.ten_cd,
        cp_tham_du: item.cp_tham_du,
        status: 'sent',
      })),
      groupQuestionSelect,
      is_active: true,
      thoi_gian_gui: currentTimeUTC7(),
      thoi_gian_ket_thuc: ExpireTimeFunc(currentTimeUTC7(), expireTime),
    })
      .then(() => {
        enqueueSnackbar('Gửi Thành Công !', { variant: 'success' });
        sendTelegramMessage(
          shareHolderSelect.map((item) => ({
            telegram_id: Number(item.telegram_id),
            nguoi_nuoc_ngoai: item.nguoi_nuoc_ngoai as boolean,
          })),

          answerSelect.map((item) => item.ten_poll as string),
          answerSelect.map((item) => item.ten_poll_en as string),
          ExpireTimeFunc(currentTimeUTC7(), expireTime),
          answerSelect.map((item) => item.key) as string[]
        );
        setQuestionCheckLog(answerSelect[0].key as string);
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
        const ls_poll = snapshot.val().ls_poll ?? {};
        const listQuestionWithKeys = Object.keys(danh_sach_poll).map((key) => ({
          key,
          ...danh_sach_poll[key],
        }));
        const listHistorySendPoll = Object.keys(ls_gui_poll).map((key) => ({
          key,
          ...snapshot.val().ls_gui_poll[key],
        }));
        const listHistoryPollData = Object.keys(ls_poll).map((key) => ({
          key,
          ...snapshot.val().ls_poll[key],
        }));
        setListQuestion(listQuestionWithKeys);
        setHistorySendPoll(listHistorySendPoll);
        setListHistoryPoll(listHistoryPollData);
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
    const userRef = ref(database, FIREBASE_COLLECTION.LOGS_STATUS_SEND_POLL);
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      if (dataSnapShot) {
        const logs_status_send_poll = snapshot.val();
        const logStatusSendPollWithKeys = Object.keys(logs_status_send_poll).map((key) => ({
          key,
          ...logs_status_send_poll[key],
        }));

        setListSendPollStatusSuccess(logStatusSendPollWithKeys);
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
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          ...styles.box_form_setting_vote_setting,
        }}
      >
        <Box sx={{ width: '70%' }}>
          <Box className="name-content" sx={{ ...styles.box_name_content }}>
            <Typography sx={{ width: '15%' }}>Nhóm câu hỏi:</Typography>
            <FormControl sx={{ width: '70%' }} size="small">
              <InputLabel id="demo-select-small-label">Chọn nhóm câu hỏi </InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={String(groupQuestionSelect)}
                label="Nhóm"
                onChange={(event) => handleGroupQuestionSelect(event.target.value)}
              >
                <MenuItem value="">
                  <em>Vui lòng chọn nhóm câu hỏi</em>
                </MenuItem>
                {listGroupQuestion.map((item) => (
                  <MenuItem value={item}>{`Nhóm ${item}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {/* <Box className="name-content" sx={{ ...styles.box_name_content }}>
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
              options={listQuestion.filter((item) => item.group === groupQuestionSelect)}
              getOptionLabel={(option) => option.ten_poll as string}
              renderInput={(params) => (
                <TextField {...params} placeholder="Câu hỏi" label="Chọn câu hỏi" size="small" />
              )}
              sx={{ width: '70%' }}
              size="small"
            />
          </Box> */}

          <Box className="name-content" sx={{ ...styles.box_name_content }}>
            <Typography sx={{ width: '15%' }}>Nội dung câu hỏi:</Typography>
            {answerSelect.length > 0 && (
              <Box
                sx={{
                  width: '70%',
                  border: '1px solid #dbeae4',
                  borderRadius: '8px',
                  padding: '8.5px 14px',
                }}
              >
                {answerSelect.map((item) => (
                  <Typography sx={{ width: '100%' }}>
                    {`${item.ten_poll}  (Nhóm : ${item.group}): ${item.noi_dung}`}
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
              sx={{ width: '70%' }}
              size="small"
            />
          </Box>
          <Box className="name-content" sx={{ ...styles.box_name_content, mt: '30px' }}>
            <Typography sx={{ width: '15%' }}>Thời gian giới hạn :</Typography>
            <FormControl sx={{ width: '70%' }} size="small">
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
                <MenuItem value={15}>15 Phút</MenuItem>
                <MenuItem value={30}>30 Phút</MenuItem>
                <MenuItem value={45}>45 Phút</MenuItem>
                <MenuItem value={60}>1 Giờ</MenuItem>
                <MenuItem value={90}>1 Giờ 30 Phút</MenuItem>
                <MenuItem value={120}>2 Giờ</MenuItem>
                <MenuItem value={180}>3 Giờ</MenuItem>
                <MenuItem value={240}>4 Giờ</MenuItem>
                <MenuItem value={300}>5 Giờ</MenuItem>
                <MenuItem value={360}>6 Giờ</MenuItem>
                <MenuItem value={720}>12 Giờ</MenuItem>
                <MenuItem value={1440}>24 Giờ</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box className="name-content" sx={{ ...styles.box_name_content, marginTop: '50px' }}>
            <Box sx={{ width: '15%' }} />
            <Button
              variant="contained"
              color="info"
              disabled={
                answerSelect.length < 0 || shareHolderSelect.length < 0 || expireTime === ''
              }
              sx={{ width: '34%' }}
              onClick={() => handlerSubmitForm()}
            >
              Gửi
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={
                answerSelect.length < 0 || shareHolderSelect.length < 0 || expireTime === ''
              }
              sx={{ width: '34%' }}
              onClick={() => handlerSubmitForm('sentAndShow')}
            >
              Gửi & Trình Chiếu
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            width: '30%',
            border: '1px solid #212b36',
            padding: '10px 10px',
            borderRadius: '10px',
          }}
        >
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              paddingBottom: '10px',
              fontSize: '18px',
            }}
          >
            Check Logs Gửi
          </Typography>
          <FormControl sx={{ width: '100%' }} size="small">
            <InputLabel id="demo-select-small-label" sx={{ width: '100%' }}>
              Chọn câu hỏi
            </InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={questionCheckLog}
              label="Câu hỏi"
              onChange={handleChangeQuestionCheckLogs}
              sx={{ width: '100% !important' }}
            >
              {listQuestion.map((item) => (
                <MenuItem sx={{ width: '100% !important' }} value={item.key}>
                  {item.ten_poll}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ paddingTop: '20px' }}>
            <Typography>
              <b>Thành Công :</b>{' '}
              {uniqueGuiDenObjects.length === 0
                ? ''
                : listCDSendPollSuccess.length === uniqueGuiDenObjects.length
                ? 'Tất Cả'
                : listCDSendPollSuccess.join(' | ')}
            </Typography>
          </Box>
          <Box sx={{ paddingTop: '20px' }}>
            <Typography>
              <b>Thất Bại :</b>{' '}
              {missingPollList.map((item: any, index: number) => (
                <span key={index} style={{ color: 'red' }}>
                  {item.ten_cd}
                  {index < missingPollList.length - 1 ? '|' : ''}
                </span>
              ))}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className="list_question" sx={{ marginTop: '30px' }}>
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
                      <TableCell>{`Nhóm  ${row?.groupQuestionSelect}`}</TableCell>
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
