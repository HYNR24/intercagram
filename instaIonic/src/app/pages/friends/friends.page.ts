import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon,
  IonBackButton, IonAvatar, IonToast, MenuController
} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { personAddOutline, peopleOutline, checkmarkCircleOutline, closeOutline, chatbubbleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [
    IonIcon, IonButtons, IonButton, IonHeader, IonToolbar, IonTitle, IonContent,
    IonBackButton, IonAvatar, IonToast,
    CommonModule, FormsModule, RouterModule
  ]
})
export class FriendsPage implements OnInit {

  friends: any[] = [];
  pending: any[] = [];
  base = 'https://20.151.96.66/storage/';
  loadingReject = new Set<number>();

  constructor(
    private api: Api,
    private router: Router,
    private menuCtrl: MenuController,
  ) {
    addIcons({ personAddOutline, peopleOutline, checkmarkCircleOutline, closeOutline, chatbubbleOutline });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getFriends().subscribe({
      next: res => this.friends = res,
      error: (err) => { if (err.status === 401) this.router.navigateByUrl('/login'); }
    });
    this.api.getPendingFriendRequests().subscribe({
      next: res => this.pending = res,
      error: (err) => { if (err.status === 401) this.router.navigateByUrl('/login'); }
    });
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe(_ => this.load());
  }

  reject(req: any) {
    this.loadingReject.add(req.id);
    this.api.rejectFriendship(req.id).subscribe({
      next: () => this.removeAndToast(req.id),
      error: () => {
        this.loadingReject.delete(req.id);
        this.showToast('No se pudo rechazar la solicitud');
      }
    });
  }

  private removeAndToast(id: number) {
    this.pending = this.pending.filter(p => p.id !== id);
    this.loadingReject.delete(id);
    this.showToast('Solicitud rechazada');
  }

  private async showToast(msg: string) {
    const toast = document.createElement('ion-toast');
    toast.message = msg;
    toast.duration = 2000;
    toast.position = 'bottom';
    toast.style.setProperty('--border-radius', '12px');
    toast.style.setProperty('--background', '#1c1c1e');
    toast.style.setProperty('--color', '#fff');
    document.body.appendChild(toast);
    await toast.present();
    setTimeout(() => toast.remove(), 2500);
  }

  unfollow(f: any) {
    this.api.removeFriend(f.profile?.username || f.username).subscribe(_ => this.load());
  }

  openChat(username: string) {
    this.router.navigateByUrl('/chat/' + username);
  }

  openMenu() {
    this.menuCtrl.open();
  }
}
