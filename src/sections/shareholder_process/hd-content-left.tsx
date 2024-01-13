import Box from '@mui/material/Box';
import { CardProps } from '@mui/material/Card';
import { alpha, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
// components
import { LinearProgress, Stack, Typography } from '@mui/material';
import Chart, { useChart } from 'src/components/chart';
import { bgGradient } from '../../theme/css';

interface Props extends CardProps {
  title?: string;
  subheader?: string;
  chart: {
    categories?: string[];
    colors?: string[];
    series: {
      data: {
        data: number[];
      }[];
    }[];
    options?: ApexOptions;
  };
}

export default function HDContentLeft({ title, subheader, chart, ...other }: Props) {
  const { categories, colors, series, options } = chart;

  const theme = useTheme();

  const chartOptions = useChart({
    colors,
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `$${value}`,
      },
    },
    ...options,
  });

  return (
    <Box
      {...other}
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette.primary.light, 0.2),
          endColor: alpha(theme.palette.primary.main, 0.2),
        }),
        borderRadius: '20px',
        padding: '20px',
        height: '100%',
      }}
    >
      {/* <CardHeader title={title} subheader={subheader} /> */}

      <Typography variant="h6">Tiến Trình Gửi</Typography>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <Stack key="success">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box sx={{ typography: 'overline' }}>pending</Box>
            <Box sx={{ typography: 'subtitle1' }}>50%</Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={50}
            sx={{
              height: 8,
              color: (theme3) => alpha(theme3.palette.primary.light, 0.2),
              bgcolor: (theme2) => alpha(theme2.palette.grey[500], 0.16),
            }}
          />

          {series.map((item, index) => (
            <Box key={index + 1} sx={{ mt: 3, mx: 3 }}>
              <Chart dir="ltr" type="bar" series={item.data} options={chartOptions} height={364} />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
