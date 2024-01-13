import { SxProps, Theme } from '@mui/material';

export const styles: { [key: string]: SxProps<Theme> } = {
  box_btn_vote: {
    width: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: { xs: 1, md: 5 },
    marginTop: { xs: '5%', md: '10%' },
  },
  btn_vote: {
    width: '47%',
    padding: { xs: '10px', md: '20px 80px' },
  },

  box_stack_info: {
    height: { md: 1 },
    borderRadius: 2,
    position: 'relative',
    color: 'primary.darker',
    backgroundColor: 'common.white',
  },
  grid_box: {
    textAlign: 'left',
    marginTop: '10px',
    paddingLeft: { xs: '10px', md: '0px' },
  },
  box_img: {
    p: { xs: 5, md: 3 },
    maxWidth: 360,
    mx: 'auto',
  },
};
