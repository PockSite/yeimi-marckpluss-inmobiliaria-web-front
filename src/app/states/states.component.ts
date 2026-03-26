import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

interface StatItem {
  title: string;
  subtitle: string;
  target: number;
  unit: string;
  progressTarget: number;
  displayValue: number;
  progress: number;
  isAnimating: boolean;
}

@Component({
  selector: 'app-states',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.css']
})
export class StatesComponent {
  @ViewChild('statsSection', { static: true })
  private statsSection?: ElementRef<HTMLElement>;

  readonly radius = 94;
  readonly circumference = 2 * Math.PI * this.radius;

  readonly stats: StatItem[] = [
    {
      title: 'Clientes satisfechos',
      subtitle: 'Familias que hoy ya disfrutan de su nuevo espacio.',
      target: 220,
      unit: 'Clientes satisfechos',
      progressTarget: 99,
      displayValue: 0,
      progress: 0,
      isAnimating: false
    },
    {
      title: 'Inmuebles disponibles',
      subtitle: 'Opciones activas para compra, arriendo e inversion.',
      target: 30,
      unit: '# Inmuebles',
      progressTarget: 99,
      displayValue: 0,
      progress: 0,
      isAnimating: false
    },
    {
      title: 'Hectareas vendidas',
      subtitle: 'Terrenos comercializados en proyectos urbanos y rurales.',
      target: 1230,
      unit: 'Hectáreas vendidas',
      progressTarget: 99,
      displayValue: 0,
      progress: 0,
      isAnimating: false
    }
  ];

  private visibilityObserver?: IntersectionObserver;
  private animationFrames: number[] = [];
  private animationTimers: number[] = [];

  ngAfterViewInit(): void {
    if (!this.statsSection?.nativeElement) {
      return;
    }

    this.visibilityObserver = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.startAnimations();
          } else {
            this.resetStats();
          }
        }
      },
      {
        threshold: 0.35
      }
    );

    this.visibilityObserver.observe(this.statsSection.nativeElement);
  }

  ngOnDestroy(): void {
    this.visibilityObserver?.disconnect();
    this.clearRunningAnimations();
  }

  formatValue(value: number): string {
    return new Intl.NumberFormat('es-CO').format(value);
  }

  getStrokeOffset(progress: number): number {
    return this.circumference * (1 - progress / 100);
  }

  private startAnimations(): void {
    this.clearRunningAnimations();

    this.stats.forEach(stat => {
      stat.displayValue = 0;
      stat.progress = 0;
      stat.isAnimating = true;
    });

    this.stats.forEach((_, index) => {
      const timerId = window.setTimeout(() => {
        this.animateStat(index);
      }, index * 150);

      this.animationTimers.push(timerId);
    });
  }

  private animateStat(index: number): void {
    const stat = this.stats[index];
    if (!stat) {
      return;
    }

    const durationMs = 1500;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = this.easeOutCubic(progress);

      stat.displayValue = Math.round(stat.target * eased);
      stat.progress = stat.progressTarget * eased;

      if (progress < 1) {
        const frameId = requestAnimationFrame(step);
        this.animationFrames.push(frameId);
        return;
      }

      stat.displayValue = stat.target;
      stat.progress = stat.progressTarget;
      stat.isAnimating = false;
    };

    const firstFrameId = requestAnimationFrame(step);
    this.animationFrames.push(firstFrameId);
  }

  private resetStats(): void {
    this.clearRunningAnimations();

    this.stats.forEach(stat => {
      stat.displayValue = 0;
      stat.progress = 0;
      stat.isAnimating = false;
    });
  }

  private clearRunningAnimations(): void {
    this.animationFrames.forEach(frameId => cancelAnimationFrame(frameId));
    this.animationFrames = [];

    this.animationTimers.forEach(timerId => window.clearTimeout(timerId));
    this.animationTimers = [];
  }

  private easeOutCubic(value: number): number {
    return 1 - Math.pow(1 - value, 3);
  }

}
