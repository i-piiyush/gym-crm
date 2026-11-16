export interface TrainerLeaveItem {
  id: string;
  date: string;
  type: "PAID" | "UNPAID";
  reason: string | null;
  locked: boolean;
}

export interface TrainerLeavesOverview {
  month: string;
  today: string;
  joinedDate: string;
  records: TrainerLeaveItem[];
}
