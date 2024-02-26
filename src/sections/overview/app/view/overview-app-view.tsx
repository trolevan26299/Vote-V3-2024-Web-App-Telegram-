'use client';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';

import { useEffect, useState } from 'react';
import { SeoIllustration } from 'src/assets/illustrations';
import { useUser } from 'src/firebase/user_accesss_provider';
import { useTelegram } from 'src/telegram/telegram.provider';
import AppWelcome from '../app-welcome';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useUser();
  const [userAccess, setUserAccess] = useState<any>();
  const telegramContext = useTelegram();
  useEffect(() => {
    setUserAccess(telegramContext?.user);
  }, [telegramContext]);

  return (
    <Container sx={{ maxWidth: '100% !important' }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <AppWelcome
            title={`👋 ${
              user?.nguoi_nuoc_ngoai ? 'Wellcome ' : 'Chào mừng '
            } ${userAccess?.first_name} ${
              user?.nguoi_nuoc_ngoai ? ' to shareholders meeting' : ' đến với Đại Hội Cổ Đông'
            }`}
            img={<SeoIllustration />}
            code_holder={user?.ma_cd}
            cp_so_huu={user?.cp_so_huu}
            cp_uy_quyen={user?.cp_uy_quyen}
            cp_tham_du={user?.cp_tham_du}
            ty_le_cp_so_huu={user?.ty_le_cp_so_huu}
            ty_le_cp_tham_du={user?.ty_le_cp_tham_du}
            foreign={user?.nguoi_nuoc_ngoai}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
