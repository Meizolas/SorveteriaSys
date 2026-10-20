export type DemoProduct = {
  id: number; name: string; category: string; sku: string; price: number;
  stock: number; minimum: number; color: string; active: boolean;
};

export const demoProducts: DemoProduct[] = [
  { id: 1, name: 'Casquinha Tradicional', category: 'Sorvetes', sku: 'SOR-001', price: 8.5, stock: 42, minimum: 15, color: '#f2b56b', active: true },
  { id: 2, name: 'Copo 300 ml', category: 'Sorvetes', sku: 'SOR-002', price: 14, stock: 28, minimum: 10, color: '#d7a1e8', active: true },
  { id: 3, name: 'Sundae Chocolate', category: 'Especiais', sku: 'ESP-001', price: 18.9, stock: 8, minimum: 10, color: '#8b5a46', active: true },
  { id: 4, name: 'Milk-shake Morango', category: 'Bebidas', sku: 'BEB-001', price: 21.5, stock: 16, minimum: 8, color: '#ef8e9b', active: true },
  { id: 5, name: 'Picolé de Frutas', category: 'Picolés', sku: 'PIC-001', price: 6, stock: 55, minimum: 20, color: '#f3cf55', active: true },
  { id: 6, name: 'Açaí 500 ml', category: 'Açaí', sku: 'ACA-001', price: 24.9, stock: 6, minimum: 10, color: '#694077', active: true },
  { id: 7, name: 'Água Mineral', category: 'Bebidas', sku: 'BEB-002', price: 4.5, stock: 36, minimum: 12, color: '#77b8de', active: true },
  { id: 8, name: 'Banana Split', category: 'Especiais', sku: 'ESP-002', price: 27.9, stock: 12, minimum: 5, color: '#e8c45d', active: false }
];

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
