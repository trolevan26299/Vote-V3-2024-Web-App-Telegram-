import { m } from 'framer-motion';
// @mui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
// routes
import { useRouter } from 'src/routes/hooks';
// hooks
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import { useUser } from 'src/firebase/user_accesss_provider';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();

  const { user } = useUser();

  const OPTIONS = [
    {
      label: user?.nguoi_nuoc_ngoai === true ? 'Total Shares :' : 'CP Tham Dự :',
      value: user?.cp_tham_du?.toLocaleString('vi-VN'),
    },
    {
      label: 'Telegram ID :',
      value: String(user?.telegram_id),
    },
    {
      label: user?.nguoi_nuoc_ngoai === true ? 'Rate Shares :' : 'Tỷ lệ CP tham dự :',
      value: `${((user?.ty_le_cp_tham_du || 0) * 100).toFixed(4)} %`,
    },
  ];

  const { logout } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     popover.onClose();
  //     router.replace('/');
  //   } catch (error) {
  //     console.error(error);
  //     enqueueSnackbar('Unable to logout!', { variant: 'error' });
  //   }
  // };

  // const handleClickItem = (path: string) => {
  //   popover.onClose();
  //   router.push(path);
  // };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src=""
          alt={user?.ten_cd}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {user?.ten_cd?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            <b> {user?.ten_cd}</b>
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            <b> {user?.nguoi_nuoc_ngoai === true ? 'Code :' : 'Mã Cổ đông :'}</b>
            {user?.ma_cd}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {OPTIONS.map((option) => (
            <MenuItem key={option.label}>
              <b>{option.label} </b>
              {option.value}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem> */}
      </CustomPopover>
    </>
  );
}
