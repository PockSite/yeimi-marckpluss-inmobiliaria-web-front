import { Component, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tech',
  templateUrl: './tech.component.html',
  styleUrls: ['./tech.component.css']
})
export class TechComponent implements AfterViewInit {



  // Valores de la empresa (usados por el template actualizado)
  companyValues = [
    {
      title: 'Buen Servicio',
      icon: 'fas fa-hand-holding-heart',
      color: 'var(--color-border)',
      text: 'Excelencia y profesionalismo.'
    },
    {
      title: 'Apoyo Familiar',
      icon: 'fas fa-users',
      color: 'var(--color-border)',
      text: 'Cercanía y trato personalizado.'
    },
    {
      title: 'Confianza',
      icon: 'fas fa-shield-alt',
      color: 'var(--color-border)',
      text: 'Procesos transparentes de principio a fin.'
    }
  ];

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    const icons = this.el.nativeElement.querySelectorAll('.tech-icon');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible'); // 🔄 vuelve a ocultarse si sale del viewport
        }
      });
    }, { threshold: 0.2 });

    icons.forEach((icon: Element) => observer.observe(icon));
  }
}
