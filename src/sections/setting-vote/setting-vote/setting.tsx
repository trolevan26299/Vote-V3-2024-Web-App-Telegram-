import { Icon } from '@iconify/react';
import {
  Box,
  Button,
  Card,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataSnapshot, onValue, push, ref, remove, set } from 'firebase/database';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IQuestion } from 'src/types/setting';
import { styles } from '../styles';

export default function SettingView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const tableLabels = [
    { id: 'name_question', label: 'Tên câu hỏi' },
    { id: 'content', label: 'Nội dung' },
    { id: 'answer', label: 'Đáp án' },
    { id: '', label: '' },
  ];

  // List question get from firebase
  const [listQuestion, setListQuestion] = useState<IQuestion[]>([]);
  const [editForm, setEditForm] = useState<string>('');

  // ----------------- Handle FORM ----------------------------
  const initForm = {
    ten_poll: '',
    ten_poll_en: '',
    noi_dung: '',
    noi_dung_en: '',
    dap_an: [
      {
        id: 0,
        en: '',
        vi: '',
      },
    ],
  };
  const [formValuesQuestion, setFormValuesQuestion] = useState({
    ten_poll: '',
    ten_poll_en: '',
    noi_dung: '',
    noi_dung_en: '',
    dap_an: [
      {
        id: 0,
        en: '',
        vi: '',
      },
    ],
  });

  const handleInputChangeQuestion = (
    field: string,
    value: string,
    index?: number,
    lang?: string
  ) => {
    if (index !== undefined && lang) {
      // Handle changes for dap_an
      const updatedDapAn = [...formValuesQuestion.dap_an];
      updatedDapAn[index] = { ...updatedDapAn[index], [lang]: value };
      setFormValuesQuestion((prevValues) => ({ ...prevValues, dap_an: updatedDapAn }));
    } else {
      // Handle changes for other fields
      setFormValuesQuestion((prevValues) => ({ ...prevValues, [field]: value }));
    }
  };

  // -----------------END  Handle FORM ----------------------------

  // function to add a row answer
  const handleAddRow = () => {
    const newId = formValuesQuestion.dap_an.length + 1;
    const newRow = { id: newId, vi: '', en: '' };
    setFormValuesQuestion((prevValues) => ({
      ...prevValues,
      dap_an: [...prevValues.dap_an, newRow],
    }));
  };

  // function to remove a row answer
  const handleRemoveRow = (id: number) => {
    if (formValuesQuestion.dap_an.length > 1) {
      const updatedDapAn = formValuesQuestion.dap_an.filter((row) => row.id !== id);
      setFormValuesQuestion((prevValues) => ({ ...prevValues, dap_an: updatedDapAn }));
    }
  };

  // get data pool answers - question
  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.POLL_PROCESS);
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      const danhSachPoll = snapshot.val()?.danh_sach_poll;
      if (dataSnapShot) {
        if (danhSachPoll && typeof danhSachPoll === 'object') {
          const listQuestionWithKeys = Object.keys(danhSachPoll).map((key) => ({
            key,
            ...danhSachPoll[key],
          }));
          setListQuestion(listQuestionWithKeys);
        } else {
          console.log('danh_sach_poll is not an object or is null/undefined');
        }
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

  // Handle Submit form for new and edit
  const handleSubmitForm = () => {
    const listPollRef = ref(
      database,
      editForm !== '' ? `poll_process/danh_sach_poll/${editForm}` : 'poll_process/danh_sach_poll'
    );
    const newRef = push(listPollRef);
    set(editForm !== '' ? listPollRef : newRef, formValuesQuestion)
      .then(() => {
        enqueueSnackbar('Lưu Thành Công !', { variant: 'success' });
        setFormValuesQuestion(initForm);
        setEditForm('');
      })
      .catch((error) => {
        enqueueSnackbar('Lưu thông tin lỗi !', { variant: 'error' });
        console.error('Error saving data:', error);
      });
  };

  // Handle remove a pool
  const handleRemoveData = (key: string) => {
    const listPollRef = ref(database, `poll_process/danh_sach_poll/${key}`);
    remove(listPollRef)
      .then(() => {
        enqueueSnackbar('Xóa Thành Công !', { variant: 'success' });
        setFormValuesQuestion(initForm);
      })
      .catch((error) => {
        enqueueSnackbar('Xóa lỗi !', { variant: 'error' });
        console.error('Error saving data:', error);
      });
  };

  const handleEditForm = (key: string) => {
    const dataEdit = listQuestion.find((item) => item.key === key);
    if (dataEdit) {
      const convertedDapAn = dataEdit?.dap_an?.map((answer) => ({
        id: answer.id || 0, // Kiểm tra và sử dụng giá trị mặc định nếu 'answer.id' là undefined
        en: answer.en || '',
        vi: answer.vi || '',
      }));
      setEditForm(key);
      setFormValuesQuestion({
        ten_poll: dataEdit.ten_poll || '',
        ten_poll_en: dataEdit.ten_poll_en || '',
        noi_dung: dataEdit.noi_dung || '',
        noi_dung_en: dataEdit.noi_dung_en || '',
        dap_an: convertedDapAn || [],
      });
    }
  };
  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <CustomBreadcrumbs
        heading="Cài đặt nội dung bỏ phiếu"
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
        <Typography sx={styles.title_form_setting}>
          {editForm !== '' ? 'Edit Form' : 'New Form'}
        </Typography>
        <Box className="name-content" sx={styles.box_name_content}>
          <Typography sx={{ width: '15%' }}>Tên nội dung :</Typography>
          <TextField
            id="outlined-basic"
            label="Tiếng Việt"
            variant="outlined"
            type="text"
            size="small"
            sx={{ width: '35%' }}
            value={formValuesQuestion.ten_poll}
            onChange={(e) => handleInputChangeQuestion('ten_poll', e.target.value)}
          />
          <TextField
            id="outlined-basic"
            label="Tiếng Anh"
            variant="outlined"
            type="text"
            size="small"
            sx={{ width: '35%' }}
            value={formValuesQuestion.ten_poll_en}
            onChange={(e) => handleInputChangeQuestion('ten_poll_en', e.target.value)}
          />
        </Box>
        <Box className="name-content" sx={styles.box_question}>
          <Typography sx={{ width: '15%' }}>Nội dung bỏ phiếu :</Typography>
          <TextField
            id="outlined-basic"
            label="Tiếng Việt"
            variant="outlined"
            type="text"
            size="small"
            sx={{ width: '35%' }}
            value={formValuesQuestion.noi_dung}
            onChange={(e) => handleInputChangeQuestion('noi_dung', e.target.value)}
          />
          <TextField
            id="outlined-basic"
            label="Tiếng Anh"
            variant="outlined"
            type="text"
            size="small"
            sx={{ width: '35%' }}
            value={formValuesQuestion.noi_dung_en}
            onChange={(e) => handleInputChangeQuestion('noi_dung_en', e.target.value)}
          />
        </Box>
        <Typography sx={styles.title_answer}>Đáp án bỏ phiếu :</Typography>
        <Box sx={{ width: '100%' }}>
          {formValuesQuestion.dap_an.map((row, index) => (
            <Box key={row.id} sx={styles.box_answer}>
              <Typography sx={{ width: '15%' }}>Đáp án :</Typography>
              <TextField
                id={`outlined-basic-${row.id}`}
                label="Tiếng Việt"
                variant="outlined"
                sx={{ width: '35%' }}
                size="small"
                value={row.vi}
                onChange={(e) => handleInputChangeQuestion('dap_an', e.target.value, index, 'vi')}
              />
              <TextField
                id={`outlined-basic-en-${row.id}`}
                label="Tiếng Anh"
                variant="outlined"
                sx={{ width: '35%' }}
                size="small"
                value={row.en}
                onChange={(e) => handleInputChangeQuestion('dap_an', e.target.value, index, 'en')}
              />
              <Button
                sx={styles.button_remove}
                onClick={() => handleRemoveRow(row.id)}
                disabled={formValuesQuestion.dap_an.length === 1}
              >
                <Icon icon="akar-icons:minus" color="white" width="25" height="25" />
              </Button>
              {index === formValuesQuestion.dap_an.length - 1 && (
                <Button sx={styles.button_add} onClick={handleAddRow}>
                  <Icon icon="typcn:plus" color="white" width="25" height="25" />
                </Button>
              )}
            </Box>
          ))}
        </Box>
        <Button
          variant="contained"
          sx={{
            width: '100%',
            marginTop: '20px',
          }}
          disabled={
            formValuesQuestion.noi_dung === '' ||
            formValuesQuestion.noi_dung_en === '' ||
            formValuesQuestion.ten_poll === '' ||
            formValuesQuestion.ten_poll_en === '' ||
            formValuesQuestion.dap_an[0].en === '' ||
            formValuesQuestion.dap_an[0].vi === ''
          }
          onClick={() => handleSubmitForm()}
        >
          Submit
        </Button>
      </Box>
      <Box className="list_question" sx={{ marginTop: '20px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Danh sách câu hỏi
        </Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 640 }}>
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {listQuestion?.map((row) => (
                    <TableRow key={row?.key}>
                      <TableCell>{row?.ten_poll}</TableCell>

                      <TableCell align="left">{row?.noi_dung}</TableCell>

                      <TableCell align="left">
                        {row?.dap_an?.map((item) => item.vi).join(' | ')}
                      </TableCell>
                      <TableCell align="left">
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleRemoveData(row.key as string)}
                        >
                          Xóa
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          sx={{ marginLeft: '10px' }}
                          onClick={() => handleEditForm(row.key as string)}
                        >
                          Chỉnh sửa
                        </Button>
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
