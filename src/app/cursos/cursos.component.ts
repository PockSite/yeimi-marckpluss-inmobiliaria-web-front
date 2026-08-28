import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { DomusService } from '../core/service/domus.service';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit, OnDestroy, AfterViewInit {
  estate: any[] = [];
  isLoadingProperties = true;

  socialLinks = [
    { icon: 'fab fa-whatsapp', url: 'https://wa.me/573204795284', network: 'social-whatsapp' },
    { icon: 'fab fa-instagram', url: 'https://www.instagram.com/marckplussinmobiliaria?igsh=OTU4NWtsMWljaXB4&utm_source=qr', network: 'social-instagram' },
    { icon: 'fab fa-tiktok', url: 'https://www.tiktok.com/@inmueblesmarckpluss', network: 'social-tiktok' },
    { icon: 'fas fa-at', url: 'mailto:marckpluss@gmail.com', network: 'social-email-light' },
    { icon: 'fab fa-facebook', url: 'https://www.facebook.com/profile.php?id=100064359720558&locale=es_ES', network: 'social-email' }
  ];

  currentIndex = 0;
  visibleCards = 4;
  cardWidth = 0;
  slides: any[] = [];
  private carouselIntervalId: any;
  currentTranslate = 0;

  private touchStartX = 0;
  private touchEndX = 0;
  private isTransitioning = false;
  private isDragging = false;
  private dragStartX = 0;
  private dragDeltaX = 0;
  private startTranslatePx = 0;
  private autoplayWasRunning = false;
  supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
  private rafId: number | null = null;
  private pendingTranslate = 0;
  private globalMoveUnlisten: (() => void) | null = null;
  private globalUpUnlisten: (() => void) | null = null;
  private globalCancelUnlisten: (() => void) | null = null;
  private loadedImageUrls = new Set<string>();
  private failedImageUrls = new Set<string>();

  @ViewChild('track', { static: false }) trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef<HTMLDivElement>;

  constructor(private renderer: Renderer2, private domusService: DomusService) {
    domusService.getProperties().subscribe({
      next: (response) => {
        const properties = response.data.map(p => ({
          ...p,
          currentImageIndex: 0,
          images: [p.image1, p.image2, p.image3]
        }));
        this.estate = properties.map(p => ({
          codpro: p.codpro,
          image: p.image1 || p.image2 || p.image3 || '',
          name: p.address,
          price: +p.price,
          priceFormatted: p.price_format,
          description: p.description || 'Sin descripcion disponible.',
          location: `${p.city || ''}${p.zone ? ' - ' + p.zone : ''}`.trim(),
          area: p.area_lot ? `${p.area_lot} m²` : '',
          rooms: p.bedrooms,
          baths: p.bathrooms
        }));
        this.isLoadingProperties = false;
        // El carrusel se renderiza al ocultarse el loader: recalculamos tras el render
        setTimeout(() => {
          this.calculateCardWidth();
          this.setupSlides();
          this.updateTranslate(false);
        }, 0);
      },
      error: (error) => {
        console.error('Error al obtener propiedades:', error);
        this.estate = [];
        this.slides = [];
        this.isLoadingProperties = false;
      }
    });
  }

  ngOnInit(): void {
    this.updateVisibleCards();
    this.carouselIntervalId = setInterval(() => {
      this.nextSlide();
    }, 4000);
    this.supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calculateCardWidth();
      this.updateTranslate(false);
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
    }
  }

  nextSlide(): void {
    if (this.isLoadingProperties || this.slides.length === 0) return;
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex++;
    this.updateTranslate(true);
  }

  prevSlide(): void {
    if (this.isLoadingProperties || this.slides.length === 0) return;
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex--;
    this.updateTranslate(true);
  }

  onTouchStart(event: TouchEvent): void {
    if (this.supportsPointer) return;
    if (!this.isDragging) this.startDrag(event.touches[0].clientX);
  }

  onTouchMove(event: TouchEvent): void {
    if (this.supportsPointer) return;
    this.moveDrag(event.touches[0].clientX, event);
  }

  onTouchEnd(): void {
    if (this.supportsPointer) return;
    this.finishDrag();
  }

  onPointerDown(event: PointerEvent): void {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    if (!this.isDragging) this.startDrag(event.clientX);
    try {
      this.carouselRef?.nativeElement?.setPointerCapture(event.pointerId);
    } catch (e) {}
    if (!this.globalMoveUnlisten) {
      this.globalMoveUnlisten = this.renderer.listen('window', 'pointermove', (e: PointerEvent) => this.onPointerMove(e));
    }
    if (!this.globalUpUnlisten) {
      this.globalUpUnlisten = this.renderer.listen('window', 'pointerup', (e: PointerEvent) => this.onPointerUp(e));
    }
    if (!this.globalCancelUnlisten) {
      this.globalCancelUnlisten = this.renderer.listen('window', 'pointercancel', (e: PointerEvent) => this.onPointerUp(e));
    }
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    this.moveDrag(event.clientX, event as any);
  }

  onPointerUp(event: PointerEvent): void {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
    this.finishDrag();
    try {
      this.carouselRef?.nativeElement?.releasePointerCapture(event.pointerId);
    } catch (e) {}
    if (this.globalMoveUnlisten) { this.globalMoveUnlisten(); this.globalMoveUnlisten = null; }
    if (this.globalUpUnlisten) { this.globalUpUnlisten(); this.globalUpUnlisten = null; }
    if (this.globalCancelUnlisten) { this.globalCancelUnlisten(); this.globalCancelUnlisten = null; }
  }

  private startDrag(clientX: number) {
    if (!this.carouselRef) return;
    this.isDragging = true;
    this.touchStartX = clientX;
    this.dragStartX = clientX;
    this.startTranslatePx = this.currentTranslate;
    if (this.trackRef?.nativeElement) {
      this.trackRef.nativeElement.style.transition = 'none';
    }
    if (this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
      this.autoplayWasRunning = true;
      this.carouselIntervalId = null;
    }
  }

  private moveDrag(clientX: number, event?: Event) {
    if (!this.isDragging) return;
    this.dragDeltaX = clientX - this.dragStartX;
    const translate = this.startTranslatePx + this.dragDeltaX;
    this.pendingTranslate = translate;
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(() => {
        if (this.trackRef?.nativeElement) {
          this.trackRef.nativeElement.style.transform = `translateX(${this.pendingTranslate}px)`;
          this.currentTranslate = this.pendingTranslate;
        }
        this.rafId = null;
      });
    }
  }

  private finishDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const slideW = this.getSlideWidthPx() || 1;
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const translateNow = this.currentTranslate;
    const indexFloat = -translateNow / slideW;
    const nearest = Math.round(indexFloat);

    if (this.trackRef?.nativeElement) {
      this.trackRef.nativeElement.style.transition = '';
    }

    this.currentIndex = nearest;
    this.isTransitioning = true;
    this.updateTranslate(true);

    this.touchStartX = 0;
    this.touchEndX = 0;
    this.dragDeltaX = 0;

    if (this.autoplayWasRunning) {
      this.carouselIntervalId = setInterval(() => this.nextSlide(), 4000);
      this.autoplayWasRunning = false;
    }
  }

  @HostListener('window:resize')
  updateVisibleCards(): void {
    this.visibleCards = this.getVisibleCardsForWidth();
    this.calculateCardWidth();
    this.setupSlides();
    this.updateTranslate(false);
  }

  // Número de tarjetas visibles según el ancho de pantalla
  private getVisibleCardsForWidth(): number {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1280;
    if (width <= 560) return 1;
    if (width <= 860) return 2;
    if (width <= 1200) return 3;
    return 4;
  }

  // ─── PÚBLICO para usarlo en el template con [style.--carousel-gap] ───
  getGapForCurrentWidth(): number {
    const width = window.innerWidth;
    if (width <= 430) return 6;
    if (width <= 768) return 8;
    if (width <= 1024) return 10;
    return 14;
  }

  private calculateCardWidth(): void {
    if (this.carouselRef) {
      const carouselWidth = this.carouselRef.nativeElement.clientWidth;
      const gap = this.getGapForCurrentWidth();
      const n = this.visibleCards || 1;
      // n cards visibles + (n - 1) gaps entre ellas
      this.cardWidth = (carouselWidth - (n - 1) * gap) / n;
    }
  }

  // Devuelve el ancho de desplazamiento por paso: card + 1 gap
  private getSlideWidthPx(): number {
    const gap = this.getGapForCurrentWidth();
    if (this.cardWidth > 0) return this.cardWidth + gap;

    if (this.carouselRef) {
      const carouselWidth = this.carouselRef.nativeElement.clientWidth;
      const n = this.visibleCards || 1;
      return (carouselWidth - (n - 1) * gap) / n + gap;
    }
    return 0;
  }

  private setupSlides(): void {
    this.isTransitioning = false;
    const v = this.visibleCards;
    const c = this.estate.length;

    if (c === 0) {
      this.slides = [];
      this.currentIndex = 0;
      this.currentTranslate = 0;
      this.updateTranslate(false);
      return;
    }

    if (c <= v) {
      this.slides = [];
      while (this.slides.length < v * 3) {
        this.slides = this.slides.concat(this.estate);
      }
      this.currentIndex = 0;
      return;
    }

    const head = this.estate.slice(-v);
    const tail = this.estate.slice(0, v);
    this.slides = [...head, ...this.estate, ...tail];

    this.currentIndex = v;
    this.updateTranslate(false);
  }

  onTransitionEnd(): void {
    const v = this.visibleCards;
    const c = this.estate.length;

    if (c === 0) {
      this.isTransitioning = false;
      return;
    }

    if (this.currentIndex >= v + c) {
      this.currentIndex -= c;
      this.updateTranslate(false);
    }

    if (this.currentIndex < v) {
      this.currentIndex += c;
      this.updateTranslate(false);
    }

    this.isTransitioning = false;
  }

  private updateTranslate(animate = true): void {
    if (!this.trackRef || !this.carouselRef) return;
    const track = this.trackRef.nativeElement;

    if (this.slides.length === 0) {
      track.style.transform = 'translateX(0px)';
      this.currentTranslate = 0;
      return;
    }

    const px = -this.currentIndex * this.getSlideWidthPx();
    track.style.transition = animate ? '' : 'none';
    track.style.transform = `translateX(${px}px)`;
    this.currentTranslate = px;

    if (!animate) {
      void track.offsetWidth;
      setTimeout(() => track.style.transition = '', 20);
    }
  }

  onImageLoad(imageUrl?: string): void {
    if (!imageUrl) return;
    this.loadedImageUrls.add(imageUrl);
    this.failedImageUrls.delete(imageUrl);
  }

  onImageError(imageUrl?: string): void {
    if (!imageUrl) return;
    this.failedImageUrls.add(imageUrl);
    this.loadedImageUrls.add(imageUrl);
  }

  isImageLoading(imageUrl?: string): boolean {
    if (!imageUrl) return false;
    return !this.loadedImageUrls.has(imageUrl);
  }

  hasImageError(imageUrl?: string): boolean {
    if (!imageUrl) return true;
    return this.failedImageUrls.has(imageUrl);
  }
}