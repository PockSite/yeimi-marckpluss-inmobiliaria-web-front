import { Component, AfterViewInit, ElementRef } from '@angular/core';
import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  animations: [
    trigger('projectTransition', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0 })
        ], { optional: true }),

        query('.detail-content', [
          style({ opacity: 0, transform: 'translateY(20px)' })
        ], { optional: true }),

        query('img', [
          style({ opacity: 0, transform: 'scale(0.95)' })
        ], { optional: true }),

        query(':leave', [
          animate('200ms ease-out', style({ opacity: 0 }))
        ], { optional: true }),

        query('img', [
          animate('400ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
        ], { optional: true }),

        query('.detail-content', [
          animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true }),
      ])
    ])
  ]
})
export class ProjectsComponent implements AfterViewInit {
  projects = [
    {
      image: '/assets/images/gif_landing.gif',
      title: 'Sitio Web para Restaurante de Hamburguesas - Frontend',
      short: 'Landing Page para restaurant de Hamburguesas',
      description: 'Diseño y desarrollo de la interfaz de usuario para la plataforma web del restaurante El Pórtico, enfocada en una experiencia intuitiva, moderna y funcional. Se implementó una landing page atractiva, vistas dinámicas para la gestión de productos y pedidos, y un dashboard administrativo, priorizando usabilidad y claridad en la navegación. El frontend fue desarrollado con Angular, aplicando principios de UX/UI, componentes reutilizables y una arquitectura escalable.',
      features: ['Angular 15', 'Figma', 'HTML', 'CSS', 'TypeScript', 'Bootstrap', "UX/UI"],
      repoUrl: 'https://github.com/Hamburguesas-El-Portico/portico_angular',
      demoUrl: 'https://angular-el-portico-oficial.vercel.app'
    },
    {
      image: '/assets/images/backend.png',
      title: 'Sitio Web para Restaurante de Hamburguesas - Backend',
      short: 'Gestion de productos, pedidos, clientes, domiciliarios y operadores',
      description: 'Desarrollo del backend de la plataforma web full stack para El Pórtico, incluyendo autenticación de usuarios, seguridad, gestión de pedidos, CRUD de productos, integración con base de datos y lógica de negocio. Se implementaron servicios REST con Spring Boot, control de acceso, pruebas básicas y despliegue mediante Docker, garantizando escalabilidad y mantenimiento del sistema.',
      features: ['Spring Boot', 'Java', 'Aronium', 'PostgreSQL', 'Docker', 'JWT Auth', 'Charts.js', "REST API", "Vercel", "Postman"],
      repoUrl: 'https://github.com/Hamburguesas-El-Portico/portico_spring',
      demoUrl: '#'
    },
    {
      image: '/assets/images/parkeasyapp.jpeg',
      title: 'App movil de Buscar Parqueaderos',
      short: 'Encuentra y reserva parqueaderos',
      description: 'Desarrollo de una aplicación móvil híbrida para la localización de parqueaderos disponibles en tiempo real, que permite a los usuarios realizar reservas y pagos digitales. La aplicación integra mapas interactivos, notificaciones push y una interfaz intuitiva enfocada en la experiencia de usuario. Fue desarrollada en Android Studio con Kotlin y respaldada por Firebase para autenticación y base de datos en tiempo real, garantizando sincronización inmediata, escalabilidad y seguridad.',
      features: ['Android Studio', 'Kotlin', 'Firebase', 'OpenStreetMap', 'Flutter', 'Push Notifications'],
      repoUrl: 'https://github.com/Intro-CompuMovil/ParkEasy',
      demoUrl: 'https://www.youtube.com/shorts/cba7RciYqsI'
    },
    {
      image: '/assets/images/lionview.jpeg',
      title: 'Emprendimiento de venta de plataformas de streaming "LION VIEW"',
      short: 'Venta de plataformas de streaming',
      description: 'Plataforma de comercio electrónico para venta de plataformas de streaming con atención al cliente, gestión de inventario y panel administrativo completo; ya llevo mas de tres años en el mercado y he podido generar ingresos, mienstras aprendo de areas del emprendimiento como las finanzas, la atención al cliente y el marketing digital',
      features: ['Excel', 'WhatsApp', 'Instagram', 'Marketing'],
      repoUrl: 'https://wa.me/qr/O7UUJEMANOWPA1',
      demoUrl: 'https://www.instagram.com/lionview08/?hl=es'
    },
    {
      image: '/assets/images/sinapsis.png',
      title: 'Marketplace web para La Fundación Sinapsis',
      short: 'Marketing y automatización IA',
      description: 'Desarrollo y mantenimiento de un marketplace digital orientado a estudiantes con discapacidades mentales, utilizando WordPress y el plugin Elementor para el diseño y optimización del sitio web. Se integró TiendaNube como plataforma de comercio electrónico, habilitando una pasarela de compras completa y funcional. Además, se realizaron labores de marketing digital, análisis de estrategias de mercado para atraer clientes en línea, y creación de contenido, incluyendo la ejecución de talleres formativos dentro de la fundación, con enfoque social e inclusivo.',
      features: ['WordPress', 'Elementor', 'TiendaNube', 'Marketing', 'CRM Integration', 'DaVinci', 'Figma'],
      repoUrl: 'https://github.com/danieleon08/Proyecto-Fundacion-Sinapsis-WordPress-y-TiendaNube',
      demoUrl: 'https://funsinapsis.com'
    },
    {
      image: '/assets/images/taxis.jpg',
      title: 'Sistema Multiagente Taxis',
      short: 'Comunicación distribuida',
      description: 'Proyecto académico de un sistema multiagente y distribuido para la gestión de taxis, donde cada taxi opera como un agente independiente que se comunica con un servidor central mediante ZeroMQ. El sistema permite el intercambio de información en tiempo real sobre ubicación, estado y disponibilidad, aplicando algoritmos de optimización de rutas y toma de decisiones para mejorar la asignación de servicios y la eficiencia del sistema.',
      features: ['Python', 'ZeroMQ', 'Algoritmos IA', 'Sistemas Distribuidos'],
      repoUrl: 'https://github.com/danieleon08/Sistema-Distribuido-de-Taxis---ZeroMQ',
      demoUrl: '#'
    },
    {
      image: '/assets/images/aprendizajemaquina.jpeg',
      title: 'Implementación de Tecnicas de Aprendizaje de Maquina',
      short: 'Aprendizaje de Maquina',
      description: 'Seleccionar las librerías de trabajo en Python: tensorflow, keras o similares. Estas deben proveer implementaciones/funciones para las siguientes técnicas de aprendizaje automático: - Support Vector Machine (SVM) - Red neuronal multicapa - árbol de decisión ID3',
      features: ['Python', 'TensorFlow', 'Keras', 'Algoritmos IA', 'Sistemas Distribuidos'],
      repoUrl: 'https://github.com/danieleon08/Tecnicas-de-Aprendizaje-de-Maquina',
      demoUrl: '#'
    },
    {
      image: '/assets/images/cicla.jpg',
      title: 'WinBici - Servicio Web',
      short: 'Proyecto de sitio web para marcar recorrido en cicla',
      description: 'En este proyecto se utilizaron tecnologias como git page para el despliegue, spring boot para el backend, gitpod para el entorno de desarrollo y html, css, js para el frontend. El servicio web permite a los usuarios marcar recorridos en bicicleta y ver estadísticas de sus recorridos, a lo igual que ganar recompensas y poder compartirlo con amigos',
      features: ['Github Pages', 'SpringBoot', 'Gitpod', 'HTML', 'CSS', 'JS', 'Azure', 'github'],
      repoUrl: 'https://github.com/IngenieriaZ/WINBICI',
      demoUrl: '#'
    }
  ];

  selectedProject: any = this.projects[0];

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold: 0.2 } // Se activa cuando al menos 20% de la sección entra en pantalla
    );

    const sections = this.el.nativeElement.querySelectorAll('.project-card');
    sections.forEach((section: Element) => observer.observe(section));
  }

  selectProject(project: any): void {
    this.selectedProject = project;
  }

  goToProjectSection(project: any): void {
    this.selectedProject = project; // mantiene la lógica que ya tenías
    const section = document.getElementById("titulo-proyecto");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

}
