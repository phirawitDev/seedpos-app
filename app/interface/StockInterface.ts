import { StockType } from "@/generated/prisma";

export interface StockInterface {
  id: number;
  name: string;
  stock: number;
  history: {
    usersName: string;
  }[];
  stockMovement: {
    users: {
      id: number;
      name: string;
    };
  };
}
