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
