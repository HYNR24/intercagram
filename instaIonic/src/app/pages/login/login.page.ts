import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonButton, IonIcon,
  IonSegment, IonSegmentButton, IonLabel,
  ToastController
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonInput, IonButton, IonIcon,
    IonSegment, IonSegmentButton, IonLabel,
    FormsModule, CommonModule
  ]
})
export class LoginPage {
  email = '';
  password = '';
  name = '';
  username = '';
  mode = 'login';
  error = '';
  showPassword = false;
  loading = false;

  constructor(
    private auth: Auth,
    private router: Router,
    private toast: ToastController,
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  async submit() {
    this.error = '';
    if (this.loading) return;
    this.loading = true;
    if (this.mode === 'register') {
      this.auth.register({
        name: this.name,
        email: this.email,
        password: this.password,
        username: this.username
      }).subscribe({
        next: async res => {
          this.auth.setToken(res.token);
          const t = await this.toast.create({ message: 'Cuenta creada correctamente', duration: 2000, color: 'success', position: 'bottom' });
          await t.present();
          this.router.navigateByUrl('/feed', { replaceUrl: true });
        },
        error: async (err: any) => {
          this.loading = false;
          this.error = err?.error?.message || 'No se pudo registrar';
        }
      });
    } else {
      this.auth.login(this.email, this.password).subscribe({
        next: async res => {
          this.auth.setToken(res.token);
          const t = await this.toast.create({ message: 'Bienvenido a Intercagram', duration: 2000, color: 'success', position: 'bottom' });
          await t.present();
          this.router.navigateByUrl('/feed', { replaceUrl: true });
        },
        error: async (err: any) => {
          this.loading = false;
          this.error = err?.error?.message || 'Credenciales inválidas';
        }
      });
    }
  }
}
