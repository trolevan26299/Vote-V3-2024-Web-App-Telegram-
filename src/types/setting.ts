export interface IQuestion {
  key?: string;
  noi_dung?: string;
  noi_dung_en?: string;
  ten_poll?: string;
  ten_poll_en?: string;
  dap_an?: IAnswer[];
  group?: string;
}

export interface IAnswer {
  id?: number;
  vi?: string;
  en?: string;
}

export interface IListPollHistorySendVote {
  key?: string;
  ten_poll?: string;
}
export interface IListSender {
  ma_cd?: string;
  ten_cd?: string;
  status?: string;
  cp_tham_du?: number;
}

export interface IHistorySendPoll {
  key?: string;
  ds_poll_id?: IListPollHistorySendVote[];
  gui_den?: IListSender[];
  is_active?: boolean;
  thoi_gian_gui?: string;
  thoi_gian_ket_thuc?: string;
  trang_thai?: string;
  groupQuestionSelect?: string;
}

export interface ISendPollStatusSuccess {
  key: string;
  keyQuestion: string;
  listUserSentSuccess: number[] | [];
}
