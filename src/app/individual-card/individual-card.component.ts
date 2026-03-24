import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Property } from '../core/models/domus.model';
import { DomusService } from '../core/service/domus.service';

@Component({
  selector: 'app-individual-card',
  templateUrl: './individual-card.component.html',
  styleUrls: ['./individual-card.component.css']
})
export class IndividualCardComponent implements OnInit {
  
  public property: Property | null = null;
  public currentImageIndex: number = 0;
  public images: string[] = [];
  public isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private domusService: DomusService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProperty(id);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadProperty(id: string): void {
    this.isLoading = true;
    // Simular carga de una sola propiedad usando el servicio
    this.domusService.getPropertyById(id).subscribe({
      next: (response) => {
        const foundProperty = response.data;
        if (foundProperty) {
          this.property = foundProperty;
          this.images = foundProperty.images?.map(image => image.imageurl) || [];
          this.currentImageIndex = 0;
        } else {
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    });
  }

  public nextImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    }
  }

  public prevImage(): void {
    if (this.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    }
  }

  public goToImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.currentImageIndex = index;
    }
  }

  public goBack(): void {
    this.location.back();
  }

  public goBackToList(): void {
    this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const element = document.getElementById('filtrar-propiedades');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    });
  }

  public contactAgent(): void {
    // Implementar lógica para contactar al agente
    // Por ejemplo, abrir WhatsApp o mostrar formulario de contacto
    console.log('Contactar agente para propiedad:', this.property?.idpro);
  }

  public shareProperty(): void {
    // Implementar lógica para compartir la propiedad
    if (navigator.share) {
      navigator.share({
        title: this.property?.address || 'Propiedad',
        text: this.property?.description || '',
        url: window.location.href
      }).catch(err => console.log('Error compartiendo:', err));
    }
  }
}
