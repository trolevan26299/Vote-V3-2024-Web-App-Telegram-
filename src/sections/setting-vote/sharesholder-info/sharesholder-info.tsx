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
  code_shareholder?: string;
  password?: string;
  name_shareholder?: string;
  cp_holding?: string;
  rate?: string;
  total_shareholder_join?: string;
  rate_join?: string;
  status?: string;
  role?: string;
  telegram_id?: string;
  note?: string;
};

interface Props extends CardProps {
  subheader?: string;
  tableData: RowProps[];
  tableLabels: any;
}
export default function SharesHolderInfoTable({
  subheader,
  tableData,
  tableLabels,
  ...other
}: Props) {
  return (
    <Card {...other}>
      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 640 }}>
            <TableHeadCustom headLabel={tableLabels} />

            <TableBody>
              {tableData.map((row, index) => (
                <SharesHolderInfoRow key={index + 1} row={row} index={index} />
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}

// ----------------------------------------------------------------------

type SharesHolderInfoRowProps = {
  row: RowProps;
  index: number;
};
function SharesHolderInfoRow({ row, index }: SharesHolderInfoRowProps) {
  return (
    <TableRow>
      {/* <TableCell align="left">
        <Label
          variant="soft"
          color={(row.top === 'Top 1' && 'primary') || (row.top === 'Top 2' && 'info') || 'error'}
        >
          {row.top}
        </Label>
      </TableCell> */}

      <TableCell>{index + 1}</TableCell>
      <TableCell align="center">{row.code_shareholder}</TableCell>
      <TableCell align="center">{row.password}</TableCell>
      <TableCell align="center">{row.name_shareholder}</TableCell>
      <TableCell align="center">{row.cp_holding}</TableCell>
      <TableCell align="center">{row.rate}</TableCell>
      <TableCell align="center">{row.total_shareholder_join}</TableCell>
      <TableCell align="center">{row.rate_join}</TableCell>
      <TableCell align="center">{row.status}</TableCell>
      <TableCell align="center">{row.role}</TableCell>
      <TableCell align="center">{row.telegram_id}</TableCell>
      <TableCell align="center">{row.note}</TableCell>
    </TableRow>
  );
}
