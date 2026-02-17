import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showTopHeader: boolean = true;
  layoutConSidebar: boolean = false;
  isMobile: boolean = window.innerWidth <= 1024;
  sidebarOpen: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isMobile) {
      // en celular no aplica scroll effect
      this.showTopHeader = true;
      this.layoutConSidebar = false;
      return;
    }

    const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const vh = window.innerHeight;
    const threshold1 = vh * 0.5;
    const threshold2 = vh * 1.2;

    if (scrollY < threshold1) {
      this.showTopHeader = true;
      this.layoutConSidebar = false;
    } else if (scrollY >= threshold1 && scrollY <= threshold2) {
      this.showTopHeader = false;
      this.layoutConSidebar = true;
    } else if (scrollY > threshold2) {
      this.showTopHeader = true;
      this.layoutConSidebar = false;
    }
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
