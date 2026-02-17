import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.css']
})
export class CursosComponent implements OnInit, OnDestroy, AfterViewInit {
  // 🌟 Cursos (carrusel)
  courses = [
    { image: 'https://www.isotools.us/wp-content/uploads/2024/06/Software-para-sistemas-de-gestion-de-calidad-que-caracteristicas-y-funcionalidades-debe-reunir.jpg', title: 'Calidad del Software - Sena', description: 'Curso en el Sena sobre la calidad del Software y las diferentes normas ISO', modalidad: 'Online' },
    { image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAMBwFp4blXgNy24gKGab6WDL8IiVktJNvgQ&s', title: 'Nube de AWS', description: 'Curso ofrecido por AWS para saber manejar su nube y poder elegir correctamente entre todos los servicios que ofrece', modalidad: 'Online' },
    { image: 'https://www.javeriana.edu.co/recursosdb/704339/6116923/Mesa%20de%20trabajo%2099%20copia%203.png/52cb4ae7-0b89-8087-1af3-e8ce7ed92796', title: 'Javeriana Territorio Emprendedor', description: 'Participé en el programa "Javeriana Territorio Emprendedor".', modalidad: 'Presencial' },
    { image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3Pw9vZvgrTOe4Z3OLIwdOjQqXmM5bgKz1Hw&s', title: 'Prompting Responsable - Microsoft', description: 'Curso de prompting responsable en IA, desarrollado por Microsoft y Founderz.', modalidad: 'Online' },
    { image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFmSHVHNeO1x6dCPXq5d1Fb_33f9UXdbaonw&s', title: 'Ingles B1 - American School Way', description: 'Hice un curso en American School Way donde alcance un nivel B1 en Ingles', modalidad: 'Presencial' },
    { image: 'https://www.ucatalunya.edu.co/img/blog/la-transformacion-digital.jpg', title: 'Transformación Digital - MIT', description: 'Curso de Transformación Digital para empresas, MIT Professional Education.', modalidad: 'Online' },
    { image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNCObqnzWneBa0iTZsC5rsLKuI9YbZPUBUKw&s', title: 'Integración de IA en Sitios Web', description: 'Integración de herramientas de IA en Sitios Web, como lo son chatbots, IA para análisis de datos y IA para análisis de imágenes', modalidad: 'Online' }
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
  constructor(private renderer: Renderer2) { }

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
    const c = this.courses.length;
    // when there are fewer courses than visible cards, just replicate to avoid blank space
    if (c <= v) {
      // duplicate courses enough times
      this.slides = [];
      while (this.slides.length < v * 3) {
        this.slides = this.slides.concat(this.courses);
      }
      this.currentIndex = 0;
      return;
    }

    const head = this.courses.slice(-v);
    const tail = this.courses.slice(0, v);
    this.slides = [...head, ...this.courses, ...tail];

    // start at first real slide (offset by head clones)
    this.currentIndex = v;
    // ensure no transition jump on setup
    this.updateTranslate(false);
  }

  onTransitionEnd(): void {
    const v = this.visibleCards;
    const c = this.courses.length;
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
}
