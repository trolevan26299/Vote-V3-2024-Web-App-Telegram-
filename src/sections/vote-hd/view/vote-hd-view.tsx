'use client';

import { Alert, AlertTitle, Box, Button, Container, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import { bgGradient } from '../../../theme/css';
import VoteFormHDTable from '../vote-form-table';
import VoteHistoryHDTable from '../vote-history-table';

export default function VoteDHView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const [value, setValue] = useState('yes');
  // Handle change form
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <CustomBreadcrumbs
        heading="Bầu cử hội đồng"
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
        <AlertTitle color="#000">Nội dung bầu cử :</AlertTitle>- Bầu cử (lựa chọn ứng viên bầu bổ
        sung thành viên HDQT)
      </Alert>
      <Box
        sx={{
          marginTop: '20px',
          ...bgGradient({
            direction: '135deg',
            startColor: alpha(theme.palette.primary.light, 0.2),
            endColor: alpha(theme.palette.primary.main, 0.2),
          }),
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: { xs: '4%', md: '2%' },
          paddingLeft: '10px',
          paddingY: '20px',
          borderRadius: '10px',
        }}
      >
        <Iconify icon="formkit:people" sx={{ width: '50px !important', height: '50px' }} />
        <Box className="info">
          <Typography sx={{ fontWeight: '600' }}>V323004</Typography>
          <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>20.000 CP</Typography>
          <Typography sx={{ display: 'flex', gap: '10px', fontSize: '15px' }}>
            <Typography sx={{ color: alpha(theme.palette.primary.main, 1.5) }}>0,03% </Typography>{' '}
            Ownership Ratio
          </Typography>
        </Box>
      </Box>
      <Box
        className="box_form"
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
          padding: '10px',
          borderRadius: '10px',
        }}
      >
        <VoteFormHDTable
          tableData={[
            { member: 'Mr.Mark' },
            { member: 'Mr.Tom' },
            { member: 'Mr.B' },
            { member: 'Mr.C' },
          ]}
          tableLabels={[
            { id: 'member', label: 'Member Name' },
            { id: 'number_shares', label: 'Number Shares' },
          ]}
        />
        <Button variant="contained" sx={{ width: { sx: '100%', md: '100%' } }}>
          Gửi ý kiến
        </Button>
      </Box>
      <Box className="vote-history-table" sx={{ marginTop: '50px' }}>
        <Typography variant="h6" sx={{ pb: '10px' }}>
          Lịch Sử Bỏ Phiếu
        </Typography>
        <VoteHistoryHDTable
          tableData={[
            {
              content: 'Lựa chọn ứng viên bầu bổ sung thành viên HDQT ?',
              member: 'Mr.Mark',
              number_shares: 2000,
            },
            {
              content: 'Lựa chọn ứng viên bầu bổ sung thành viên HDQT ?',
              member: 'Mr.Tom',
              number_shares: 1000,
            },
            {
              content: 'Lựa chọn ứng viên bầu bổ sung thành viên HDQT ?',
              member: 'Mr.B',
              number_shares: 3000,
            },
            {
              content: 'Lựa chọn ứng viên bầu bổ sung thành viên HDQT ?',
              member: 'Mr.C',
              number_shares: 1500,
            },
          ]}
          tableLabels={[
            { id: 'content', label: 'Content' },
            { id: 'member', label: 'Member Name' },
            { id: 'number_shares', label: 'Number Shares' },
          ]}
        />
      </Box>
    </Container>
  );
}
