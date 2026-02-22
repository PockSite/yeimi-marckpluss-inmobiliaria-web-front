import { Component, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-habilidades',
  templateUrl: './habilidades.component.html',
  styleUrls: ['./habilidades.component.css']
})
export class HabilidadesComponent implements AfterViewInit, OnDestroy {

  private resizeHandler: () => void;
  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {
    this.resizeHandler = this.debounce(() => this.equalizeCardHeights(), 120);
  }

  // --- Propiedades de ejemplo para mostrar en tarjetas ---
  public properties: any[] = [
    {
      idpro: 3524764,
      address: 'Cra. 6A No. 50 - 36',
      city: 'Bogotá',
      neighborhood: 'Chapinero Alto',
      type: 'APARTAMENTO',
      biz: 'VENTA',
      area_cons: 66,
      bedrooms: 3,
      bathrooms: 2,
      price: 440000000,
      price_format: '440.000.000',
      images: [
        'https://s3-us-west-2.amazonaws.com/pictures.domus.la/inmobiliaria_183/5431_1_1771454244.jpg',
        'https://via.placeholder.com/640x420.png?text=Foto+2',
        'https://via.placeholder.com/640x420.png?text=Foto+3'
      ],
      currentImageIndex: 0,
      description: 'Apartamento en venta Chapinero Alto 66Mts., 2 habitaciones grandes, terraza pequeña cubierta, cocina integral y parqueadero cubierto.'
    },
    {
      idpro: 3524770,
      address: 'Av. 19 No. 95 - 20',
      city: 'Bogotá',
      neighborhood: 'Usaquén',
      type: 'APARTAMENTO',
      biz: 'VENTA',
      area_cons: 120,
      bedrooms: 4,
      bathrooms: 3,
      price: 1250000000,
      price_format: '1.250.000.000',
      images: [
        'https://via.placeholder.com/640x420.png?text=Propiedad+1',
        'https://via.placeholder.com/640x420.png?text=Foto+2',
        'https://via.placeholder.com/640x420.png?text=Foto+3',
        'https://via.placeholder.com/640x420.png?text=Foto+4'
      ],
      currentImageIndex: 0,
      description: 'Amplio apartamento con excelentes acabados, vigilancia y parqueadero doble.'
    },
    {
      idpro: 3524780,
      address: 'Cll 85 No. 12 - 45',
      city: 'Bogotá',
      neighborhood: 'Chico',
      type: 'APARTAMENTO',
      biz: 'ALQUILER',
      area_cons: 88,
      bedrooms: 2,
      bathrooms: 2,
      price: 3400000,
      price_format: '$3.400.000',
      images: [
        'https://via.placeholder.com/640x420.png?text=Propiedad+2',
        'https://via.placeholder.com/640x420.png?text=Foto+2'
      ],
      currentImageIndex: 0,
      description: 'Apartamento amoblado en el norte de la ciudad, cerca a zonas comerciales.'
    },
    {
      idpro: 3524764,
      address: 'Cra. 6A No. 50 - 36',
      city: 'Bogotá',
      neighborhood: 'Chapinero Alto',
      type: 'APARTAMENTO',
      biz: 'VENTA',
      area_cons: 66,
      bedrooms: 3,
      bathrooms: 2,
      price: 440000000,
      price_format: '440.000.000',
      images: [
        'https://s3-us-west-2.amazonaws.com/pictures.domus.la/inmobiliaria_183/5431_1_1771454244.jpg',
        'https://via.placeholder.com/640x420.png?text=Foto+2',
        'https://via.placeholder.com/640x420.png?text=Foto+3'
      ],
      currentImageIndex: 0,
      description: 'Apartamento en venta Chapinero Alto 66Mts., 2 habitaciones grandes, terraza pequeña cubierta, cocina integral y parqueadero cubierto.'
    },
    {
      idpro: 3524764,
      address: 'Cra. 6A No. 50 - 36',
      city: 'Bogotá',
      neighborhood: 'Chapinero Alto',
      type: 'APARTAMENTO',
      biz: 'VENTA',
      area_cons: 66,
      bedrooms: 3,
      bathrooms: 2,
      price: 440000000,
      price_format: '440.000.000',
      images: [
        'https://s3-us-west-2.amazonaws.com/pictures.domus.la/inmobiliaria_183/5431_1_1771454244.jpg',
        'https://via.placeholder.com/640x420.png?text=Foto+2',
        'https://via.placeholder.com/640x420.png?text=Foto+3'
      ],
      currentImageIndex: 0,
      description: 'Apartamento en venta Chapinero Alto 66Mts., 2 habitaciones grandes, terraza pequeña cubierta, cocina integral y parqueadero cubierto.'
    },
    {
      idpro: 3524764,
      address: 'Cra. 6A No. 50 - 36',
      city: 'Bogotá',
      neighborhood: 'Chapinero Alto',
      type: 'APARTAMENTO',
      biz: 'VENTA',
      area_cons: 66,
      bedrooms: 3,
      bathrooms: 2,
      price: 440000000,
      price_format: '440.000.000',
      images: [
        'https://s3-us-west-2.amazonaws.com/pictures.domus.la/inmobiliaria_183/5431_1_1771454244.jpg',
        'https://via.placeholder.com/640x420.png?text=Foto+2',
        'https://via.placeholder.com/640x420.png?text=Foto+3'
      ],
      currentImageIndex: 0,
      description: 'Apartamento en venta Chapinero Alto 66Mts., 2 habitaciones grandes, terraza pequeña cubierta, cocina integral y parqueadero cubierto.'
    },
    {
      idpro: 3524764,
      address: 'Cra. 6A No. 50 - 36',
      city: 'Bogotá',
      neighborhood: 'Chapinero Alto',
      type: 'APARTAMENTO',
      biz: 'VENTA',
      area_cons: 66,
      bedrooms: 3,
      bathrooms: 2,
      price: 440000000,
      price_format: '440.000.000',
      images: [
        'https://s3-us-west-2.amazonaws.com/pictures.domus.la/inmobiliaria_183/5431_1_1771454244.jpg',
        'https://via.placeholder.com/640x420.png?text=Foto+2',
        'https://via.placeholder.com/640x420.png?text=Foto+3'
      ],
      currentImageIndex: 0,
      description: 'Apartamento en venta Chapinero Alto 66Mts., 2 habitaciones grandes, terraza pequeña cubierta, cocina integral y parqueadero cubierto.'
    }
  ];

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

  get filteredProperties(): any[] {
    return this.properties.filter(p => {
      // filtrar por tipo de negocio (venta/alquiler)
      if (this.filters.biz && p.biz !== this.filters.biz) return false;
      if (this.filters.city && p.city.toLowerCase().indexOf(this.filters.city.toLowerCase()) === -1) return false;
      if (this.filters.type && p.type !== this.filters.type) return false;
      if (this.filters.bedrooms && p.bedrooms !== +this.filters.bedrooms) return false;
      if (this.filters.bathrooms && p.bathrooms !== +this.filters.bathrooms) return false;
      if (this.filters.minPrice && p.price < +this.filters.minPrice) return false;
      if (this.filters.maxPrice && p.price > +this.filters.maxPrice) return false;
      return true;
    });
  }

  public setBiz(b: string) {
    this.filters.biz = b;
  }

  public resetFilters() {
    this.filters = { biz: this.filters.biz, city: '', type: '', bedrooms: null, bathrooms: null, minPrice: null, maxPrice: null };
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
