import { Component, ElementRef, OnInit, OnDestroy, AfterViewInit, ViewChild, Renderer2, HostListener } from '@angular/core';

@Component({
  selector: 'app-aboutme',
  templateUrl: './aboutme.component.html',
  styleUrls: ['./aboutme.component.css']
})
export class AboutmeComponent implements OnInit, AfterViewInit, OnDestroy {
  isVisible = false;
  observer!: IntersectionObserver;
  @ViewChild('achievementsViewport', { static: false }) achievementsViewport!: ElementRef;
  @ViewChild('achievementsTrack', { static: false }) achievementsTrack!: ElementRef;
  @ViewChild('aboutContainer', { static: false }) aboutContainer!: ElementRef;
  @ViewChild('aboutLeft', { static: false }) aboutLeft!: ElementRef;
  @ViewChild('aboutRight', { static: false }) aboutRight!: ElementRef;
  private resizeTimeout: any;

  logros = [
    {
      icon: 'fas fa-hand-holding-heart',
      title: 'Buen Servicio',
      description: 'Excelencia y profesionalismo.'
    },
    {
      icon: 'fas fa-users',
      title: 'Apoyo Integral',
      description: 'Acompañamiento completo de principio a fin.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Transparencia',
      description: 'Honestidad y confianza en cada paso'
    },
    {
      icon: 'fas fa-headset',
      title: 'Seguimiento Permanente',
      description: 'Atención constante a tus necesidades.'
    },
    {
      icon: 'fas fa-lock',
      title: 'Garantía de Confianza',
      description: 'Protección y seguridad en cada transacción.'
    },
    {
      icon: 'fas fa-check-circle',
      title: 'Soluciones Efectivas',
      description: 'Resultados probados y cumplidos.'
    }
  ];

  // Duplicamos logros para crear efecto infinito en el carrusel
  get logrosDuplicados() {
    return [...this.logros, ...this.logros];
  }

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    // Activamos animación solo cuando la sección está visible
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.isVisible = true;   // activa animación
        } else {
          this.isVisible = false;  // pausa animación
        }
      });
    }, { threshold: 0.2 });

    this.observer.observe(this.el.nativeElement);
  }

  ngAfterViewInit() {
    // initial adjustment for desktop to avoid cutting cards
    setTimeout(() => this.adjustViewportHeight(), 50);
  }

  @HostListener('window:resize')
  onWindowResize() {
    // debounce resize
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.adjustViewportHeight(), 120);
  }

  private adjustViewportHeight() {
    try {
      const viewportEl = this.achievementsViewport?.nativeElement as HTMLElement | undefined;
      const trackEl = this.achievementsTrack?.nativeElement as HTMLElement | undefined;
      const aboutLeftEl = this.aboutLeft?.nativeElement as HTMLElement | undefined;
      const aboutRightEl = this.aboutRight?.nativeElement as HTMLElement | undefined;
      if (!viewportEl || !trackEl) return;

      // On desktop (where we use vertical scrolling) ensure viewport height matches tallest card
      const desktop = window.innerWidth >= 1024;
      if (!desktop) {
        // remove any explicit height on smaller screens
        this.renderer.removeStyle(viewportEl, 'height');
        if (aboutRightEl) this.renderer.removeStyle(aboutRightEl, 'height');
        return;
      }

      const cards = trackEl.querySelectorAll('.achievement-card');
      let maxH = 0;
      cards.forEach((c: Element) => {
        const el = c as HTMLElement;
        const h = el.offsetHeight;
        if (h > maxH) maxH = h;
      });

      // If we can measure left column, make right column height match it so the carousel
      // fills the component vertically and cards are fully visible.
      if (aboutLeftEl && aboutRightEl) {
        const leftH = aboutLeftEl.offsetHeight;
        if (leftH > 0) {
          this.renderer.setStyle(aboutRightEl, 'height', `${leftH}px`);
          // set viewport to match available height (subtract small gaps if needed)
          const finalH = leftH; // keep equal; CSS gap handled by internal layout
          this.renderer.setStyle(viewportEl, 'height', `${finalH}px`);
          return;
        }
      }

      if (maxH > 0) {
        // fallback: use tallest card height
        const finalH = maxH + 20;
        this.renderer.setStyle(viewportEl, 'height', `${finalH}px`);
      }
    } catch (err) {
      // fail silently
      console.warn('adjustViewportHeight error', err);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
