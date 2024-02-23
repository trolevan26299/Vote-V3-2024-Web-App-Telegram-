export type ISelectedAnswer = {
  key_question: string;
  key_history_send_poll: string;
  answer_select_id: string;
  time_voted: string;
  ma_cd?: string;
  group_question?: string;
};

export type IHistoryVoted = {
  key: string;
  ma_cd: string;
  detail: ISelectedAnswer[];
  cp_tham_du: number;
};

export type IDataQuestionSelect = {
  key: string;
  ten_poll: string;
};
