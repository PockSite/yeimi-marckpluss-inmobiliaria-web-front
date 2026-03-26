import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {

  constructor(private http: HttpClient) { }

  // 🌟 Contacto
  contactMethods = [
    { icon: 'fas fa-envelope', title: 'Email', value: 'marckpluss@gmail.com' },
    { icon: 'fas fa-phone', title: 'Teléfono', value: '+57 320 4795284' },
    { icon: 'fas fa-map-marker-alt', title: 'Ubicación', value: 'Bogotá, Colombia' }
  ];

  socialLinks = [
    { icon: 'fab fa-whatsapp', url: 'https://wa.me/573204795284', network: 'social-whatsapp' },
    { icon: 'fab fa-instagram', url: 'https://www.instagram.com/marckpluss/?hl=es', network: 'social-instagram' },
    { icon: 'fab fa-tiktok', url: 'https://www.tiktok.com/@inmueblesmarckpluss', network: 'social-tiktok' },
    { icon: 'fas fa-at', url: 'mailto:marckpluss@gmail.com', network: 'social-email-light' },
    { icon: 'fab fa-facebook', url: 'https://www.facebook.com/profile.php?id=100064359720558&locale=es_ES', network: 'social-email' }
  ];

  contactForm: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitMessage = '';
  submitType: 'success' | 'error' | '' = '';

  onSubmit(form: any): void {
    if (!form.valid || this.isSubmitting) {
      form.control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitMessage = '';
    this.submitType = '';

    const payload = {
      ...this.contactForm,
      _subject: `Nuevo mensaje web - ${this.contactForm.subject}`,
      _template: 'table',
      _captcha: 'false'
    };

    this.http.post('https://formsubmit.co/ajax/marckpluss@gmail.com', payload).subscribe({
      next: () => {
        this.submitType = 'success';
        this.submitMessage = 'Mensaje enviado con exito. Te responderemos pronto.';
        this.isSubmitting = false;
        form.resetForm();
      },
      error: (_error: HttpErrorResponse) => {
        this.submitType = 'error';
        this.submitMessage = 'No pudimos enviar el mensaje. Intenta nuevamente en unos minutos.';
        this.isSubmitting = false;
      }
    });
  }
}
