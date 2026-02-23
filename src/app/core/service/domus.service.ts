import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, Property } from '../models/domus.model';
import { enviroment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DomusService {

  private baseUrl!: string;

  constructor(private http: HttpClient) {
    this.baseUrl = enviroment.domusApiUrl;
  }

  getProperties(): Observable<PaginatedResponse<Property>> {
    return this.http.get<PaginatedResponse<Property>>(`${this.baseUrl}`);
  }
}