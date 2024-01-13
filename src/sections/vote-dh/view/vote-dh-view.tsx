'use client';

import {
  Alert,
  AlertTitle,
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
import { useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { bgGradient } from '../../../theme/css';
import VoteDHTable from '../vote-dh-table';

export default function VoteDHView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const [value, setValue] = useState('yes');
  // Handle change form
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Bỏ phiếu đại hội"
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
        <AlertTitle color="#000">Nội dung bầu cử :</AlertTitle>- Thông qua quy chế làm việc của Đại
        Hội
      </Alert>
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
          padding: '20px',
        }}
      >
        <FormControl>
          <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>Ý kiến của bạn</Typography>
          <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={value}
            onChange={handleChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Tán Thành" />
            <FormControlLabel value="no" control={<Radio />} label="Không tán thành" />
          </RadioGroup>
        </FormControl>
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
