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
  question?: string;
  approve?: string;
  disApprove?: string;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function DHContentTable({ subheader, tableData, tableLabels, ...other }: Props) {
  // Sắp xếp mảng tableData theo giá trị row.percent giảm dần

  // Gán giá trị "Top" cho mỗi phần tử trong mảng tableData
  const updatedTableData = tableData.map((row, index) => ({
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
      <TableCell>{row.question}</TableCell>
      <TableCell>{row.approve}</TableCell>
      <TableCell>{row.disApprove}</TableCell>
    </TableRow>
  );
}
