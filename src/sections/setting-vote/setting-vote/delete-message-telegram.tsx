import { Box, Button, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import React from 'react';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';

export default function DeleteMessageTelegram() {
  const theme = useTheme();
  const confirm = useBoolean();
  return (
    <Box>
      <Box
        sx={{
          width: '50%',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
        }}
      >
        <Typography variant="h4" textAlign="center" sx={{ paddingTop: '3%', paddingBottom: '1%' }}>
          Xóa Tin nhắn
        </Typography>
        <Typography variant="caption" color="error" textAlign="center">
          * Chức năng này sẽ xóa toàn bộ tin nhắn đã gửi từ bot đến người dùng
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ width: '50%', margin: 'auto', marginY: '5%' }}
          onClick={confirm.onTrue}
        >
          Xóa
        </Button>
      </Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xóa Toàn Bộ Tin Nhắn"
        content="Bạn có chắc chắn muốn xóa tất cả tin nhắn không ? "
        action={
          <Button variant="contained" color="warning">
            Xóa
          </Button>
        }
      />
    </Box>
  );
}
