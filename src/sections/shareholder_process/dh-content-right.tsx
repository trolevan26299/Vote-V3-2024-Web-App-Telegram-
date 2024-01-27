import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import Chart, { useChart } from 'src/components/chart';
import { IQuestion, IHistorySendPoll } from 'src/types/setting';
import { ISelectedAnswer } from 'src/types/votedh.types';
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

interface Props {
  historySendPollData?: IHistorySendPoll[];
  pollDataByKey?: IQuestion;
  listResultByQuestion?: ISelectedAnswer[];
  questionSelect?: string;
}

export default function DHContentRight({
  historySendPollData,
  pollDataByKey,
  listResultByQuestion,
  questionSelect,
}: Props) {
  const theme = useTheme();
  // ------------------ LOGIC tính đã gửi câu hỏi select đến bao nhiêu người và không được trùng lặp số người
  const filteredArray =
    historySendPollData &&
    historySendPollData.filter(
      (obj) => obj.ds_poll_id?.some((item) => item.key === questionSelect)
    );
  const uniqueGuiDenObjects: any = [];

  filteredArray?.forEach((item: any) => {
    item.gui_den.forEach((obj: any) => {
      const exists = uniqueGuiDenObjects.some((uniqueObj: any) => uniqueObj.ma_cd === obj.ma_cd);
      if (!exists) {
        uniqueGuiDenObjects.push(obj);
      }
    });
  });

  const numberUserVoted = uniqueGuiDenObjects.filter(
    (itemUserVoted: any) => itemUserVoted.status === 'voted'
  ).length;
  const percentUserVoted = (numberUserVoted / uniqueGuiDenObjects.length) * 100;

  // Bạn tạo một Set để lưu trữ các ma_cd đã xuất hiện
  const seenMaCd: string[] = [];

  // Bạn sử dụng phương thức reduce() để tính toán kết quả
  const totalUserReceivedQuestion =
    (filteredArray &&
      filteredArray
        .flatMap((obj) => obj.gui_den) // Chuyển mảng 2D thành mảng 1D
        .filter((item) => {
          // Nếu ma_cd đã xuất hiện, bỏ qua phần tử này
          if (seenMaCd.includes(item?.ma_cd as string)) {
            return false;
          }
          // Nếu chưa xuất hiện, thêm ma_cd vào mảng và giữ lại phần tử này
          seenMaCd.push(item?.ma_cd as string);
          return true;
        }).length) ||
    0;

  // ------------------ END LOGIC tính đã gửi câu hỏi select đến bao nhiêu người và không được trùng lặp số

  const chart: chart = {
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
  };

  // Tính tổng value trong mảng
  const totalValue = chart.series.reduce((sum, item) => sum + item.value, 0);
  chart.series.push({ label: 'Chưa bình chọn', value: totalUserReceivedQuestion - totalValue });

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
        horizontal: false,
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
            <Box sx={{ typography: 'subtitle1' }}>{percentUserVoted} %</Box>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={percentUserVoted}
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
