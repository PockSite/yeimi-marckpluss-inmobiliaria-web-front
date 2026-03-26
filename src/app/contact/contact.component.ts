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
    { icon: 'fas fa-phone', title: 'Teléfono', value: '+57 320 4795284' },
    { icon: 'fas fa-map-marker-alt', title: 'Ubicación', value: 'Bogotá, Colombia' }
  ];

  socialLinks = [
    { icon: 'fab fa-whatsapp', url: 'https://wa.me/573204795284', network: 'social-whatsapp' },
    { icon: 'fab fa-instagram', url: 'https://www.instagram.com/marckpluss/?hl=es', network: 'social-instagram' },
    { icon: 'fab fa-tiktok', url: 'https://www.tiktok.com/@inmueblesmarckpluss', network: 'social-tiktok' },
    { icon: 'fas fa-at', url: 'mailto:correo@marckpluss.com', network: 'social-email-light' },
    { icon: 'fab fa-facebook', url: 'https://www.facebook.com/profile.php?id=100064359720558&locale=es_ES', network: 'social-email' }
  ];
}
