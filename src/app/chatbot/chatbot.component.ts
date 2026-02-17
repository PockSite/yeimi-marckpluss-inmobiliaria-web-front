import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isOpen = false;
  messages: ChatMessage[] = [
    { text: '¡Hola! 👋 Soy el asistente virtual de Daniel. ¿En qué puedo ayudarte hoy?', sender: 'bot' }
  ];
  userMessage = '';
  isLoading = false;

  userId = Date.now() + Math.floor(Math.random() + 111 * 5000);

  constructor(private http: HttpClient) { }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    const messageToSend = this.userMessage.trim();
    this.messages.push({ text: messageToSend, sender: 'user' });

    this.userMessage = '';
    this.isLoading = true;

    this.http.post<{ answer: string }>('https://asistente-de-ia-portafolio.onrender.com/api/chat', {
      userId: this.userId,
      message: messageToSend
    }).subscribe({
      next: (response) => {
        const reply = response?.answer || 'No pude responder en este momento 😕';
        this.messages.push({ text: reply, sender: 'bot' });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Chatbot error:', error);
        this.messages.push({
          text: 'Lo siento, ocurrió un error al conectar con el servidor.',
          sender: 'bot'
        });
        this.isLoading = false;
      }
    });
  }

}
