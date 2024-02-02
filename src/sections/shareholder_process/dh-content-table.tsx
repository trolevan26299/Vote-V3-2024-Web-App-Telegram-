import {
  Card,
  CardProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import Label from 'src/components/label';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

type RowProps = {
  answer: string;
  turn?: number;
  numberCP?: number;
  percent: string | number;
  top?: string;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function DHContentTable({ subheader, tableData, tableLabels, ...other }: Props) {
  // Sắp xếp mảng tableData theo giá trị row.percent giảm dần
  const sortedTableData = [...tableData].sort(
    (a, b) => (b.percent as number) - (a.percent as number)
  );

  // Gán giá trị "Top" cho mỗi phần tử trong mảng tableData
  const updatedTableData = sortedTableData.map((row, index) => ({
    ...row,
    top: `Top ${index + 1}`,
  }));
  return (
    <Card {...other}>
      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {updatedTableData.map((row, index) => (
                <ProcessVoteTableRow key={index} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type ProcessVoteRowProps = {
  row: RowProps;
};
function ProcessVoteTableRow({ row }: ProcessVoteRowProps) {
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
      <TableCell>{row.answer}</TableCell>
      <TableCell>{row.turn}</TableCell>
      <TableCell>{row.numberCP}</TableCell>
      <TableCell>{row.percent}%</TableCell>
    </TableRow>
  );
}
