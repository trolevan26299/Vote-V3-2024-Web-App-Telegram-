'use client';

import {
  Alert,
  AlertTitle,
  Box,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { IHistoryVoted } from 'src/types/votedh.types';
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

  // Handle select question
  const [questionSelect, SetQuestionSelect] = useState('');
  const handleChangeSelectQuestion = (event: SelectChangeEvent) => {
    SetQuestionSelect(event.target.value);
  };

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
        }}
      >
        <Box>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Age</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={questionSelect}
              label="Age"
              onChange={handleChangeSelectQuestion}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <AlertTitle color="#000">Nội dung bỏ phiếu :</AlertTitle>- Thông qua quy chế làm việc của
        Đại Hội
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
            <DHContentLeft />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <DHContentRight />
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <DHContentTable
              tableData={[
                { top: 'Top 1', answer: 'Tán thành', turn: '2', numberCP: '1000', rate: '100%' },
                {
                  top: 'Top 2',
                  answer: 'Không tán thành',
                  turn: '2',
                  numberCP: '1000',
                  rate: '100%',
                },
              ]}
              tableLabels={[
                { id: 'top', label: 'Top' },
                { id: 'answer', label: 'Đáp án' },
                { id: 'turn', label: 'Lượt bầu', align: 'center' },
                { id: 'numberCP', label: 'Số CP', align: 'right' },
                { id: 'rate', label: '%', align: 'right' },
              ]}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
