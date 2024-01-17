'use client';

import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useEffect } from 'react';
import { SeoIllustration } from 'src/assets/illustrations';
import { paths } from 'src/routes/paths';
import AppWelcome from '../app-welcome';

import { styles } from '../styles';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const tele = window.Telegram.Webapp;
  useEffect(() => {
    tele?.ready();
  });
  return (
    <Container sx={{ maxWidth: '100% !important' }}>
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

        <Box sx={styles.box_btn_vote}>
          <Button
            variant="contained"
            sx={{
              ...styles.btn_vote,
              backgroundColor: '#7e9dec',
            }}
            href={paths.dashboard.voteDH}
          >
            Bỏ phiếu đại hội
          </Button>
          <Button
            variant="contained"
            sx={{
              ...styles.btn_vote,
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
