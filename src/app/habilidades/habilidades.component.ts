import { Component, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PaginatedResponse, Property } from 'src/app/core/models/domus.model';
import { DomusService } from '../core/service/domus.service';
import { enviroment } from 'src/environments/environment';
import { finalize } from 'rxjs/operators';
import { WhatsappService } from '../core/service/whatsapp.service';

const whatsappService = new WhatsappService()

@Component({
  selector: 'app-habilidades',
  templateUrl: './habilidades.component.html',
  styleUrls: ['./habilidades.component.css']
})
export class HabilidadesComponent implements AfterViewInit, OnDestroy {

  page = 1;
  pageSize = 6;

  get paginatedProperties(): Property[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProperties.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProperties.length / this.pageSize);
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
    }
  }

  enviarWhatsApp(property: Property) {
    whatsappService.sendPropertyDetails(property);
  }

  private resizeHandler: () => void;
  private observer: IntersectionObserver | null = null;

  // --- Propiedades de ejemplo para mostrar en tarjetas ---
  public properties: any = [];
  public isLoadingProperties = true;

  constructor(private el: ElementRef, private domusService: DomusService, private router: Router) {
    this.resizeHandler = this.debounce(() => this.equalizeCardHeights(), 120);
    this.domusService.getProperties()
      .pipe(finalize(() => this.isLoadingProperties = false))
      .subscribe({
        next: (response: PaginatedResponse<Property>) => {
          this.properties = response.data.map(p => ({ ...p, currentImageIndex: 0, images: [p.image1, p.image2, p.image3] }));
          setTimeout(() => this.equalizeCardHeights(), 0);
        },
        error: (error) => {
          console.error('Error al cargar inmuebles en habilidades:', error);
          this.properties = [];
        }
      });
  }

  // filtros del formulario
  public filters: any = {
    biz: 'VENTA', // VENTA | ALQUILER
    city: '',
    type: '',
    bedrooms: null,
    bathrooms: null,
    minPrice: null,
    maxPrice: null
  };

  // Estado del dropdown
  public isTypeDropdownOpen = false;
  public typeOptions = [
    { value: '', label: 'Cualquier tipo' },
    { value: 'APARTAMENTO', label: 'Apartamento' },
    { value: 'CASA', label: 'Casa' }
  ];

  get filteredProperties(): Property[] {
    return this.properties.filter((p: Property) => {
      // filtrar por tipo de negocio (venta/alquiler)
      if (this.filters.biz && p.biz !== this.filters.biz) return false;
      if (this.filters.city && p.city.toLowerCase().indexOf(this.filters.city.toLowerCase()) === -1) return false;
      if (this.filters.type && p.type !== this.filters.type) return false;
      if (this.filters.bedrooms && p.bedrooms !== +this.filters.bedrooms) return false;
      if (this.filters.bathrooms && p.bathrooms !== +this.filters.bathrooms) return false;
      if (this.filters.minPrice && Number(p.price) < +this.filters.minPrice) return false;
      if (this.filters.maxPrice && Number(p.price) > +this.filters.maxPrice) return false;
      return true;
    });
  }

  public setBiz(b: string) {
    this.filters.biz = b;
  }

  public toggleTypeDropdown() {
    this.isTypeDropdownOpen = !this.isTypeDropdownOpen;
  }

  public selectType(value: string) {
    this.filters.type = value;
    this.isTypeDropdownOpen = false;
  }

  public getTypeLabel() {
    const selected = this.typeOptions.find(opt => opt.value === this.filters.type);
    return selected ? selected.label : 'Cualquier tipo';
  }

  public resetFilters() {
    this.filters = { biz: this.filters.biz, city: '', type: '', bedrooms: null, bathrooms: null, minPrice: null, maxPrice: null };
    this.isTypeDropdownOpen = false;
  }

  // Navegación de imágenes en las tarjetas
  public nextImage(property: any, event: Event) {
    event.stopPropagation();
    if (property.images && property.images.length > 0) {
      property.currentImageIndex = (property.currentImageIndex + 1) % property.images.length;
    }
  }

  public prevImage(property: any, event: Event) {
    event.stopPropagation();
    if (property.images && property.images.length > 0) {
      property.currentImageIndex = (property.currentImageIndex - 1 + property.images.length) % property.images.length;
    }
  }

  public getCurrentImage(property: any): string {
    if (property.images && property.images.length > 0) {
      return property.images[property.currentImageIndex];
    }
    return '';
  }

  // Navegar a la vista de detalles de la propiedad
  public viewPropertyDetail(property: Property, event: Event): void {
    event.preventDefault();
    this.router.navigate(['/propiedad', property.codpro]);
  }

  ngAfterViewInit(): void {
    const cards = this.el.nativeElement.querySelectorAll('.card');

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.2 });

    cards.forEach((card: Element) => this.observer!.observe(card));

    // Equalize heights initially and when window resizes
    this.equalizeCardHeights();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    window.removeEventListener('resize', this.resizeHandler);
  }

  private equalizeCardHeights(): void {
    const grid: HTMLElement | null = this.el.nativeElement.querySelector('.skills-grid');
    if (!grid) return;

    const cards: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('.card');
    if (!cards || cards.length === 0) {
      grid.style.removeProperty('--card-height');
      return;
    }

    // Reset heights to allow natural measurement
    cards.forEach(c => c.style.height = 'auto');

    // Find the maximum height among cards (including margin/padding handled by offsetHeight)
    let max = 0;
    cards.forEach(c => {
      const h = c.offsetHeight;
      if (h > max) max = h;
    });

    // Apply the maximum height to the grid as a CSS variable so cards use it
    grid.style.setProperty('--card-height', `${max}px`);
  }

  private debounce(fn: () => void, wait = 100) {
    let t: any = null;
    return () => {
      clearTimeout(t);
      t = setTimeout(() => fn(), wait);
    };
  }
}
