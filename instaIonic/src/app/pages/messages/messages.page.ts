import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon
} from '@ionic/angular/standalone';
import { arrowBackOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon,
    CommonModule
  ]
})
export class MessagesPage {

  icons = {
    back: arrowBackOutline,
  };

  constructor(private router: Router) {}

  goBack() { this.router.navigateByUrl('/feed'); }
}
