export interface SaleDetailInterface {
  id: number;
  customerName: string;
  userName: string;
  total: number;
  note: string;
  saleType: string;
  paymentType: string;
  createdAt: Date;
  slipImg: string;
  status: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  };
}
