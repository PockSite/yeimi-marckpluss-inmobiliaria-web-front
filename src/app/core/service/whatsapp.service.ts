import { Injectable } from '@angular/core';
import { enviroment } from 'src/environments/environment';
import { Property } from '../models/domus.model';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  whatsappNumber: string;

  constructor() {
    this.whatsappNumber = enviroment.whatsappNumber;
   }

   sendMessage(message: string): void {
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
   }

   sendPropertyDetails(property: Property): void {
    const numero = enviroment.whatsappNumber;
    const message = `Hola, estoy interesado en la propiedad \n https://www.marckplussinmobiliaria.com/propiedad/${property.codpro}`;
    this.sendMessage(message);
   }
}
