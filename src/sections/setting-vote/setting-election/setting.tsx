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
import { useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { styles } from '../styles';

type RowProps = {
  name_question: string;
  content: string;
  answer: string[];
};

export default function SettingEleView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const [answerRows, setAnswerRows] = useState([{ id: 1 }]);
  const tableData = [
    {
      name_question: 'Câu hỏi 1',
      content: 'Thông qua quy chế làm việc của đại hội',
      answer: ['Tán thành', 'Không tán thành'],
    },
    {
      name_question: 'Câu hỏi 2',
      content: 'Thông qua quy chế làm việc của đại hội',
      answer: ['Tán thành', 'Không tán thành'],
    },
  ];
  const tableLabels = [
    { id: 'name_question', label: 'Tên câu hỏi' },
    { id: 'content', label: 'Nội dung' },
    { id: 'answer', label: 'Đáp án' },
  ];
  const handleAddRow = () => {
    const newId = answerRows.length + 1;
    const newRow = { id: newId };
    setAnswerRows([...answerRows, newRow]);
  };

  const handleRemoveRow = (id: number) => {
    if (answerRows.length > 1) {
      const updatedRows = answerRows.filter((row) => row.id !== id);
      setAnswerRows(updatedRows);
    }
  };

  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <CustomBreadcrumbs
        heading="Cài đặt nội dung bầu cử"
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
            sx={{ width: '35%' }}
          />
          <TextField
            id="outlined-basic"
            label="Tiếng Anh"
            variant="outlined"
            type="text"
            sx={{ width: '35%' }}
          />
        </Box>
        <Box className="name-content" sx={styles.box_question}>
          <Typography sx={{ width: '15%' }}>Nội dung bỏ phiếu :</Typography>
          <TextField
            id="outlined-basic"
            label="Tiếng Việt"
            variant="outlined"
            type="text"
            sx={{ width: '35%' }}
          />
          <TextField
            id="outlined-basic"
            label="Tiếng Anh"
            variant="outlined"
            type="text"
            sx={{ width: '35%' }}
          />
        </Box>
        <Typography sx={styles.title_answer}>Đáp án bỏ phiếu :</Typography>
        <Box sx={{ width: '100%' }}>
          {answerRows.map((row, index) => (
            <Box key={row.id} sx={styles.box_answer}>
              <Typography sx={{ width: '15%' }}>Đáp án :</Typography>
              <TextField
                id={`outlined-basic-${row.id}`}
                label="Tiếng Việt"
                variant="outlined"
                sx={{ width: '35%' }}
                size="small"
              />
              <TextField
                id={`outlined-basic-en-${row.id}`}
                label="Tiếng Anh"
                variant="outlined"
                sx={{ width: '35%' }}
                size="small"
              />
              <Button
                sx={styles.button_remove}
                onClick={() => handleRemoveRow(row.id)}
                disabled={answerRows.length === 1}
              >
                <Icon icon="akar-icons:minus" color="white" width="25" height="25" />
              </Button>
            </Box>
          ))}

          <Button sx={styles.button_add} onClick={handleAddRow}>
            <Icon icon="typcn:plus" color="white" width="25" height="25" />
          </Button>
        </Box>
      </Box>
      <Box className="list_question" sx={{ marginTop: '20px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Danh sách câu hỏi bầu cử
        </Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 640 }}>
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {tableData.map((row, index) => (
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
  row: RowProps;
};
function HistoryQuestionVoteRow({ row }: HistoryQuestionVoteRowProps) {
  return (
    <TableRow>
      <TableCell>{row.name_question}</TableCell>

      <TableCell align="left">{row.content}</TableCell>

      <TableCell align="left">{row.answer.join(' | ')}</TableCell>
    </TableRow>
  );
}
