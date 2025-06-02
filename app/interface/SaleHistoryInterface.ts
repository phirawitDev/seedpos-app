export interface SaleHistoryInterface {
  createdAt: Date;
  id: number;
  note: string;
  paymentType: string;
  saleType: string;
  slipImg: string;
  status: string;
  total: number;
  users: {
    id: number;
    name: string;
  };
}
