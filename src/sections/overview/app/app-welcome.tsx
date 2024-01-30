// @mui
import Stack, { StackProps } from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
// theme
import { Box, Button, Grid } from '@mui/material';
import { paths } from 'src/routes/paths';
import { bgGradient } from 'src/theme/css';
import { styles } from './styles';

// ----------------------------------------------------------------------

interface Props extends StackProps {
  title?: string;
  description?: string;
  img?: React.ReactNode;
  action?: React.ReactNode;
  code_holder?: string;
  number_shares?: number;
  join_rate?: number;
}

export default function AppWelcome({
  title,
  description,
  action,
  img,
  code_holder,
  number_shares,
  join_rate,
  ...other
}: Props) {
  const theme = useTheme();

  return (
    <Stack
      flexDirection={{ xs: 'column', md: 'row' }}
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette.primary.light, 0.2),
          endColor: alpha(theme.palette.primary.main, 0.2),
        }),
        ...styles.box_stack_info,
      }}
      {...other}
    >
      <Stack
        flexGrow={1}
        justifyContent="center"
        alignItems={{ xs: 'center', md: 'flex-start' }}
        sx={{
          p: {
            xs: theme.spacing(5, 3, 0, 3),
            md: theme.spacing(15),
          },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Typography variant="h4" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          {title}
        </Typography>

        <Box className="box_content" sx={{ marginTop: '50px' }}>
          <Typography variant="h5">Thông tin cổ phần của bạn :</Typography>
          <Grid container spacing={2} sx={styles.grid_box}>
            <Grid item xs={8} md={6} lg={4}>
              <Typography>Mã cổ đông :</Typography>
            </Grid>
            <Grid item xs={4} md={6} lg={8}>
              <Typography sx={{ fontWeight: 'bold' }}>{code_holder}</Typography>
            </Grid>
            <Grid item xs={8} md={6} lg={4}>
              <Typography>Cổ phần tham dự :</Typography>
            </Grid>
            <Grid item xs={4} md={6} lg={8}>
              <Typography sx={{ fontWeight: 'bold' }}>{number_shares}</Typography>
            </Grid>
            <Grid item xs={8} md={6} lg={4}>
              <Typography>Tỷ lệ tham dự :</Typography>
            </Grid>
            <Grid item xs={4} md={6} lg={8}>
              <Typography sx={{ fontWeight: 'bold' }}>{join_rate?.toFixed(5)} %</Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
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
          </Grid>
        </Box>

        {action && action}
      </Stack>

      {img && (
        <Stack component="span" justifyContent="center" sx={styles.box_img}>
          {img}
        </Stack>
      )}
    </Stack>
  );
}
