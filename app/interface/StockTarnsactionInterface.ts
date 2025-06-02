import { StockType } from "@/generated/prisma";

export interface StockTarnsactionInterface {
  id: number;
  productId: number;
  quantity: number;
  type: StockType;
  createdAt: Date;
  note: string;
  users: {
    name: string;
  };
}
