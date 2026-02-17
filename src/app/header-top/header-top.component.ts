import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-header-top',
  templateUrl: './header-top.component.html',
  styleUrls: ['./header-top.component.css']
})
export class HeaderTopComponent implements OnInit {

  navItems = [
    { name: 'Inicio', url: '#', icon: 'fas fa-home' },
    { name: 'Sobre mi', url: '#sobre-mi', icon: 'fas fa-user' },
    { name: 'Cursos', url: '#cursos', icon: 'fas fa-graduation-cap' },
    { name: 'Proyectos', url: '#proyectos', icon: 'fas fa-briefcase' },
    { name: 'Contacto', url: '#contacto', icon: 'fas fa-envelope' }
  ];

  activeTab = 'Inicio';
  isMobile = false;

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.onWindowScroll(); // Check initial position
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  setActiveTab(name: string, event: Event) {
    event.preventDefault();
    this.activeTab = name;
    const item = this.navItems.find(i => i.name === name);
    if (item) {
      const id = item.url.replace('#', '');
      if (id === '') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }
    }
  }

  lastScrollTop = 0;
  isHidden = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;

    // Determine scroll direction
    if (st > this.lastScrollTop && st > 100) {
      // Scrolling Down
      this.isHidden = true;
    } else {
      // Scrolling Up
      this.isHidden = false;
    }
    this.lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling

    const sections = this.navItems.map(item => {
      const id = item.url.replace('#', '');
      // Handle 'Home' which might be top of page or specific section
      if (id === '') return document.body;
      return document.getElementById(id);
    });

    const scrollPosition = window.scrollY + 100; // Offset for header height

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section) {
        const offsetTop = section.offsetTop || 0; // Body might not have offsetTop in some contexts, usually 0
        if (scrollPosition >= offsetTop) {
          this.activeTab = this.navItems[i].name;
          break;
        }
      }
    }
  }
}
