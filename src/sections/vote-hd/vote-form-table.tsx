import {
  Card,
  CardProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
} from '@mui/material';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';

type RowProps = {
  member: string;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function VoteFormHDTable({ subheader, tableData, tableLabels, ...other }: Props) {
  return (
    <Card>
      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 340 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row, index) => (
                <VoteFormHDTableRow key={index + 1} row={row} />
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
function VoteFormHDTableRow({ row }: VoteDHTableRowProps) {
  return (
    <TableRow>
      <TableCell sx={{ width: '40%' }} align="left">
        {row.member}
      </TableCell>

      <TableCell sx={{ width: '60%' }}>
        <TextField
          id="outlined-basic"
          label="Vote cổ phần"
          variant="outlined"
          sx={{ width: '80%' }}
          type="number"
        />
      </TableCell>
    </TableRow>
  );
}
