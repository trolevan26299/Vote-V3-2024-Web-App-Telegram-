'use client';

import { Box, Container, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { FIREBASE_COLLECTION } from 'src/constant/firebase_collection.constant';
import { database } from 'src/firebase/firebase.config';
import { IUserAccess } from 'src/types/userAccess.types';
import { bgGradient } from '../../../theme/css';
import SharesHolderInfoTable from '../sharesholder-info/sharesholder-info';
import { styles } from '../styles';

interface ShareholdersData {
  [key: string]: IUserAccess;
}

export default function SharesHolderInfoView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const [shareHolderList, setShareHolders] = useState<ShareholdersData | null>(null);

  const transformedData = shareHolderList
    ? Object.values(shareHolderList).map((shareholder: IUserAccess, index: number) => ({
        stt: index + 1,
        ma_cd: shareholder?.ma_cd,
        name_shareholder: shareholder?.ten_cd,
        ten_cd: shareholder?.ten_cd,
        cp_so_huu: shareholder?.cp_so_huu?.toString(),
        ty_le_cp_so_huu: `${
          shareholder && shareholder?.ty_le_cp_so_huu && shareholder?.ty_le_cp_so_huu?.toFixed(2)
        }%`,
        cp_tham_du: shareholder?.cp_tham_du?.toString(),
        ty_le_cp_tham_du: `${(
          ((shareholder?.ty_le_cp_tham_du && shareholder?.ty_le_cp_tham_du) || 0) * 100
        ).toFixed(2)}%`,
        trang_thai: shareholder?.trang_thai,
        telegram_id: shareholder?.telegram_id?.toString(),
        nguoi_nuoc_ngoai: shareholder?.nguoi_nuoc_ngoai,
        ghi_chu: shareholder?.ghi_chu?.toString(), // You can add the appropriate property here
      }))
    : [];
  console.log('transformedData:', transformedData);
  const totalCpSoHuu = transformedData
    .reduce((sum, shareholder) => {
      const cpSoHuu = parseInt(shareholder.cp_so_huu as string, 10) || 0;
      return sum + cpSoHuu;
    }, 0)
    .toLocaleString('en-US');

  // Calculate total cp_tham_du
  const totalCpThamDu = transformedData
    .reduce((sum, shareholder) => {
      const cpThamDu = parseInt(shareholder.cp_tham_du as string, 10) || 0;
      return sum + cpThamDu;
    }, 0)
    .toLocaleString('en-US');
  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.THONG_TIN_CD);

    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          console.log('Danh sách cổ đông:', snapshot.val());
          setShareHolders(snapshot.val());
        } else {
          console.log('No Data');
        }
      } catch (error) {
        console.error('Error when get data:', error);
      }
    };

    fetchData();

    // Clean up (optional): if you have any cleanup logic, you can put it here
  }, []);

  return (
    <Container sx={{ maxWidth: '100% !important', height: '70vh' }}>
      <CustomBreadcrumbs
        heading="Danh sách các cổ đông 2024"
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 1, md: 1 },
        }}
      />
      <SharesHolderInfoTable
        tableData={transformedData}
        tableLabels={[
          { id: 'stt', label: 'STT' },
          { id: 'ma_cd', label: 'Mã cổ đông' },
          { id: 'ten_cd', label: 'Tên cổ đông' },
          { id: 'cp_so_huu', label: 'CP sỡ hữu' },
          { id: 'ty_le_cp_so_huu', label: 'Tỷ lệ %' },
          { id: 'cp_tham_du', label: 'Tổng CP tham dự' },
          { id: 'ty_le_cp_tham_du', label: 'Tỷ lệ tham dự %' },
          { id: 'trang_thai', label: 'Trạng thái' },
          { id: 'telegram_id', label: 'Telegram ID' },
          { id: 'nguoi_nuoc_ngoai', label: 'Người nước ngoài' },
          { id: 'ghi_chu', label: 'Ghi chú' },
        ]}
        sx={{
          maxHeight: '100%',
          overflow: 'auto',
        }}
      />
      <Box
        sx={{
          ...bgGradient({
            direction: '135deg',
            startColor: alpha(theme.palette.primary.light, 0.2),
            endColor: alpha(theme.palette.primary.main, 0.2),
          }),
          ...styles.box_info_total,
        }}
      >
        <Typography sx={{ fontWeight: 500 }}>
          - Tổng cổ phần sữ hữu: <b>{totalCpSoHuu} CP</b>
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>
          - Tổng cổ phần tham dự: <b>{totalCpThamDu} CP</b>{' '}
        </Typography>
      </Box>
    </Container>
  );
}
