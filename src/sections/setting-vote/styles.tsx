import { SxProps, Theme } from '@mui/material';

export const styles: { [key: string]: SxProps<Theme> } = {
  button_add: {
    backgroundColor: '#22c55e',
    color: 'white',
    '&:hover': {
      backgroundColor: 'darkgreen',
    },
    height: '33px',
    '&.Mui-disabled': {
      background: '#eaeaea',
      color: '#c0c0c0',
    },
    width: '60px !important',
  },
  button_remove: {
    flex: 'none',
    marginLeft: '10px',
    backgroundColor: '#ff3030',
    color: 'white',
    '&:hover': {
      backgroundColor: 'darkred',
    },
    height: '33px',
    minWidth: '30px !important',
  },
  box_answer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '20px',
    marginTop: '10px',
  },
  title_answer: {
    width: '15%',
    mt: '3%',
    fontSize: '17px',
    fontWeight: 600,
  },
  box_question: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '20px',
  },
  box_name_content: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '20px',
    mb: '15px',
  },
  box_form_setting_vote_setting: {
    padding: '20px',
    borderRadius: '10px',
    minHeight: '400px',
  },
  box_answer_result: {
    padding: '10px',
    borderRadius: '10px',
    maxHeight: '110px',
    minHeight: '110px',
    overflowY: 'auto',
    width: '100%',
  },

  title_form_setting: {
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: 600,
    paddingBottom: '20px',
  },
  box_info_total: {
    color: '#000',
    marginTop: '10px',
    padding: '10px',
    borderRadius: '10px',
    width: '35%',
  },
};
