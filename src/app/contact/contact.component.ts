import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  // 🌟 Contacto
  contactMethods = [
    { icon: 'fas fa-envelope', title: 'Email', value: 'correo@marckpluss.com' },
    { icon: 'fas fa-phone', title: 'Teléfono', value: '+57 555 555 5555' },
    { icon: 'fas fa-map-marker-alt', title: 'Ubicación', value: 'Bogotá, Colombia' },
    { icon: 'fas fa-calendar', title: 'Disponibilidad', value: 'Lun - Vie, 9AM - 6PM' }
  ];

  socialLinks = [
    { icon: 'fab fa-whatsapp', url: '' },
    { icon: 'fab fa-instagram', url: '' },
    { icon: 'fab fa-tiktok', url: '' },
    { icon: 'fas fa-at', url: 'mailto:' },
  ];
}
