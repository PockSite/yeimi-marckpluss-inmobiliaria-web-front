import { Component, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-tech',
  templateUrl: './tech.component.html',
  styleUrls: ['./tech.component.css']
})
export class TechComponent implements AfterViewInit {

  // 🌟 Tecnologías organizadas por categorías
  techCategories = [
    {
      name: 'Frontend',
      technologies: [
        { name: 'Angular', icon: 'fab fa-angular', color: '#DD0031' },
        { name: 'React', icon: 'fab fa-react', color: '#61DAFB' },
        { name: 'TypeScript', icon: 'fab fa-js-square', color: '#3178C6' },
        { name: 'JavaScript', icon: 'fab fa-js', color: '#F7DF1E' },
        { name: 'Next.js', icon: 'fas fa-code', color: '#000000' },
        { name: 'TailwindCSS', icon: 'fas fa-wind', color: '#38B2AC' },
        { name: 'CSS3', icon: 'fab fa-css3-alt', color: '#1572B6' },
        { name: 'HTML5', icon: 'fab fa-html5', color: '#E34F26' },
        { name: 'Canva', icon: 'fas fa-paint-brush', color: '#00C4CC' },
        { name: 'Figma', icon: 'fab fa-figma', color: '#F24E1E' }
      ]
    },
    {
      name: 'Backend / Lenguajes',
      technologies: [
        { name: 'Node.js', icon: 'fab fa-node-js', color: '#339933' },
        { name: 'Spring Boot', icon: 'fas fa-leaf', color: '#6DB33F' },
        { name: 'Python', icon: 'fab fa-python', color: '#3776AB' },
        { name: 'C', icon: 'fas fa-copyright', color: '#A8B9CC' },
        { name: 'C++', icon: 'fas fa-code', color: '#00599C' },
        { name: 'Java', icon: 'fab fa-java', color: '#007396' },
        { name: 'R', icon: 'fas fa-chart-line', color: '#276DC3' },
        { name: 'Prolog', icon: 'fas fa-project-diagram', color: '#E61B23' }
      ]
    },
    {
      name: 'Dev Móvil',
      technologies: [
        { name: 'Kotlin', icon: 'fas fa-mobile-alt', color: '#7F52FF' },
        { name: 'Flutter', icon: 'fas fa-feather', color: '#02569B' },
        { name: 'Dart', icon: 'fas fa-code', color: '#0175C2' },
        { name: 'Android Studio', icon: 'fab fa-android', color: '#3DDC84' }
      ]
    },
    {
      name: 'Bases de Datos',
      technologies: [
        { name: 'MongoDB', icon: 'fas fa-leaf', color: '#47A248' },
        { name: 'PostgreSQL', icon: 'fas fa-database', color: '#336791' },
        { name: 'MySQL', icon: 'fas fa-database', color: '#4479A1' },
        { name: 'Firebase', icon: 'fas fa-fire', color: '#FFCA28' },
        { name: 'Oracle', icon: 'fas fa-database', color: '#F80000' },
        { name: 'Supabase', icon: 'fas fa-bolt', color: '#34b27b' }

      ]
    },
    {
      name: 'DevOps & Tools',
      technologies: [
        { name: 'Docker', icon: 'fab fa-docker', color: '#2496ED' },
        { name: 'Git', icon: 'fab fa-git-alt', color: '#F05032' },
        { name: 'GitHub', icon: 'fab fa-github', color: '#181717' },
        { name: 'AWS', icon: 'fab fa-aws', color: '#FF9900' },
        { name: 'Azure', icon: 'fas fa-cloud', color: '#0078D7' },
        { name: 'Linux', icon: 'fab fa-linux', color: '#FCC624' },
        { name: 'Bizagi', icon: 'fas fa-project-diagram', color: '#00AEEF' },
        { name: 'IntelliJ IDEA', icon: 'fas fa-lightbulb', color: '#000000' },
        { name: 'VS Code', icon: 'fas fa-code', color: '#007ACC' },
        { name: 'GNS3', icon: 'fas fa-network-wired', color: '#FF6F00' },
        { name: 'NetBeans', icon: 'fas fa-leaf', color: '#1B6AC6' },
        { name: 'Visual Paradigm', icon: 'fas fa-sitemap', color: '#E30022' },
        { name: 'VirtualBox', icon: 'fas fa-cube', color: '#183A61' }
      ]
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
