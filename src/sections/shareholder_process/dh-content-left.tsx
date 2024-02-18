/* eslint-disable no-nested-ternary */
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import Chart, { useChart } from 'src/components/chart';
import { useUser } from 'src/firebase/user_accesss_provider';
import { bgGradient } from 'src/theme/css';
import { IQuestion } from 'src/types/setting';
import { fNumber } from 'src/utils/format-number';

const CHART_HEIGHT = 400;
const LEGEND_HEIGHT = 72;
const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

interface left_chart {
  colors?: string[];
  series: {
    label: string;
    value: number;
  }[];
  options?: ApexOptions;
}
interface Props {
  pollDataByKey?: IQuestion;
  // listResultByQuestion?: ISelectedAnswer[];
  // totalSharesHolder?: any[];
  calculateTotalCP: (itemPoll: number) => number;
}

export default function DHContentLeft({
  pollDataByKey,
  // listResultByQuestion,
  // totalSharesHolder,
  calculateTotalCP,
}: Props) {
  const theme = useTheme();
  const { user } = useUser();

  const chart: left_chart = {
    series:
      (pollDataByKey &&
        pollDataByKey?.dap_an?.map((item) => ({
          label:
            ((!user
              ? `${item.vi}(${item.en})`
              : user.nguoi_nuoc_ngoai === true
              ? item.en
              : item.vi) as string) || '',
          value: calculateTotalCP(item.id as number),
        }))) ||
      [],
  };

  const { series, colors, options } = chart;
  const chartSeries = series.map((i) => i.value);
  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors,
    labels: series.map((i) => i.label),
    stroke: {
      colors: [theme.palette.background.paper],
    },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => fNumber(value),
        title: {
          formatter: (seriesName: string) => `${seriesName}`,
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
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
      <Typography variant="h6">
        {!user
          ? 'Tiến trình gửi (Sending Process)'
          : user.nguoi_nuoc_ngoai === true
          ? 'Sending Process'
          : 'Tiến trình gửi'}
      </Typography>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <Stack key="success">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            {/* <Box sx={{ typography: 'overline' }}>pending</Box> */}
            <Box sx={{ typography: 'subtitle1' }}>100%</Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={100}
            sx={{
              height: 8,
              color: (theme3) => alpha(theme3.palette.primary.light, 0.2),
              bgcolor: (theme2) => alpha(theme2.palette.grey[500], 0.16),
            }}
          />
          <Typography sx={{ marginTop: '20px' }} variant="h6">
            {!user ? (
              <>
                Biểu đồ cổ phần số lượng bình chọn
                <br />
                (Chart of the number of shared voted)
              </>
            ) : user.nguoi_nuoc_ngoai === true ? (
              'Chart of the number of shared voted'
            ) : (
              'Biểu đồ cổ phần số lượng bình chọn'
            )}
          </Typography>
          <StyledChart
            dir="ltr"
            type="pie"
            series={chartSeries}
            options={chartOptions}
            height={280}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
