'use client';

import { Alert, AlertTitle, Box, Container, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { bgGradient } from '../../../theme/css';
import HDContentLeft from '../hd-content-left';
import HDContentRight from '../hd-content-right';

export default function ProcessHDView() {
  const settings = useSettingsContext();
  const theme = useTheme();
  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <CustomBreadcrumbs
        heading="Tiến trình bầu cử Cổ Đông"
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 1, md: 1 },
        }}
      />
      <Alert
        // severity="info"
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: alpha(theme.palette.primary.light, 0.2),
            endColor: alpha(theme.palette.primary.main, 0.2),
          }),
          color: '#000',
        }}
      >
        <AlertTitle color="#000">Nội dung bầu cử :</AlertTitle> - Bầu cử (lựa chọn ứng viên bầu bổ
        sung thành viên HDQT)
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
            <HDContentLeft
              chart={{
                categories: ['Ông A', 'Ông B', 'Ông C', 'Ông D', 'Ông E', 'Ông F', 'Ông G'],
                series: [
                  {
                    data: [
                      {
                        data: [10, 41, 35, 151, 49, 62, 69],
                      },
                    ],
                  },
                ],
              }}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <HDContentRight
              tableData={[
                { top: 'Top 1', candidate: 'Ông A', share: '10000', rate: '100%' },
                { top: 'Top 2', candidate: 'Ông B', share: '20000', rate: '100%' },
                { top: 'Top 3', candidate: 'Ông C', share: '10000', rate: '100%' },
                { top: 'Top 4', candidate: 'Ông D', share: '30000', rate: '100%' },
                { top: 'Top 5', candidate: 'Ông E', share: '50000', rate: '100%' },
                { top: 'Top 6', candidate: 'Ông F', share: '20000', rate: '100%' },
                { top: 'Top 7', candidate: 'Ông G', share: '10000', rate: '100%' },
              ]}
              tableLabels={[
                { id: 'top', label: 'Top' },
                { id: 'candidate', label: 'Ứng Viên' },
                { id: 'share', label: 'Cổ phần', align: 'center' },
                { id: 'rate', label: '%', align: 'right' },
              ]}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
