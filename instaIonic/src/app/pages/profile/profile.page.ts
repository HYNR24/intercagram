import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonAvatar, IonButton, IonButtons,
  IonInput, IonTextarea, IonIcon, IonSpinner,
  IonItem, IonLabel
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { cameraOutline, logOutOutline, closeOutline, checkmarkCircle, personCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonAvatar, IonButton, IonButtons, IonItem, IonLabel,
    IonInput, IonTextarea, IonIcon, IonSpinner,
    FormsModule, CommonModule
  ]
})
export class ProfilePage implements OnInit {

  base = 'https://20.151.96.66/storage/';
  user: any = null;
  bio = '';
  website = '';
  loading = false;
  saving = false;
  message = '';

  constructor(
    private api: Api,
    private auth: Auth,
    private router: Router,
  ) {
    addIcons({ cameraOutline, logOutOutline, closeOutline, checkmarkCircle, personCircleOutline });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.api.getMe().subscribe({
      next: (res) => {
        this.user = res;
        this.bio = res.profile?.bio || '';
        this.website = res.profile?.website || '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  imgUrl(path: string) {
    return this.base + path;
  }

  onAvatarSelected(event: any) {
    const file = event.target?.files?.[0];
    if (!file) return;
    this.saving = true;
    this.message = '';
    this.api.updateAvatar(file).subscribe({
      next: (res) => {
        this.user = res.user;
        this.message = 'Foto actualizada';
        this.saving = false;
      },
      error: () => {
        this.message = 'Error al subir foto';
        this.saving = false;
      }
    });
  }

  saveProfile() {
    this.saving = true;
    this.message = '';
    this.api.updateProfile({ bio: this.bio, website: this.website }).subscribe({
      next: (res) => {
        this.user = res.user;
        this.message = 'Perfil guardado';
        this.saving = false;
      },
      error: () => {
        this.message = 'Error al guardar';
        this.saving = false;
      }
    });
  }

  goBack() {
    this.router.navigateByUrl('/feed');
  }

  logout() {
    this.auth.logoutRemote()?.subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }
}
