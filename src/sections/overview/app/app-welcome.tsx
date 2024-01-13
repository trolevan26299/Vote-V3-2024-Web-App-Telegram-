// @mui
import { useTheme, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Stack, { StackProps } from '@mui/material/Stack';
// theme
import { bgGradient } from 'src/theme/css';
import { Box, Grid } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends StackProps {
  title?: string;
  description?: string;
  img?: React.ReactNode;
  action?: React.ReactNode;
  code_holder?: string;
  number_shares?: string;
  join_rate?: string;
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
        height: { md: 1 },
        borderRadius: 2,
        position: 'relative',
        color: 'primary.darker',
        backgroundColor: 'common.white',
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
          <Grid
            container
            spacing={2}
            sx={{ textAlign: 'left', marginTop: '10px', paddingLeft: { xs: '10px', md: '0px' } }}
          >
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
              <Typography sx={{ fontWeight: 'bold' }}>{join_rate}</Typography>
            </Grid>
          </Grid>
        </Box>

        {action && action}
      </Stack>

      {img && (
        <Stack
          component="span"
          justifyContent="center"
          sx={{
            p: { xs: 5, md: 3 },
            maxWidth: 360,
            mx: 'auto',
          }}
        >
          {img}
        </Stack>
      )}
    </Stack>
  );
}
