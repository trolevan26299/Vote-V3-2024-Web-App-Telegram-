import { Box, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
import { alpha, useTheme } from '@mui/material/styles';
import Chart, { useChart } from 'src/components/chart';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { ISelectedAnswer } from 'src/types/votedh.types';
import { fNumber } from 'src/utils/format-number';

interface right_chart {
  colors?: string[];
  series: {
    label: string;
    value: number;
  }[];
  options?: ApexOptions;
}

interface Props {
  pollDataByKey?: IQuestion;
  listResultByQuestion?: ISelectedAnswer[];
  totalUserReceivedQuestion?: number;
}
export default function ResultChartRight({
  pollDataByKey,
  listResultByQuestion,
  totalUserReceivedQuestion,
}: Props) {
  const theme = useTheme();
  const colors1 = [
    'rgb(0, 167, 111)',
    'rgb(255, 171, 0)',
    '#2196F3',
    '#00FFFF',
    '#FFCC99',
    '#FFCCFF',
    '#FF9999',
  ];
  const chartRight: right_chart = {
    series:
      (pollDataByKey &&
        pollDataByKey?.dap_an?.map((item) => ({
          label: item?.vi || '',
          value:
            (listResultByQuestion &&
              listResultByQuestion.filter((item2) => item2?.answer_select_id === String(item?.id))
                .length) ||
            0,
        }))) ||
      [],
    colors: colors1,
  };

  // Tính tổng value trong mảng
  const totalValue = chartRight.series.reduce((sum, item) => sum + item.value, 0);
  chartRight.series.push({
    label: 'Chưa bình chọn',
    value: (totalUserReceivedQuestion && totalUserReceivedQuestion - totalValue) || 0,
  });
  const { series, colors, options } = chartRight;
  const chartSeriesRight = series.map((i) => i.value);
  const chartOptions = useChart({
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
        blur: 1,
      },
    },

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
        horizontal: false,
        barHeight: '28%',
        borderRadius: 2,
        distributed: true,
      },
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: series.map((i) => i.label),
      labels: {
        style: {
          colors: theme.palette.text.primary,
          fontSize: '13px',
          fontWeight: '500',
        },
        show: true,
      },
    },

    ...options,
  });

  return (
    <Box className="chart_left" sx={{ width: '50%', textAlign: 'center' }}>
      <Typography sx={{ fontWeight: '600', fontSize: '16px' }}>
        Biểu đồ cổ đông bình chọn
      </Typography>
      <Chart
        type="bar"
        dir="ltr"
        series={[{ data: chartSeriesRight }]}
        options={chartOptions}
        height={364}
      />
    </Box>
  );
}
