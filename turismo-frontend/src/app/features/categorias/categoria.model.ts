// src/app/features/categorias/categoria.model.ts
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoriaDTO {
  nombre: string;
  descripcion: string;
  imagen: string;
  estado: boolean;
}