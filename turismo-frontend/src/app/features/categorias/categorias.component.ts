// src/app/features/categorias/categorias.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriasService } from './categorias.service';
import { Categoria, CategoriaDTO } from './categoria.model';
import { PaginatedResponse } from '../../core/services/admin.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categoria.component.css']
})
export class CategoriasComponent implements OnInit {
  private categoriasService = inject(CategoriasService);
  private fb = inject(FormBuilder);
  
  categorias: Categoria[] = [];
  paginacion: PaginatedResponse<Categoria> | null = null;
  loading = true;
  currentPage = 1;
  searchTerm = '';
  
  categoriaForm: FormGroup;
  isModalOpen = false;
  isEditing = false;
  currentCategoriaId: number | null = null;
  
  constructor() {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      imagen: [''],
      estado: [true]
    });
  }
  
  ngOnInit() {
    this.loadCategorias();
  }
  
  loadCategorias(page: number = 1) {
    this.loading = true;
    this.currentPage = page;
    
    this.categoriasService.getCategorias(page, 10, this.searchTerm).subscribe({
      next: (data) => {
        this.paginacion = data;
        this.categorias = data.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.loading = false;
      }
    });
  }
  
  search() {
    this.loadCategorias(1);
  }
  
  openCreateModal() {
    this.isEditing = false;
    this.currentCategoriaId = null;
    this.categoriaForm.reset({estado: true});
    this.isModalOpen = true;
  }
  
  openEditModal(categoria: Categoria) {
    this.isEditing = true;
    this.currentCategoriaId = categoria.id;
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      imagen: categoria.imagen,
      estado: categoria.estado
    });
    this.isModalOpen = true;
  }
  
  closeModal() {
    this.isModalOpen = false;
  }
  
  saveCategoria() {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }
    
    const categoriaData: CategoriaDTO = this.categoriaForm.value;
    
    if (this.isEditing && this.currentCategoriaId) {
      this.categoriasService.updateCategoria(this.currentCategoriaId, categoriaData).subscribe({
        next: () => {
          this.loadCategorias(this.currentPage);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
        }
      });
    } else {
      this.categoriasService.createCategoria(categoriaData).subscribe({
        next: () => {
          this.loadCategorias(this.currentPage);
          this.closeModal();
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
        }
      });
    }
  }
  
  deleteCategoria(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.categoriasService.deleteCategoria(id).subscribe({
        next: () => {
          this.loadCategorias(this.currentPage);
        },
        error: (error) => {
          console.error('Error al eliminar categoría:', error);
        }
      });
    }
  }
  
  toggleEstado(categoria: Categoria) {
    this.categoriasService.toggleEstado(categoria.id, !categoria.estado).subscribe({
      next: () => {
        this.loadCategorias(this.currentPage);
      },
      error: (error) => {
        console.error('Error al cambiar estado de la categoría:', error);
      }
    });
  }
  
  changePage(page: number) {
    this.loadCategorias(page);
  }
  
  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
