import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { DomusService } from '../core/service/domus.service';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit, OnDestroy, AfterViewInit {
  // 🌟 Datos de ejemplo: ahora representan inmuebles (puedes editar estos objetos)
  estate = [
    {
      image: 'https://images.unsplash.com/photo-1560184897-e8a8f7f2c9b2?w=1200&q=80&auto=format&fit=crop',
      name: 'Casa Modernista en Chapinero',
      price: 8312500,
      priceFormatted: '$ 8,312,500',
      description: 'Amplia casa de 3 habitaciones con acabados de lujo, patio interno y garaje para 2 vehículos. Ideal para familias.',
      location: 'Chapinero, Bogotá',
      area: '886 sqft',
      rooms: 3,
      baths: 2,
      
    },
    {
      image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80&auto=format&fit=crop',
      name: 'Apartamento con vista al río',
      price: 13512002,
      priceFormatted: '$ 13,512,002',
      description: 'Apartamento moderno con balcón, 2 habitaciones, cocina abierta y parqueadero privado.',
      location: 'Barranquilla - Centro',
      area: '120 m²',
      rooms: 2,
      baths: 2,
      
    },
    {
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&auto=format&fit=crop',
      name: 'Casa en la montaña',
      price: 6805,
      priceFormatted: '$ 6,805',
      description: 'Finca pequeña con vista panorámica, 2 habitaciones y amplia zona verde. Perfecta para descanso.',
      location: 'Medellín - Alto de las Palmas',
      area: '1500 m²',
      rooms: 2,
      baths: 1,
      
    },
    {
      image: 'https://images.unsplash.com/photo-1598928506311-5c1a45b9d3e9?w=1200&q=80&auto=format&fit=crop',
      name: 'Loft céntrico',
      price: 420000,
      priceFormatted: '$ 420,000',
      description: 'Loft de un solo ambiente, ideal para profesionales, con acabados minimalistas y buena iluminación natural.',
      location: 'Cali - Zona G',
      area: '55 m²',
      rooms: 1,
      baths: 1,
      
    },
    {
      image: 'https://images.unsplash.com/photo-1600585154343-6c8a8b9e3d7b?w=1200&q=80&auto=format&fit=crop',
      name: 'Departamento de lujo',
      price: 2150000,
      priceFormatted: '$ 2,150,000',
      description: 'Departamento con 3 dormitorios, 2 baños, cocina equipada y terraza con asador.',
      location: 'Santa Marta - Rodadero',
      area: '140 m²',
      rooms: 3,
      baths: 2,
      
    }
  ];

  currentIndex = 0;
  visibleCards = 3; // 🌟 número de tarjetas visibles (depende del ancho de pantalla)
  slides: any[] = []; // includes clones for infinite looping
  private carouselIntervalId: any;
  currentTranslate = 0; // px translate for the track

  // Variables para swipe
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

  @ViewChild('track', { static: false }) trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('carousel', { static: false }) carouselRef!: ElementRef<HTMLDivElement>;
  constructor(private renderer: Renderer2, private domusService: DomusService) {
    domusService.getProperties().subscribe({
      next: (response) => {
        console.log('Propiedades obtenidas:', response);
      },
      error: (error) => {
        console.error('Error al obtener propiedades:', error);
      }
    });
   }

  ngOnInit(): void {
    this.updateVisibleCards(); // ajustar al iniciar (this will setup slides)

    // 🌟 Movimiento automático del carrusel
    this.carouselIntervalId = setInterval(() => {
      this.nextSlide();
    }, 4000);
    // prefer pointer events if present
    this.supportsPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
  }

  ngAfterViewInit(): void {
    // ensure track has no jumping animation at setup
    // if slides are already setup, set px translate
    setTimeout(() => this.updateTranslate(false), 0);
  }

  ngOnDestroy(): void {
    if (this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
    }
  }

  // 🔥 Navegación del carrusel
  nextSlide(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex++;
    this.updateTranslate(true);
  }

  prevSlide(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex--;
    this.updateTranslate(true);
  }

  // 📱 Swipe en móviles
  onTouchStart(event: TouchEvent): void {
    if (this.supportsPointer) return; // prefer pointer handlers when supported
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
    // capture pointer on the carousel to ensure move/up still arrive when pointer leaves
    try {
      this.carouselRef?.nativeElement?.setPointerCapture(event.pointerId);
    } catch (e) {
      // ignore if not supported or element removed
    }
    // attach global listeners so we don't lose move/up when pointer leaves the element
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
    } catch (e) {
      // ignore
    }
    // remove global listeners
    if (this.globalMoveUnlisten) {
      this.globalMoveUnlisten();
      this.globalMoveUnlisten = null;
    }
    if (this.globalUpUnlisten) {
      this.globalUpUnlisten();
      this.globalUpUnlisten = null;
    }
    if (this.globalCancelUnlisten) {
      this.globalCancelUnlisten();
      this.globalCancelUnlisten = null;
    }
  }

  private startDrag(clientX: number) {
    if (!this.carouselRef) return;
    this.isDragging = true;
    this.touchStartX = clientX;
    this.dragStartX = clientX;
    // use the current translate as starting point (keeps consistent with currentTransform)
    this.startTranslatePx = this.currentTranslate;
    if (this.trackRef && this.trackRef.nativeElement) {
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
    // rely on CSS `touch-action` to avoid vertical scroll; don't call preventDefault here
    // because many browsers make touch listeners passive which causes preventDefault to fail
    const translate = this.startTranslatePx + this.dragDeltaX;
    this.pendingTranslate = translate;
    if (this.rafId == null) {
      this.rafId = requestAnimationFrame(() => {
        if (this.trackRef && this.trackRef.nativeElement) {
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

    // compute nearest slide index from currentTranslate so touch snapping works reliably
    const slideW = this.getSlideWidthPx() || 1;
    // ensure any pending RAF applied
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const translateNow = this.currentTranslate;
    // index as a float (negative translate corresponds to positive index)
    const indexFloat = -translateNow / slideW;
    const nearest = Math.round(indexFloat);

    // restore transition for animated snap
    if (this.trackRef && this.trackRef.nativeElement) {
      this.trackRef.nativeElement.style.transition = '';
    }

    // snap to nearest index (will trigger onTransitionEnd to handle clones)
    this.currentIndex = nearest;
    this.isTransitioning = true;
    this.updateTranslate(true);

    // reset drag deltas
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.dragDeltaX = 0;

    // resume autoplay if it was running
    if (this.autoplayWasRunning) {
      this.carouselIntervalId = setInterval(() => {
        this.nextSlide();
      }, 4000);
      this.autoplayWasRunning = false;
    }
  }

  // 📏 Ajustar visibleCards según tamaño de pantalla
  @HostListener('window:resize')
  updateVisibleCards(): void {
    if (window.innerWidth < 768) {
      this.visibleCards = 1;
    } else if (window.innerWidth < 1024) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 3;
    }
    // recreate slides (with clones) when visible count changes
    this.setupSlides();
  }

  private getSlideWidthPx(): number {
    // Prefer precise slide width from the first card to account for margins and responsive CSS
    if (this.trackRef && this.trackRef.nativeElement) {
      const first = this.trackRef.nativeElement.querySelector('.card') as HTMLElement | null;
      if (first) {
        const style = window.getComputedStyle(first);
        const marginLeft = parseFloat(style.marginLeft || '0');
        const marginRight = parseFloat(style.marginRight || '0');
        return first.offsetWidth + marginLeft + marginRight;
      }
    }

    if (!this.carouselRef) return 0;
    const carouselWidth = this.carouselRef.nativeElement.clientWidth;
    return carouselWidth / this.visibleCards;
  }

  private setupSlides(): void {
    const v = this.visibleCards;
    const c = this.estate.length;
    // when there are fewer courses than visible cards, just replicate to avoid blank space
    if (c <= v) {
      // duplicate courses enough times
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

    // start at first real slide (offset by head clones)
    this.currentIndex = v;
    // ensure no transition jump on setup
    this.updateTranslate(false);
  }

  onTransitionEnd(): void {
    const v = this.visibleCards;
    const c = this.estate.length;
    // if moved past the real slides on the right
    if (this.currentIndex >= v + c) {
      // jump back by removing c
      this.currentIndex -= c;
      this.updateTranslate(false);
    }

    // if moved into the left clones
    if (this.currentIndex < v) {
      this.currentIndex += c;
      this.updateTranslate(false);
    }

    // allow next navigation
    this.isTransitioning = false;
  }

  private disableTransitionTemporarily(): void {
    // when we need to jump without animation, temporarily remove transition on track
    if (!this.trackRef) return;
    const track = this.trackRef.nativeElement;
    track.style.transition = 'none';
    // force reflow
    void track.offsetWidth;
    // restore transition after a short delay (match CSS transition time)
    setTimeout(() => {
      track.style.transition = '';
    }, 50);
  }

  private updateTranslate(animate = true): void {
    if (!this.trackRef || !this.carouselRef) return;
    const track = this.trackRef.nativeElement;
    const px = -this.currentIndex * this.getSlideWidthPx();
    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = '';
    }
    track.style.transform = `translateX(${px}px)`;
    this.currentTranslate = px;
    // force reflow then restore transition if we disabled it earlier
    if (!animate) {
      void track.offsetWidth;
      setTimeout(() => track.style.transition = '', 20);
    }
  }

  // favorites removed
}
