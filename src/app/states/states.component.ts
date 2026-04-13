import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

interface StatItem {
  title: string;
  icon: string;
  color: string;
  text: string;
  progressTarget: number;
  progress: number;
  isAnimating: boolean;
}

@Component({
  selector: 'app-states',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.css']
})
export class StatesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('statsSection', { static: true })
  private statsSection?: ElementRef<HTMLElement>;

  readonly radius = 94;
  readonly circumference = 2 * Math.PI * this.radius;

  readonly stats: StatItem[] = [
    {
      title: 'Buen Servicio',
      icon: 'fas fa-hand-holding-heart',
      color: 'var(--color-main2)',
      text: 'Excelencia y profesionalismo.',
      progressTarget: 100,
      progress: 0,
      isAnimating: false
    },
    {
      title: 'Apoyo Integral',
      icon: 'fas fa-users',
      color: 'var(--color-main2)',
      text: 'Acompañamiento completo de principio a fin.',
      progressTarget: 100,
      progress: 0,
      isAnimating: false
    },
    {
      title: 'Transparencia',
      icon: 'fas fa-shield-alt',
      color: 'var(--color-main2)',
      text: 'Honestidad y confianza en cada paso',
      progressTarget: 100,
      progress: 0,
      isAnimating: false
    }
  ];

  private visibilityObserver?: IntersectionObserver;
  private animationFrames: number[] = [];
  private animationTimers: number[] = [];

  ngAfterViewInit(): void {
    if (!this.statsSection?.nativeElement) return;

    this.visibilityObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.startAnimations();
          } else {
            this.resetStats();
          }
        });
      },
      { threshold: 0.35 }
    );

    this.visibilityObserver.observe(this.statsSection.nativeElement);
  }

  ngOnDestroy(): void {
    this.visibilityObserver?.disconnect();
    this.clearRunningAnimations();
  }

  getStrokeOffset(progress: number): number {
    return this.circumference * (1 - progress / 100);
  }

  private startAnimations(): void {
    this.clearRunningAnimations();
    
    this.stats.forEach((stat, index) => {
      stat.progress = 0;
      stat.isAnimating = true;
      
      const timerId = window.setTimeout(() => {
        this.animateStat(index);
      }, index * 200);
      this.animationTimers.push(timerId);
    });
  }

  private animateStat(index: number): void {
    const stat = this.stats[index];
    const durationMs = 1500;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = this.easeOutCubic(progress);

      stat.progress = stat.progressTarget * eased;

      if (progress < 1) {
        this.animationFrames.push(requestAnimationFrame(step));
      } else {
        stat.isAnimating = false;
      }
    };
    this.animationFrames.push(requestAnimationFrame(step));
  }

  private resetStats(): void {
    this.clearRunningAnimations();
    this.stats.forEach(stat => {
      stat.progress = 0;
      stat.isAnimating = false;
    });
  }

  private clearRunningAnimations(): void {
    this.animationFrames.forEach(id => cancelAnimationFrame(id));
    this.animationTimers.forEach(id => clearTimeout(id));
    this.animationFrames = [];
    this.animationTimers = [];
  }

  private easeOutCubic(value: number): number {
    return 1 - Math.pow(1 - value, 3);
  }
}