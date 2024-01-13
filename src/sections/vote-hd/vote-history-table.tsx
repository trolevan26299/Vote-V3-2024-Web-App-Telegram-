import {
  Card,
  CardProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

type RowProps = {
  content: string;
  member: string;
  number_shares: number;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function VoteHistoryHDTable({ subheader, tableData, tableLabels, ...other }: Props) {
  return (
    <Card>
      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 340 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row, index) => (
                <VoteHistoryTableRow key={index + 1} row={row} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type VoteDHTableRowProps = {
  row: RowProps;
};
function VoteHistoryTableRow({ row }: VoteDHTableRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ width: '40%' }} align="left">
        {row.content}
      </TableCell>

      <TableCell sx={{ width: '30%' }}>{row.member}</TableCell>
      <TableCell sx={{ width: '30%' }}>{row.number_shares}</TableCell>
    </TableRow>
  );
}
