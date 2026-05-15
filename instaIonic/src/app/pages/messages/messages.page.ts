import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonAvatar, IonItem, IonLabel, IonSpinner, MenuController
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { arrowBackOutline, chatbubbleOutline, chevronForwardOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [
    IonSpinner, IonItem, IonLabel, IonAvatar, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon,
    CommonModule, RouterModule
  ]
})
export class MessagesPage {

  conversations: any[] = [];
  base = 'https://20.151.96.66/storage/';
  loading = true;

  constructor(
    private api: Api,
    private router: Router,
    private menuCtrl: MenuController,
  ) {
    addIcons({ arrowBackOutline, chatbubbleOutline, chevronForwardOutline, personOutline });
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getConversations().subscribe({
      next: (res) => {
        this.conversations = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  openMenu() {
    this.menuCtrl.open();
  }

  goBack() { this.router.navigateByUrl('/feed'); }

  openChat(username: string) {
    this.router.navigateByUrl('/chat/' + username);
  }

  goNewChat() {
    this.router.navigateByUrl('/friends');
  }

  timeAgo(date: string): string {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd';
    return d.toLocaleDateString();
  }
}
