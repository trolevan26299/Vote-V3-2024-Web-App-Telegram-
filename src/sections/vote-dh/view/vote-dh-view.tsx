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
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { useUser } from 'src/firebase/user_accesss_provider';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { bgGradient } from '../../../theme/css';
import VoteDHTable from '../vote-dh-table';

export default function VoteDHView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  const { user } = useUser();
  const [value, setValue] = useState('yes');
  // Handle change form

  // LIST DATA SEND POLL FROM FIREBASE
  const [historySendPollData, setHistorySendPollData] = useState<IHistorySendPoll[]>([]);
  const [danhSachPollData, setDanhSachPollData] = useState<IQuestion[]>([]);

  console.log('----------history-send-poll-data', historySendPollData);
  console.log('----------danhSachPollData', danhSachPollData);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const filteredData = historySendPollData.filter((item) => {
    if (item.gui_den) {
      return item.gui_den.some((den) => den.ma_cd === user?.ma_cd && den.status === 'sent');
    }
    return [];
  });
  console.log('filteredData:', filteredData);
  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.POLL_PROCESS);
    const onDataChange = (snapshot: DataSnapshot) => {
      const dataSnapShot = snapshot.exists();
      if (dataSnapShot) {
        const ls_gui_poll = snapshot.val().ls_gui_poll ?? {};
        const danh_sach_poll = snapshot.val().danh_sach_poll ?? {};
        const listHistorySendPoll = Object.keys(ls_gui_poll).map((key) => ({
          key,
          ...snapshot.val().ls_gui_poll[key],
        }));
        const listPoll = Object.keys(danh_sach_poll).map((key) => ({
          key,
          ...snapshot.val().danh_sach_poll[key],
        }));
        setHistorySendPollData(listHistorySendPoll);
        setDanhSachPollData(listPoll);
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
        heading="Bỏ phiếu đại hội"
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
        {filteredData.map((item) => (
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
              {item.ds_poll_id?.map((item2) => (
                <FormControl>
                  <Box marginBottom={1.5}>
                    <Typography sx={{ fontSize: '18px', fontWeight: '600' }}>
                      {danhSachPollData.find((item3) => item3.key === item2.key)?.ten_poll}
                    </Typography>
                    <Typography>Nội dung : Thông qua quy chế làm việc của Đại Hội </Typography>
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
                      Ý kiến của bạn :
                    </Typography>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={value}
                      onChange={handleChange}
                      sx={{ display: 'flex', flexDirection: 'row' }}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Tán Thành" />
                      <FormControlLabel value="no" control={<Radio />} label="Không tán thành" />
                    </RadioGroup>
                  </Box>
                </FormControl>
              ))}
            </Box>
          </Box>
        ))}

        <Button variant="contained" sx={{ width: { sx: '100%', md: '10%' } }}>
          Gửi ý kiến
        </Button>
      </Box>
      <Box className="vote-history-table" sx={{ marginTop: '50px' }}>
        <Typography variant="h6" sx={{ pb: '10px' }}>
          Lịch Sử Bỏ Phiếu
        </Typography>
        <VoteDHTable
          tableData={[
            { content: 'Bạn có đồng ý với .......?', opinion: 'Tán thành', status: 'Thành công' },
            { content: 'Bạn có đồng ý với .......?', opinion: 'Tán thành', status: 'Thành công' },
            { content: 'Bạn có đồng ý với .......?', opinion: 'Tán thành', status: 'Thành công' },
            { content: 'Bạn có đồng ý với .......?', opinion: 'Tán thành', status: 'Thành công' },
            { content: 'Bạn có đồng ý với .......?', opinion: 'Tán thành', status: 'Thành công' },
            { content: 'Bạn có đồng ý với .......?', opinion: 'Tán thành', status: 'Thành công' },
          ]}
          tableLabels={[
            { id: 'content', label: 'Nội dung' },
            { id: 'opinion', label: 'Ý kiến' },
            { id: 'status', label: 'Trạng Thái', align: 'center' },
          ]}
        />
      </Box>
    </Container>
  );
}
