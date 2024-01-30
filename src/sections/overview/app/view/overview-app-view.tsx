'use client';

import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { SeoIllustration } from 'src/assets/illustrations';
import { useUser } from 'src/firebase/user_accesss_provider';
import { paths } from 'src/routes/paths';
import AppWelcome from '../app-welcome';
import { styles } from '../styles';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useUser();
  console.log('userId Access:', user);
  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <AppWelcome
            title={`👋 Chào mừng ${user?.ten_cd}  đến với Đại Hội Cổ Đông`}
            img={<SeoIllustration />}
            code_holder={user?.ma_cd}
            number_shares={user?.cp_tham_du}
            join_rate={user?.ty_le_cp_tham_du}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
