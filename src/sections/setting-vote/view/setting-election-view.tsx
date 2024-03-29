'use client';

import { Box, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import SendVoteElectionView from '../setting-election/send-vote';
import ResultElectionView from '../setting-election/result';
import SettingEleView from '../setting-election/setting';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function SettingElectionView() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          sx={{ width: '100%' }}
        >
          <Tab sx={{ width: '33%', maxWidth: '31%' }} label="Cấu Hình" {...a11yProps(0)} />
          <Tab sx={{ width: '33%', maxWidth: '31%' }} label="Gửi Bỏ Phiếu" {...a11yProps(1)} />
          <Tab sx={{ width: '33%', maxWidth: '31%' }} label="Kết Quả" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <SettingEleView />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <SendVoteElectionView />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <ResultElectionView />
      </CustomTabPanel>
    </Box>
  );
}
