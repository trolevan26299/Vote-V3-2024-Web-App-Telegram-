export interface IQuestion {
  noi_dung?: string;
  noi_dung_en?: string;
  ten_poll?: string;
  ten_poll_en?: string;
  dap_an?: IAnswer[];
}

export interface IAnswer {
  vi?: string;
  en?: string;
}
