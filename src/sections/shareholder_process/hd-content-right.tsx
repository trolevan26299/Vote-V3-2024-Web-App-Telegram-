import {
  Box,
  CardProps,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { bgGradient } from 'src/theme/css';

type RowProps = {
  top: string;
  candidate: string;
  share: string;
  rate: string;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}

export default function HDContentRight({ subheader, tableData, tableLabels, ...other }: Props) {
  const theme = useTheme();

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
      <Typography variant="h6">Tiến Trình Bình Chọn</Typography>
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
          <TableContainer
            sx={{
              overflow: 'unset',
              marginTop: '20px',
              border: '1px solid gray',
            }}
          >
            <Scrollbar>
              <Table sx={{ minWidth: 640 }}>
                <TableHeadCustom headLabel={tableLabels} />

                <TableBody>
                  {tableData.map((row) => (
                    <EcommerceBestSalesmanRow key={row.top} row={row} />
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Stack>
      </Stack>
    </Box>
  );
}

type EcommerceBestSalesmanRowProps = {
  row: RowProps;
};
function EcommerceBestSalesmanRow({ row }: EcommerceBestSalesmanRowProps) {
  return (
    <TableRow>
      <TableCell align="left">
        <Label
          variant="soft"
          color={(row.top === 'Top 1' && 'primary') || (row.top === 'Top 2' && 'info') || 'error'}
        >
          {row.top}
        </Label>
      </TableCell>

      <TableCell>{row.candidate}</TableCell>

      <TableCell align="center">{row.share}</TableCell>

      <TableCell align="right">{row.rate}</TableCell>
    </TableRow>
  );
}
