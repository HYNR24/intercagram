import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonAvatar, IonSpinner, MenuController
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { arrowBackOutline, notifications, notificationsOffOutline, personOutline, heartOutline, chatbubbleOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    IonSpinner, IonAvatar, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon,
    CommonModule, RouterModule
  ]
})
export class NotificationsPage implements OnInit, OnDestroy {

  notifications: any[] = [];
  base = 'https://20.151.96.66/storage/';
  loading = true;
  private pollInterval: any = null;

  constructor(
    private api: Api,
    private router: Router,
    private menuCtrl: MenuController,
  ) {
    addIcons({ arrowBackOutline, notifications, notificationsOffOutline, personOutline, heartOutline, chatbubbleOutline, personAddOutline });
  }

  ngOnInit() {
    this.load();
    this.pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.api.getNotifications().subscribe({
          next: res => this.notifications = res,
          error: () => {}
        });
      }
    }, 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  openMenu() {
    this.menuCtrl.open();
  }

  load() {
    this.loading = true;
    this.api.getNotifications().subscribe({
      next: res => {
        this.notifications = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  goBack() {
    this.router.navigateByUrl('/feed');
  }

  handleClick(n: any) {
    this.api.markNotificationRead(n.id).subscribe();
    if (n.type === 'friend_request' || n.type === 'friend_accepted') {
      this.router.navigateByUrl('/profile/' + n.data?.username);
    } else if (n.type === 'like' || n.type === 'comment' || n.type === 'comment_like') {
      this.router.navigateByUrl('/feed');
    }
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

  iconFor(type: string): string {
    switch (type) {
      case 'like': return 'heart-outline';
      case 'comment': return 'chatbubble-outline';
      case 'comment_like': return 'heart-outline';
      case 'friend_request': return 'person-add-outline';
      case 'friend_accepted': return 'person-outline';
      default: return 'notifications-outline';
    }
  }

}
