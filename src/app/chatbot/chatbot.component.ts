import { Component } from '@angular/core';
import { ChatService } from '../chatbot/service';

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
    { 
      text: '¡Hola! 👋 Soy el asistente virtual de MarckPluss. ¿En qué puedo ayudarte hoy?', 
      sender: 'bot' 
    }
  ];

  userMessage = '';
  isLoading = false;

  userId = Date.now() + Math.floor(Math.random() * 5000);

  constructor(private chatService: ChatService) { }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) return;

    const messageToSend = this.userMessage.trim();

    // Mostrar mensaje del usuario
    this.messages.push({ text: messageToSend, sender: 'user' });

    this.userMessage = '';
    this.isLoading = true;

    // 🔥 Usando el servicio
    this.chatService.sendMessage(messageToSend).subscribe({
      next: (response) => {
        // Ajusta según tu interfaz ChatResponse
        const reply = response?.response || 'No pude responder en este momento 😕';

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