export interface PorductsInterface {
  id: number;
  name: string;
  categoryId: number;
  costPrice: number;
  salePrice: number;
  stock: number;
  restock: number;
  imageUrl: string;
  category: {
    id: number;
    name: string;
  };
}
