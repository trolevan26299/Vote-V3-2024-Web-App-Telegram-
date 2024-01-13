import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import Chart, { useChart } from 'src/components/chart';
import { fNumber } from 'src/utils/format-number';
import { bgGradient } from '../../theme/css';

interface chart {
  colors?: string[];
  series: {
    label: string;
    value: number;
  }[];
  options?: ApexOptions;
}
export default function DHContentRight() {
  const theme = useTheme();
  const chart: chart = {
    series: [
      { label: 'Tán thành', value: 500 },
      { label: 'Không tán thành', value: 200 },
      { label: 'Chưa bình chọn', value: 448 },
    ],
  };
  const { series, colors, options } = chart;
  const chartSeries = series.map((i) => i.value);

  const chartOptions = useChart({
    colors,
    tooltip: {
      marker: { show: false },
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: () => '',
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '28%',
        borderRadius: 2,
      },
    },
    xaxis: {
      categories: series.map((i) => i.label),
    },
    ...options,
  });

  return (
    <Box
      width={1}
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
      <Typography variant="h6">Tiến trình bình chọn</Typography>
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
          <Typography sx={{ marginTop: '20px', fontWeight: '600', fontSize: '16px' }}>
            Biểu đồ cổ đông bình chọn
          </Typography>
          <Chart
            type="bar"
            dir="ltr"
            series={[{ data: chartSeries }]}
            options={chartOptions}
            height={364}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
