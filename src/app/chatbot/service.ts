import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatRequest, ChatResponse } from './models';
import { enviroment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private baseUrl!: string;
  private apiKey!: string;

  constructor(private http: HttpClient) {
    this.baseUrl = enviroment.chatbotApiUrl;
  }

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