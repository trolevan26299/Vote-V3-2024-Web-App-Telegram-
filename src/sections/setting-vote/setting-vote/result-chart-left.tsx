import { Box, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import Chart, { useChart } from 'src/components/chart';
import { IQuestion } from 'src/types/setting';
import { fNumber } from 'src/utils/format-number';

interface left_chart {
  colors?: string[];
  series: {
    label: string;
    value: number;
  }[];
  options?: ApexOptions;
}
const CHART_HEIGHT = 350;
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

interface Props {
  pollDataByKey?: IQuestion;
  calculateTotalCP: (itemPoll: number) => number;
}
export default function ResultChartLeft({ pollDataByKey, calculateTotalCP }: Props) {
  const theme = useTheme();
  const chart: left_chart = {
    series:
      (pollDataByKey &&
        pollDataByKey?.dap_an?.map((item) => ({
          label: item?.vi || '',
          value: calculateTotalCP(item.id as number),
        }))) ||
      [],
  };
  const { series, colors, options } = chart;
  console.log('series:', series);

  const chartSeriesLeft = series.map((i) => i.value);
  const chartOptionsLeft = useChart({
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
    <Box className="chart_left" sx={{ width: '50%', textAlign: 'center' }}>
      <Typography sx={{ fontWeight: '600', fontSize: '16px' }}>
        Biểu đồ cổ phần số lượng bình chọn
      </Typography>
      <StyledChart
        dir="ltr"
        type="pie"
        series={chartSeriesLeft}
        options={chartOptionsLeft}
        height={280}
      />
    </Box>
  );
}
