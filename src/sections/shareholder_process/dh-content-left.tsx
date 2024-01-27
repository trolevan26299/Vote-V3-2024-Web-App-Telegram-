import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { bgGradient } from 'src/theme/css';
import { useTheme, alpha, styled } from '@mui/material/styles';
import Chart, { useChart } from 'src/components/chart';
import { ApexOptions } from 'apexcharts';
import { fNumber } from 'src/utils/format-number';
import { IAnswer, IQuestion } from 'src/types/setting';
import { ISelectedAnswer } from 'src/types/votedh.types';

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
  percentSendPollData: number;
  pollDataByKey?: IQuestion;
  listResultByQuestion?: ISelectedAnswer[];
  totalSharesHolder?: any[];
}

export default function DHContentLeft({
  percentSendPollData,
  pollDataByKey,
  listResultByQuestion,
  totalSharesHolder,
}: Props) {
  const theme = useTheme();
  console.log('listResultByQuestion: ', listResultByQuestion);
  console.log('poll data by key:', pollDataByKey);

  const abc = (itemPoll: number) => {
    const listInfoForAnswer = listResultByQuestion?.filter(
      (item) => item.answer_select_id === String(itemPoll)
    );
    console.log('listInfoForAnswer: ', listInfoForAnswer);
    const c = listInfoForAnswer?.reduce(
      (accumulator, current) =>
        accumulator +
        (totalSharesHolder?.find((item2) => item2.ma_cd === current.ma_cd)?.cp_tham_du || 0),
      0
    );
    return c || 0;
  };
  console.log('------------------------:', abc(0));

  const chart: left_chart = {
    series:
      (pollDataByKey &&
        pollDataByKey?.dap_an?.map((item) => ({
          label: item?.vi || '',
          value: abc(item.id as number),
        }))) ||
      [],
  };
  console.log('chart', chart);
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
      <Typography variant="h6">Tiến trình gửi</Typography>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <Stack key="success">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box sx={{ typography: 'overline' }}>pending</Box>
            <Box sx={{ typography: 'subtitle1' }}>{percentSendPollData.toFixed(2)}%</Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={percentSendPollData}
            sx={{
              height: 8,
              color: (theme3) => alpha(theme3.palette.primary.light, 0.2),
              bgcolor: (theme2) => alpha(theme2.palette.grey[500], 0.16),
            }}
          />
          <Typography sx={{ marginTop: '20px', fontWeight: '600', fontSize: '16px' }}>
            Biểu đồ cổ phần số lượng bình chọn
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
