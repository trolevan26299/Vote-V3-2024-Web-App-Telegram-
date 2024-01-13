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
  top: string;
  answer: string;
  turn: string;
  numberCP: string;
  rate: string;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function DHContentTable({ subheader, tableData, tableLabels, ...other }: Props) {
  return (
    <Card {...other}>
      <TableContainer sx={{ overflow: 'unset' }}>
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
    </Card>
  );
}

// ----------------------------------------------------------------------

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

      <TableCell>{row.answer}</TableCell>

      <TableCell align="center">{row.turn}</TableCell>

      <TableCell align="right">{row.numberCP}</TableCell>
      <TableCell align="right">{row.rate}</TableCell>
    </TableRow>
  );
}
