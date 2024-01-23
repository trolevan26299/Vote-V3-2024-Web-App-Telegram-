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
  question?: string;
  content?: string;
  answer?: string;
  time?: string;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function VoteDHTable({ subheader, tableData, tableLabels, ...other }: Props) {
  return (
    <Card>
      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 340 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row, index) => (
                <VoteDHTableRow key={index + 1} row={row} />
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
function VoteDHTableRow({ row }: VoteDHTableRowProps) {
  return (
    <TableRow>
      <TableCell>{row?.question}</TableCell>
      <TableCell>{row?.content}</TableCell>

      <TableCell>{row?.answer}</TableCell>

      <TableCell>{row?.time}</TableCell>
    </TableRow>
  );
}
