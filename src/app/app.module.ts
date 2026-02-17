import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { HeaderTopComponent } from './header-top/header-top.component';
import { HabilidadesComponent } from './habilidades/habilidades.component';
import { AboutmeComponent } from './aboutme/aboutme.component';
import { CursosComponent } from './cursos/cursos.component';
import { ProjectsComponent } from './projects/projects.component';
import { ExperiencesComponent } from './experiences/experiences.component';
import { TechComponent } from './tech/tech.component';
import { ContactComponent } from './contact/contact.component';
import { ChatbotComponent } from './chatbot/chatbot.component';


@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    MyprofileComponent,
    HeaderTopComponent,
    HabilidadesComponent,
    AboutmeComponent,
    CursosComponent,
    ProjectsComponent,
    ExperiencesComponent,
    TechComponent,
    ContactComponent,
    ChatbotComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
