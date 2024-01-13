import {
  Box,
  Button,
  Card,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { ApexOptions } from 'apexcharts';
import React from 'react';
import Chart, { useChart } from 'src/components/chart';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { TableHeadCustom } from 'src/components/table';
import { fNumber } from 'src/utils/format-number';
import { styles } from '../styles';

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
interface left_chart {
  colors?: string[];
  series: {
    label: string;
    value: number;
  }[];
  options?: ApexOptions;
}
interface left_chart2 {
  colors?: string[];
  series2: {
    label: string;
    value: number;
  }[];
  options?: ApexOptions;
}
interface result_vote {
  id: string;
  answer: string;
  number_vote: string;
  rate_vote: string;
  share_vote: string;
  rate_share: string;
}
interface info_holder_vote {
  code: string;
  name: string;
  share: string;
}

export default function ResultElectionView() {
  const settings = useSettingsContext();
  const theme = useTheme();

  const tableLabelsResultVote = [
    { id: 'id', label: 'ID' },
    { id: 'answer', label: 'Câu trả lời' },
    { id: 'number_vote', label: 'Phiếu bầu' },
    { id: 'rate_vote', label: 'Tỷ lệ phiếu bầu %' },
    { id: 'share_vote', label: 'Cổ phần bầu' },
    { id: 'rate_share', label: 'Tỷ lệ CP %' },
  ];
  const tableLabelsInfoShareHolderVote = [
    { id: 'stt', label: 'STT' },
    { id: 'code', label: 'Mã CD' },
    { id: 'name', label: 'Tên CĐ' },
    { id: 'share', label: 'Cổ phần' },
    { id: 'uv1', label: 'Ứng viên 1' },
    { id: 'uv2', label: 'Ứng viên 2' },
    { id: 'uv3', label: 'Ứng viên 3' },
    { id: 'uv4', label: 'Ứng viên 4' },
    { id: 'uv5', label: 'Ứng viên 5' },
    { id: 'uv6', label: 'Ứng viên 6' },
    { id: 'uv7', label: 'Ứng viên 7' },
    { id: 'uv8', label: 'Ứng viên 8' },
    { id: 'uv9', label: 'Ứng viên 9' },
    { id: 'uv10', label: 'Ứng viên 10' },
  ];

  const result_vote: result_vote[] = [
    {
      id: '1',
      answer: 'Tán thành',
      number_vote: '2',
      rate_vote: '66,67%',
      share_vote: '30.000',
      rate_share: '100%',
    },
    {
      id: '2',
      answer: 'Không tán thành',
      number_vote: '1',
      rate_vote: '46,67%',
      share_vote: '20.000',
      rate_share: '60%',
    },
    {
      id: '3',
      answer: 'Chưa bầu chọn',
      number_vote: '5',
      rate_vote: '86,67%',
      share_vote: '50.000',
      rate_share: '80%',
    },
  ];
  const info_holder_vote: info_holder_vote[] = [
    {
      code: 'M3232131AAXZ1',
      name: 'Lincoln',
      share: '66,67%',
    },
    {
      code: 'M3232131AAXZ2',
      name: 'Lincoln',
      share: '66,67%',
    },
    {
      code: 'M3232131AAXZ3',
      name: 'Lincoln',
      share: '66,67%',
    },
  ];
  const rate_candidates = [
    { code: 'M3232131AAXZ1', candidate: [1000, 0, 0, 5000, 3000, 200, 100, 10000, 900, 12000] },
    { code: 'M3232131AAXZ2', candidate: [1000, 0, 0, 5000, 3000, 200, 100, 10000, 900, 12000] },
    { code: 'M3232131AAXZ3', candidate: [1000, 0, 0, 5000, 3000, 200, 100, 10000, 900, 12000] },
  ];
  // handle select answer
  const [answer, setAnswer] = React.useState('');

  const handleChangeSelectAnswer = (event: SelectChangeEvent) => {
    setAnswer(event.target.value);
  };

  // Chart left
  const chart: left_chart = {
    series: [
      { label: 'CP đã bầu', value: 70 },
      { label: 'CP Chưa bầu', value: 30 },
    ],
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

  // Chart Right
  const chart2: left_chart2 = {
    series2: [
      { label: 'Mr.Mark', value: 30 },
      { label: 'Mr.Tom', value: 30 },
      { label: 'Mr.C', value: 10 },
      { label: 'Chưa bầu chọn', value: 30 },
    ],
  };
  const { series2 } = chart2;
  const chartSeries2 = series2.map((i) => i.value);
  const chartOptions2 = useChart({
    chart: {
      sparkline: {
        enabled: true,
      },
    },
    colors,
    labels: series2.map((i) => i.label),
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
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Gửi nội dung bỏ phiếu cho Cổ Đông"
        links={[{ name: '' }]}
        sx={{
          mb: { xs: 1, md: 1 },
        }}
      />

      <Box
        sx={{
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          ...styles.box_answer_result,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Box sx={{ width: '60%' }}>
            <Box className="name-content" sx={{ ...styles.box_name_content }}>
              <Typography sx={{ width: '15%' }}>Chọn câu hỏi :</Typography>
              <FormControl sx={{ width: '50%' }} size="small">
                <InputLabel id="demo-select-small-label">Câu hỏi</InputLabel>
                <Select
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  value={answer}
                  label="Câu hỏi"
                  onChange={handleChangeSelectAnswer}
                >
                  <MenuItem value="">
                    <em>Vui lòng chọn câu hỏi</em>
                  </MenuItem>
                  <MenuItem value={10}>Câu hỏi 1</MenuItem>
                  <MenuItem value={20}>Câu hỏi 2 </MenuItem>
                  <MenuItem value={30}>Câu hỏi 3</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box className="name-content" sx={{ ...styles.box_question, mt: '10px' }}>
              <Typography sx={{ width: '15%' }}>Nội dung :</Typography>
              <Typography sx={{ width: '50%' }}>Thông qua quy chế làm việc của Đại Hội </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{ backgroundColor: alpha(theme.palette.primary.dark, 0.8) }}
          >
            Trình chiếu
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '5px',
          gap: '10%',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <Box sx={{ width: '30%', textAlign: 'center' }}>
          <Card>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Scrollbar>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>SL Tham Gia :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Gửi :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chưa Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
        </Box>
        <Box sx={{ width: '30%', textAlign: 'center' }}>
          <Card>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Scrollbar>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>SL Tham Gia :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Gửi :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Đã Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chưa Bầu Chọn :</TableCell>
                      <TableCell align="left">3</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          marginTop: '5px',
          gap: '10%',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <Box className="chart_left" sx={{ width: '50%', textAlign: 'center' }}>
          <Typography sx={{ fontWeight: '600', fontSize: '16px' }}>
            Biểu đồ số lượng cổ phần bầu cử
          </Typography>
          <StyledChart
            dir="ltr"
            type="pie"
            series={chartSeries}
            options={chartOptions}
            height={280}
          />
        </Box>
        <Box className="chart_left" sx={{ width: '50%', textAlign: 'center' }}>
          <Typography sx={{ fontWeight: '600', fontSize: '16px' }}>
            Biểu đồ cổ đông bầu chọn
          </Typography>
          <StyledChart
            dir="ltr"
            type="pie"
            series={chartSeries2}
            options={chartOptions2}
            height={280}
          />
        </Box>
      </Box>
      <Box
        sx={{
          marginTop: '5px',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <Typography variant="h6">Kết quả bầu cử :</Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table size="small">
                <TableHeadCustom headLabel={tableLabelsResultVote} />
                <TableBody>
                  {result_vote.map((item: result_vote) => (
                    <TableRow>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.answer}</TableCell>
                      <TableCell>{item.number_vote}</TableCell>
                      <TableCell>{item.rate_vote}</TableCell>
                      <TableCell>{item.share_vote}</TableCell>
                      <TableCell>{item.rate_share}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Box>
      <Box
        sx={{
          marginTop: '5px',
          border: `3px solid ${alpha(theme.palette.primary.light, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.lighter, 0.3),
          p: 2,
          justifyContent: 'center',
          borderRadius: '10px',
        }}
      >
        <Typography variant="h6">Thông tin cổ đông bầu cử :</Typography>
        <Card>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Scrollbar>
              <Table size="small">
                <TableHeadCustom headLabel={tableLabelsInfoShareHolderVote} />
                <TableBody>
                  {info_holder_vote.map((item: info_holder_vote, index) => (
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.share}</TableCell>
                      {rate_candidates
                        .find((item2) => item2.code === item.code)
                        ?.candidate.map((item3, index3) => (
                          <TableCell key={index3 + 1}>{item3}</TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Card>
      </Box>
    </Container>
  );
}
