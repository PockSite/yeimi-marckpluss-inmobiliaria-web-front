// services/chat.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from './models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private baseUrl!: string;
  private apiKey!: string;

  constructor(private http: HttpClient) {}

  /**
   * Configura dinámicamente la URL y el token
   */
  configure(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Envía mensaje al chatbot
   */
  sendMessage(message: string): Observable<ChatResponse> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `${this.apiKey}`
    });

    const body: ChatRequest = { message };

    return this.http.post<ChatResponse>(
      `${this.baseUrl}/chat`,
      body,
      { headers }
    );
  }
}