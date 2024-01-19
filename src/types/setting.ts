export interface IQuestion {
  key?: string;
  noi_dung?: string;
  noi_dung_en?: string;
  ten_poll?: string;
  ten_poll_en?: string;
  dap_an?: IAnswer[];
}

export interface IAnswer {
  id?: number;
  vi?: string;
  en?: string;
}

export interface IHistorySendPoll {
  key?: string;
  ds_poll_id?: string;
  gui_den?: string;
  is_active?: boolean;
  thoi_gian_gui?: string;
  thoi_gian_ket_Thuc?: string;
  trang_thai?: string;
}
