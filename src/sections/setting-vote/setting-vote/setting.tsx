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
import { DataSnapshot, onValue, ref } from 'firebase/database';
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
  const tableLabels = [
    { id: 'name_question', label: 'Tên câu hỏi' },
    { id: 'content', label: 'Nội dung' },
    { id: 'answer', label: 'Đáp án' },
  ];

  // List question get from firebase
  const [listQuestion, setListQuestion] = useState<IQuestion[]>([]);

  // ----------------- Handle FORM ----------------------------
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
  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.POLL_PROCESS);
    const onDataChange = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        setListQuestion(snapshot.val().danh_sach_poll);
        console.log('data câu hỏi', snapshot.val().danh_sach_poll);
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

  console.log('formValuesQuestion:', formValuesQuestion);
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
          sx={{
            width: '100%',
            marginTop: '20px',
            backgroundColor: alpha(theme.palette.primary.main, 1),
          }}
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
                  {listQuestion.map((row, index) => (
                    <HistoryQuestionVoteRow key={index + 1} row={row} />
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

type HistoryQuestionVoteRowProps = {
  row: IQuestion;
};
function HistoryQuestionVoteRow({ row }: HistoryQuestionVoteRowProps) {
  return (
    <TableRow>
      <TableCell>{row?.ten_poll}</TableCell>

      <TableCell align="left">{row?.noi_dung}</TableCell>

      <TableCell align="left">{row?.dap_an?.map((item) => item.vi).join(' | ')}</TableCell>
    </TableRow>
  );
}
