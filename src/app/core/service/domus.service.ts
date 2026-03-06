import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { PaginatedResponse, Property } from '../models/domus.model';
import { enviroment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DomusService {

  private baseUrl: string;
  private properties$?: Observable<PaginatedResponse<Property>>;

  constructor(private http: HttpClient) {
    this.baseUrl = enviroment.domusApiUrl + "/";
  }

  getProperties(): Observable<PaginatedResponse<Property>> {

    if (!this.properties$) {
      this.properties$ = this.http
        .get<PaginatedResponse<Property>>(this.baseUrl)
        .pipe(
          shareReplay(1)
        );
    }

    return this.properties$;
  }
}