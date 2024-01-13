'use client';

import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { SeoIllustration } from 'src/assets/illustrations';
import { useSettingsContext } from 'src/components/settings';
import { paths } from 'src/routes/paths';
import AppWelcome from '../app-welcome';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <AppWelcome
            title=" 👋 Chào mừng Lincoln đến với Đại Hội Cổ Đông"
            img={<SeoIllustration />}
            code_holder="V323005"
            number_shares="10000"
            join_rate="0.03%"
          />
        </Grid>

        <Box
          sx={{
            width: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, md: 5 },
            marginTop: { xs: '5%', md: '10%' },
          }}
        >
          <Button
            variant="contained"
            sx={{
              width: '45%',
              padding: { xs: '10px 30px', md: '20px 80px' },
              backgroundColor: '#7e9dec',
            }}
            href={paths.dashboard.voteDH}
          >
            Bỏ phiếu đại hội
          </Button>
          <Button
            variant="contained"
            sx={{
              width: '45%',
              padding: { xs: '10px 30px', md: '20px 80px' },
              backgroundColor: '#27D0B7',
            }}
            href={paths.dashboard.voteHD}
          >
            Bầu cử cổ đông
          </Button>
        </Box>
      </Grid>
    </Container>
  );
}
