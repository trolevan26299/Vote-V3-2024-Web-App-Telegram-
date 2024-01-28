import { Box, Typography } from '@mui/material';
import { ApexOptions } from 'apexcharts';
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
  historySendPollData?: IHistorySendPoll[];
  pollDataByKey?: IQuestion;
  listResultByQuestion?: ISelectedAnswer[];
  questionSelect?: string;
}
export default function ResultChartRight({
  historySendPollData,
  pollDataByKey,
  listResultByQuestion,
  questionSelect,
}: Props) {
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
  };

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

  //  tạo một Set để lưu trữ các ma_cd đã xuất hiện
  const seenMaCd: string[] = [];

  //  sử dụng phương thức reduce() để tính toán kết quả
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

  // Tính tổng value trong mảng
  const totalValue = chartRight.series.reduce((sum, item) => sum + item.value, 0);
  chartRight.series.push({
    label: 'Chưa bình chọn',
    value: totalUserReceivedQuestion - totalValue,
  });
  const { series, colors, options } = chartRight;
  const chartSeriesRight = series.map((i) => i.value);
  const chartOptionsRight = useChart({
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
    <Box className="chart_left" sx={{ width: '50%', textAlign: 'center' }}>
      <Typography sx={{ fontWeight: '600', fontSize: '16px' }}>
        Biểu đồ cổ đông bình chọn
      </Typography>
      <Chart
        type="bar"
        dir="ltr"
        series={[{ data: chartSeriesRight }]}
        options={chartOptionsRight}
        height={364}
      />
    </Box>
  );
}
