import { TableBody, TableCell, TableRow, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import { get, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import Scrollbar from 'src/components/scrollbar';
import { TableHeadCustom } from 'src/components/table';
import { FIREBASE_COLLECTION } from '../../../constant/firebase_collection.constant';
import { database } from '../../../firebase/firebase.config';

export default function QuestionAndAnswerView() {
  const tableLabels = [
    { id: 'index', label: 'STT', width: '5%' },
    { id: 'content', label: 'Nội dung', width: '60%' },
    { id: 'sender_code', label: 'Mã CĐ', width: '10%' },
    { id: 'sender_name', label: 'Tên CĐ', width: '10%' },
    { id: 'time', label: 'Thời gian gửi', width: '15%' },
  ];
  const [questions, setQuestions] = useState<any[]>([]);
  useEffect(() => {
    const userRef = ref(database, FIREBASE_COLLECTION.QA);
    const fetchData = async () => {
      try {
        const snapshot = await get(userRef);
        const ls_questions: any[] = [];
        console.log('snapshot', snapshot.val());

        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const { key } = childSnapshot;
            if (data) {
              ls_questions.push({ ...data, key });
            }
          });
          setQuestions(ls_questions);
          console.groupEnd();
        } else {
          console.log('No Data');
        }
      } catch (error) {
        console.error('Error when get data :', error);
      }
    };
    fetchData();
  }, []);
  return (
    <Box className="list_question" sx={{ marginTop: '30px' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Danh sách câu hỏi
      </Typography>
      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 640 }}>
            <TableHeadCustom headLabel={tableLabels} />
            <TableBody>
              {questions.map((row, index) => (
                <TableRow key={row.key}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell align="left">{row?.content}</TableCell>
                  <TableCell align="left">{row?.user?.ma_cd}</TableCell>
                  <TableCell align="left">{row?.user?.ten_cd}</TableCell>
                  <TableCell align="left">{row?.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Box>
  );
}
