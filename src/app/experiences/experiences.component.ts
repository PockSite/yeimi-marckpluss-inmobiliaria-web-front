import { Component } from '@angular/core';

@Component({
  selector: 'app-experiences',
  templateUrl: './experiences.component.html',
  styleUrls: ['./experiences.component.css']
})
export class ExperiencesComponent {
  experiences = [
    {
      period: '2023 - Presente',
      position: 'Desarrollador Frontend Senior',
      company: 'TechSolutions Inc.',
      description: 'Liderazgo en el desarrollo de aplicaciones web modernas...',
      achievements: [
        'Mejoré el rendimiento de la aplicación en un 40%',
        'Implementé arquitectura de microfrontends',
        'Mentoría a 3 desarrolladores junior'
      ]
    },
    {
      period: '2022 - 2023',
      position: 'Desarrollador Full Stack',
      company: 'Digital Agency Pro',
      description: 'Desarrollo de soluciones completas para clientes corporativos.',
      achievements: [
        'Desarrollé 12+ proyectos exitosos',
        'Integración con APIs y sistemas de pago',
        'Implementación de CI/CD con Docker'
      ]
    }
  ];
}
