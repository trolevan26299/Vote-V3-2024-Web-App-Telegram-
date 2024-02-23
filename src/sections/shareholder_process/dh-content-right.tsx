/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable no-nested-ternary */
import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import Chart, { useChart } from 'src/components/chart';
import { useUser } from 'src/firebase/user_accesss_provider';
import { IHistorySendPoll, IQuestion } from 'src/types/setting';
import { IHistoryVoted, ISelectedAnswer } from 'src/types/votedh.types';
import { fNumber } from 'src/utils/format-number';
import { bgGradient } from '../../theme/css';

interface chart {
  colors?: string[];
  series: {
    name: string;
    data: number[];
  }[];
  options?: ApexOptions;
}

interface Props {
  historySendPollData?: IHistorySendPoll[];
  pollDataByKey?: IQuestion[];
  listResultByQuestion?: ISelectedAnswer[];
  questionSelect?: string;
  listSendPollSuccessByKey: number;
  listHistoryVoted: IHistoryVoted[];
}

export default function DHContentRight({
  historySendPollData,
  pollDataByKey,
  listResultByQuestion,
  questionSelect,
  listSendPollSuccessByKey,
  listHistoryVoted,
}: Props) {
  const { user } = useUser();
  const theme = useTheme();
  console.log('pollDataByKey', pollDataByKey);
  console.log('questionSelect', questionSelect);
  console.log('historySendPollData', historySendPollData);
  console.log('listHistoryVoted', listHistoryVoted);

  // logic lấy ra đã gửi nhóm câu hỏi được select cho bao nhiêu người
  const listUserSendPoll = historySendPollData
    ?.filter((item) => item.groupQuestionSelect === questionSelect)
    .map((item2) => item2.gui_den)
    .flatMap((item3) => item3);
  console.log('listUserSendPoll', listUserSendPoll);
  // lấy ra list thông tin của câu hỏi theo nhóm câu hỏi được chọn
  const listQuestionInfoByGroupSelect = historySendPollData?.map((item) => item.ds_poll_id);
  // list tổng cổ phần theo list câu hỏi trong group question
  const totalShareholderByGroupSelect = listUserSendPoll?.reduce(
    (total, userSendPoll) => total + (userSendPoll?.cp_tham_du || 0),
    0
  );
  console.log('totalShareholderByGroupSelect', totalShareholderByGroupSelect);

  // logic lấy ra câu trả lời của người dùng(đáp án , cp tham dự) theo từng câu hỏi có trong group question select
  const listResultByQuestionSelect = pollDataByKey
    ?.map((pollItem) => {
      const historyItems = listHistoryVoted.filter((history) =>
        history.detail.some((detailItem) => detailItem.key_question === pollItem.key)
      );

      if (historyItems.length > 0) {
        const resultItems = historyItems.map((historyItem) => {
          const detailItem = historyItem.detail.find(
            (detailItemVoted) => detailItemVoted.key_question === pollItem.key
          );
          return {
            key: pollItem.key,
            answer_select_id: detailItem?.answer_select_id,
            cp_tham_du: historyItem.cp_tham_du,
          };
        });
        return resultItems;
      }
      return null;
    })
    .flat()
    .filter((item) => item !== null);

  // logic tính phần trăm "Tán thành" theo cổ phần tham dự theo từng câu hỏi được gửi trong group question select
  function calculatePercentResultByQuestion(answerId: string) {
    return pollDataByKey?.map((pollItem) => {
      const totalApproveShares = listResultByQuestionSelect
        ?.filter(
          (resultItem) =>
            resultItem &&
            resultItem.key === pollItem.key &&
            resultItem.answer_select_id === answerId
        )
        .reduce((total, resultItem) => (resultItem ? total + resultItem.cp_tham_du : total), 0);

      if (
        totalApproveShares !== undefined &&
        totalShareholderByGroupSelect !== undefined &&
        totalShareholderByGroupSelect !== 0
      ) {
        const approvePercentage = (totalApproveShares / totalShareholderByGroupSelect) * 100;
        return {
          key: pollItem.key,
          approve_percentage: approvePercentage,
        };
      }
    });
  }
  // logic tính số phần trăm chưa bình chọn
  const percentNoVoteByQuestion = pollDataByKey?.map((pollItem) => {
    const totalApprovePercentage =
      calculatePercentResultByQuestion('0')?.find((item) => item?.key === pollItem.key)
        ?.approve_percentage || 0;
    const totalDisApprovePercentage =
      calculatePercentResultByQuestion('2')?.find((item) => item?.key === pollItem.key)
        ?.approve_percentage || 0;

    const totalNoVotePercentage = 100 - totalApprovePercentage - totalDisApprovePercentage;

    return {
      key: pollItem.key,
      no_vote_shares: totalNoVotePercentage,
    };
  });

  console.log(listResultByQuestionSelect);
  console.log('listResultByQuestionSelect', listResultByQuestionSelect);
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

  const percentUserVoted =
    ((listUserSendPoll?.filter((item) => item?.status === 'voted')?.length || 0) /
      (listUserSendPoll?.length || 0)) *
      100 || 0;

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
      formatter(val: string | number | number[]) {
        if (typeof val === 'number') {
          return val.toFixed(2);
        }
        // Xử lý trường hợp val không phải là số nếu cần thiết
        return val.toString(); // Chuyển đổi val thành chuỗi
      },
      dropShadow: {
        enabled: false,
        blur: 1,
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
      categories: ['Câu 1', 'Câu 2', 'Câu 3'],
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
        formatter(val) {
          return `${val}% - 2000CP - 10 Người bình chọn`;
        },
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
