/* eslint-disable react-hooks/exhaustive-deps */
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
import { useTelegram } from 'src/telegram/telegram.provider';
import { useEffect, useState } from 'react';
import axios from 'axios';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();
  const telegramContext = useTelegram();

  const { user } = useUser();
  const [userAccess, setUserAccess] = useState<any>();
  const [urlImageProfile, setUrlImageProfile] = useState<string>('');

  const OPTIONS = [
    {
      label: user?.nguoi_nuoc_ngoai === true ? 'Total Shares :' : 'CP Tham Dự :',
      value: ` ${user?.cp_tham_du?.toLocaleString('vi-VN')}`,
    },
    {
      label: 'Telegram ID :',
      value: ` ${user?.telegram_id}`,
    },
    {
      label: user?.nguoi_nuoc_ngoai === true ? 'Rate Shares :' : 'Tỷ lệ CP tham dự :',
      value: ` ${((user?.ty_le_cp_tham_du || 0) * 100)
        .toFixed(4)
        .replace(/(\.[0-9]*[1-9])0+$/, '$1')
        .replace(/\.$/, '')}%`,
    },
  ];
  const popover = usePopover();
  const botToken = process.env.NEXT_PUBLIC_BOT_TOKEN;

  async function getUserProfilePhotos(userId: any) {
    const response = await axios.post(
      `https://api.telegram.org/bot${botToken}/getUserProfilePhotos`,
      {
        user_id: userId,
      }
    );
    return response.data;
  }

  // Hàm lấy URL của ảnh đại diện từ file_id
  async function getProfilePhotoUrl(fileId: any) {
    const response = await axios.post(`https://api.telegram.org/bot${botToken}/getFile`, {
      file_id: fileId,
    });
    const filePath = response.data.result.file_path;
    console.log('File path:', filePath);
    return `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  }
  async function getUserProfile(userId: any) {
    const userProfilePhotos = await getUserProfilePhotos(userId);
    if (
      userProfilePhotos &&
      userProfilePhotos.result &&
      userProfilePhotos.result.photos.length > 0
    ) {
      const firstPhoto = userProfilePhotos.result.photos[0][0];
      const photoFileId = firstPhoto.file_id;
      const photoUrl = await getProfilePhotoUrl(photoFileId);
      console.log('Profile photo URL:', photoUrl);
      return photoUrl as string;
    }
    console.log('User has no profile photo.');
    return '';
  }
  useEffect(() => {
    setUserAccess(telegramContext?.user);

    async function fetchData() {
      const urlImage = await getUserProfile(telegramContext?.user?.id);
      setUrlImageProfile(urlImage);
    }
    fetchData();
  }, [telegramContext]);
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
          src={`${urlImageProfile}`}
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
            <b> {userAccess?.first_name}</b>
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
