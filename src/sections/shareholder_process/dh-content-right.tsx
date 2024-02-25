/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import Chart, { useChart } from 'src/components/chart';
import { useUser } from 'src/firebase/user_accesss_provider';
import { IQuestion } from 'src/types/setting';
import { bgGradient } from '../../theme/css';

interface chart {
  colors?: string[];
  series: {
    name: string;
    data: number[];
  }[];
  options?: ApexOptions;
}
interface ApprovePercentage {
  key: string;
  approve_percentage: number;
}
interface Props {
  pollDataByKey?: IQuestion[];
  calculatePercentResultByQuestion: (answerId: string) => ApprovePercentage[];
  percentNoVoteByQuestion: any;
  percentUserVoted: number;
  dataForChart: any[];
}

export default function DHContentRight({
  pollDataByKey,
  calculatePercentResultByQuestion,
  percentNoVoteByQuestion,
  percentUserVoted,
  dataForChart,
}: Props) {
  const { user } = useUser();
  const theme = useTheme();
  console.log('dataForChart', dataForChart);

  // ------------------ END LOGIC tính đã gửi câu hỏi select đến bao nhiêu người và không được trùng lặp số

  const chart: chart = {
    series: [
      {
        name: !user
          ? 'Tán Thành (Approve)'
          : user.nguoi_nuoc_ngoai === true
          ? 'Approve'
          : 'Tán Thành',
        data:
          calculatePercentResultByQuestion('0')?.map((item: any) => item.approve_percentage) || [],
      },
      {
        name: !user
          ? 'Không Tán Thành (Disapprove)'
          : user.nguoi_nuoc_ngoai === true
          ? 'Disapprove'
          : 'Không Tán Thành',
        data:
          calculatePercentResultByQuestion('2')?.map((item: any) => item.approve_percentage) || [],
      },
      {
        name: !user
          ? 'Chưa bình chọn (No Vote)'
          : user.nguoi_nuoc_ngoai === true
          ? 'No Vote'
          : 'Chưa bình chọn',
        data: percentNoVoteByQuestion?.map((item: any) => item.no_vote_shares) || [],
      },
    ],
  };

  const { options } = chart;

  const chartOptions = useChart({
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
        blur: 1,
      },
      formatter(
        val: string | number | number[],
        { seriesIndex, dataPointIndex }: { seriesIndex: number; dataPointIndex: number }
      ) {
        const questionAt = chartOptions.xaxis?.categories[dataPointIndex];
        const dataChartByQuestion = dataForChart.find((item) => item.question === questionAt);
        console.log('dataChartByQuestion', dataChartByQuestion);

        if (typeof val === 'number') {
          return `${
            !user
              ? `${val.toFixed(2)}% - ${
                  seriesIndex === 0
                    ? dataChartByQuestion.approve
                        .reduce(
                          (total: number, userSendPoll: any) =>
                            total + (userSendPoll?.cp_tham_du || 0),
                          0
                        )
                        .toLocaleString('vi-VN')
                    : seriesIndex === 1
                    ? dataChartByQuestion.disapprove
                        .reduce(
                          (total: number, userSendPoll: any) =>
                            total + (userSendPoll?.cp_tham_du || 0),
                          0
                        )
                        .toLocaleString('vi-VN')
                    : dataChartByQuestion.noVote.totalShareholderNoVote.toLocaleString('vi-VN')
                }CP - ${
                  seriesIndex === 0
                    ? dataChartByQuestion.approve.length
                    : seriesIndex === 1
                    ? dataChartByQuestion.disapprove.length
                    : dataChartByQuestion.noVote.totalNoVote
                } ${!user ? ' Lượt (Vote)' : ' Vote'}`
              : `${val.toFixed(2)}%`
          }`;
        }

        return `${String(val.toString())} %`;
      },
    },
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      stackType: '100%',
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    stroke: {
      width: 1,
      colors: ['#fff'],
    },

    xaxis: {
      categories: pollDataByKey?.map((item) => item.ten_poll) || [],
      labels: {
        style: {
          colors: theme.palette.text.primary,
          fontSize: '13px',
          fontWeight: '500',
        },
        show: true,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: theme.palette.text.primary,
          fontSize: '15px',
          fontWeight: '600',
        },
        show: true,
      },
    },
    tooltip: {
      y: {
        formatter(
          val: string | number | number[],
          { seriesIndex, dataPointIndex }: { seriesIndex: number; dataPointIndex: number }
        ) {
          const questionAt = chartOptions.xaxis?.categories[dataPointIndex];
          const dataChartByQuestion = dataForChart.find((item) => item.question === questionAt);
          console.log('dataChartByQuestion', dataChartByQuestion);

          if (typeof val === 'number') {
            return `${
              !user
                ? `${val.toFixed(2)}% - ${
                    seriesIndex === 0
                      ? dataChartByQuestion.approve
                          .reduce(
                            (total: number, userSendPoll: any) =>
                              total + (userSendPoll?.cp_tham_du || 0),
                            0
                          )
                          .toLocaleString('vi-VN')
                      : seriesIndex === 1
                      ? dataChartByQuestion.disapprove
                          .reduce(
                            (total: number, userSendPoll: any) =>
                              total + (userSendPoll?.cp_tham_du || 0),
                            0
                          )
                          .toLocaleString('vi-VN')
                      : dataChartByQuestion.noVote.totalShareholderNoVote.toLocaleString('vi-VN')
                  }CP - ${
                    seriesIndex === 0
                      ? dataChartByQuestion.approve.length
                      : seriesIndex === 1
                      ? dataChartByQuestion.disapprove.length
                      : dataChartByQuestion.noVote.totalNoVote
                  } ${!user ? ' Lượt (Vote)' : ' Vote'}`
                : `${val.toFixed(2)}%`
            }`;
          }

          return `${String(val.toString())} %`;
        },
      },
      fixed: {
        enabled: !!user, // Kích hoạt cố định tooltip
        position: 'center', // Cố định tooltip ở giữa
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      offsetX: 40,
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
          ? 'Tiến trình bình chọn (Polling Process)'
          : user.nguoi_nuoc_ngoai === true
          ? 'Polling Process'
          : 'Tiến trình bình chọn'}
      </Typography>
      <Stack spacing={3} sx={{ pt: 1 }}>
        <Stack key="success">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box sx={{ typography: 'subtitle1' }}>{percentUserVoted.toFixed(2) || 0} %</Box>
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
          <Typography sx={{ marginTop: '20px' }} variant="h6">
            {!user ? (
              <>
                Biểu đồ cổ đông bình chọn
                <br />
                (Chart of shareholder votes)
              </>
            ) : user.nguoi_nuoc_ngoai === true ? (
              'Chart of shareholder votes'
            ) : (
              'Biểu đồ cổ đông bình chọn'
            )}
          </Typography>
          <Chart type="bar" dir="ltr" series={chart.series} options={chartOptions} height={364} />
        </Stack>
      </Stack>
    </Box>
  );
}
