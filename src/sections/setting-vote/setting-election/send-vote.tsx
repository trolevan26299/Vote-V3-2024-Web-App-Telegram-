import {
  Box,
  Button,
  Card,
  Chip,
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
import React from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { styles } from '../styles';

type RowProps = {
  name_question: string;
  receiver: string;
  send_time: string;
  time_limit: string;
  status: string;
};

export default function SendVoteElectionView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const tableData = [
    {
      name_question: 'Câu hỏi 1',
      receiver: 'All',
      send_time: '14:50:37 29/12/2023',
      time_limit: '2h',
      status: 'Thành công',
    },
    {
      name_question: 'Câu hỏi 2',
      receiver: 'Ông A',
      send_time: '14:50:37 30/12/2023',
      time_limit: '1h',
      status: 'Thất bại',
    },
  ];
  const tableLabels = [
    { id: 'name_question', label: 'Tên nội dung' },
    { id: 'receiver', label: 'Gửi đến' },
    { id: 'send_time', label: 'Thời gian gửi' },
    { id: 'time_limit', label: 'Thời gian giới hạn' },
    { id: 'status', label: 'Trạng thái' },
  ];

  // handle select answer
  const [answer, setAnswer] = React.useState('');

  const handleChangeSelectAnswer = (event: SelectChangeEvent) => {
    setAnswer(event.target.value);
  };
  // handle select shareholder
  const [shareholder, setShareHolder] = React.useState('');

  const handleChangeSelectShareHolder = (event: SelectChangeEvent) => {
    setShareHolder(event.target.value);
  };
  // handle select time
  const [time, setTime] = React.useState('');

  const handleChangeSelectTime = (event: SelectChangeEvent) => {
    setTime(event.target.value);
  };

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
          ...styles.box_form_setting_vote_setting,
        }}
      >
        <Box className="name-content" sx={{ ...styles.box_name_content }}>
          <Typography sx={{ width: '15%' }}>Chọn câu hỏi :</Typography>
          <FormControl sx={{ width: '50%' }} size="small">
            <InputLabel id="demo-select-small-label">Câu hỏi</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={answer}
              label="Câu hỏi"
              onChange={handleChangeSelectAnswer}
            >
              <MenuItem value="">
                <em>Vui lòng chọn câu hỏi</em>
              </MenuItem>
              <MenuItem value={10}>Câu hỏi 1</MenuItem>
              <MenuItem value={20}>Câu hỏi 2 </MenuItem>
              <MenuItem value={30}>Câu hỏi 3</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className="name-content" sx={{ ...styles.box_question, mb: '35px', mt: '10px' }}>
          <Typography sx={{ width: '15%' }}>Nội dung :</Typography>
          <Typography sx={{ width: '50%' }}>Thông qua quy chế làm việc của Đại Hội </Typography>
        </Box>
        <Box className="name-content" sx={styles.box_name_content}>
          <Typography sx={{ width: '15%' }}>Chọn Cổ Đông gửi :</Typography>
          <FormControl sx={{ width: '50%' }} size="small">
            <InputLabel id="demo-select-small-label">Chọn Cổ Đông</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={shareholder}
              label="Chọn Cổ Đông"
              onChange={handleChangeSelectShareHolder}
            >
              <MenuItem value="">
                <em>Vui lòng chọn cổ đông</em>
              </MenuItem>
              <MenuItem value={10}>Tất cả</MenuItem>
              <MenuItem value={20}>Ông A </MenuItem>
              <MenuItem value={30}>Ông B</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box className="name-content" sx={{ ...styles.box_name_content, mt: '30px' }}>
          <Typography sx={{ width: '15%' }}>Thời gian giới hạn :</Typography>
          <FormControl sx={{ width: '50%' }} size="small">
            <InputLabel id="demo-select-small-label">Thời gian giới hạn</InputLabel>
            <Select
              labelId="demo-select-small-label"
              id="demo-select-small"
              value={time}
              label="Câu hỏi"
              onChange={handleChangeSelectTime}
            >
              <MenuItem value="">
                <em>Vui lòng chọn thời gian</em>
              </MenuItem>
              <MenuItem value={10}>1 Giờ</MenuItem>
              <MenuItem value={20}>2 Giờ </MenuItem>
              <MenuItem value={30}>3 Giờ</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box className="name-content" sx={{ ...styles.box_name_content, marginTop: '50px' }}>
          <Box sx={{ width: '15%' }} />
          <Button variant="contained" sx={{ width: '50%' }}>
            Gửi
          </Button>
        </Box>
      </Box>
      <Box className="list_question" sx={{ marginTop: '20px' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Lịch sử gửi
        </Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table sx={{ minWidth: 640 }}>
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {tableData.map((row, index) => (
                    <HistorySendVoteRow key={index + 1} row={row} />
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
function HistorySendVoteRow({ row }: HistoryQuestionVoteRowProps) {
  return (
    <TableRow>
      <TableCell>{row.name_question}</TableCell>

      <TableCell align="left">{row.receiver}</TableCell>

      <TableCell align="left">{row.send_time}</TableCell>
      <TableCell align="left">{row.time_limit}</TableCell>
      <TableCell align="left">
        {row.status === 'Thành công' ? (
          <Chip label={row.status} color="primary" sx={{ width: '100px' }} />
        ) : (
          <Chip label={row.status} color="error" sx={{ width: '100px' }} />
        )}
      </TableCell>
    </TableRow>
  );
}
