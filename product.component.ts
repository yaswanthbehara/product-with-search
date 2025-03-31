import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product',
  imports: [FormsModule, CommonModule],
  standalone: true,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';
  newProduct: any = { name: '', price: null, description: '' };
  editingProduct: any = null;
  errorMessage: string = '';
  isLoading: boolean = false;
  private apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data; // Sync with filtered list
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load products. Please check if json-server is running.';
        this.isLoading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  addProduct(): void {
    if (!this.newProduct.name || this.newProduct.price === null) {
      this.errorMessage = 'Name and price are required';
      return;
    }

    this.isLoading = true;
    this.http.post<any>(this.apiUrl, this.newProduct).subscribe({
      next: (data) => {
        this.products.push(data);
        this.filteredProducts = [...this.products];
        this.newProduct = { name: '', price: null, description: '' };
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to add product';
        this.isLoading = false;
        console.error('Error adding product:', err);
      }
    });
  }

  editProduct(product: any): void {
    this.editingProduct = { ...product };
  }

  updateProduct(): void {
    this.isLoading = true;
    this.http.put<any>(`${this.apiUrl}/${this.editingProduct.id}`, this.editingProduct)
      .subscribe({
        next: () => {
          this.loadProducts();
          this.editingProduct = null;
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to update product';
          this.isLoading = false;
          console.error('Error updating product:', err);
        }
      });
  }

  deleteProduct(id: string): void {
    this.isLoading = true;
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.products = this.products.filter(product => product.id !== id);
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete product';
        this.isLoading = false;
        console.error('Error deleting product:', err);
      }
    });
  }

  cancelEdit(): void {
    this.editingProduct = null;
  }

  searchProducts(): void {
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // 🔹 **Fixing the trackBy error**
  trackById(index: number, product: any): string {
    return product.id;
  }
}
