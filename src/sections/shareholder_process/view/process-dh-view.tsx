'use client';

import { Alert, AlertTitle, Box, Container, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { bgGradient } from '../../../theme/css';
import DHContentLeft from '../dh-content-left';
import DHContentRight from '../dh-content-right';
import DHContentTable from '../dh-content-table';

export default function ProcessDHView() {
  const settings = useSettingsContext();
  const theme = useTheme();
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
