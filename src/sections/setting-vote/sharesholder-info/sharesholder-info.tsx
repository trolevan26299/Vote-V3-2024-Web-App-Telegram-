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
  ma_cd?: string;
  ten_cd?: string;
  cp_so_huu?: string;
  ty_le_cp_so_huu?: string;
  cp_tham_du?: string;
  ty_le_cp_tham_du?: string;
  trang_thai?: string;
  telegram_id?: string;
  ghi_chu?: string;
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
      <TableCell>{index + 1}</TableCell>
      <TableCell>{row.ma_cd}</TableCell>
      <TableCell>{row.ten_cd}</TableCell>
      <TableCell>{row.cp_so_huu}</TableCell>
      <TableCell>{row.ty_le_cp_so_huu}</TableCell>
      <TableCell>{row.cp_tham_du}</TableCell>
      <TableCell>{row.ty_le_cp_tham_du}</TableCell>
      <TableCell>{row.trang_thai}</TableCell>
      <TableCell>{row.telegram_id}</TableCell>
      <TableCell>{row.ghi_chu}</TableCell>
    </TableRow>
  );
}
