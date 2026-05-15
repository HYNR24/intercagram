import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonButton, IonButtons, IonBackButton, IonIcon, IonSpinner, ToastController, MenuController } from '@ionic/angular/standalone';
import { Api } from '../../services/api';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { camera, closeOutline, imageOutline, cloudUpload, checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
  standalone: true,
  imports: [IonIcon, IonBackButton, IonHeader,
    IonToolbar, IonTitle, IonContent, IonInput, IonButton, FormsModule, IonButtons, CommonModule,
    IonSpinner
  ]
})
export class NewPostPage {

  caption = '';
  file?: File;
  preview?: string;
  uploading = false;
  dragOver = false;

  constructor(
    private api: Api,
    private router: Router,
    private toast: ToastController,
    private menuCtrl: MenuController,
  ) {
    addIcons({ camera, closeOutline, imageOutline, cloudUpload, checkmarkCircle });
  }

  openMenu() {
    this.menuCtrl.open();
  }

  openCamera() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (ev: any) => this.onFileChange(ev);
    input.click();
  }

  pickFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (ev: any) => this.onFileChange(ev);
    input.click();
  }

  onFileChange(ev: any) {
    const f = ev.target?.files?.[0];
    if (!f) return;
    this.file = f;
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.preview = URL.createObjectURL(f);
  }

  removeFile() {
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.file = undefined;
    this.preview = undefined;
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.dragOver = true;
  }

  onDragLeave() {
    this.dragOver = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver = false;
    const f = e.dataTransfer?.files?.[0];
    if (!f || !f.type.startsWith('image/')) return;
    this.file = f;
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.preview = URL.createObjectURL(f);
  }

  async upload() {
    if (!this.file || this.uploading) return;
    this.uploading = true;
    this.api.createPost(this.file, this.caption).subscribe({
      next: async () => {
        const t = await this.toast.create({
          message: 'Imagen publicada',
          duration: 1500,
          color: 'success',
          position: 'bottom'
        });
        await t.present();
        this.caption = '';
        this.file = undefined;
        this.preview = undefined;
        setTimeout(() => this.router.navigateByUrl('/feed', { replaceUrl: true }), 1000);
      },
      error: async (err: any) => {
        this.uploading = false;
        const body = err?.error;
        let detail = '';
        if (body?.errors) {
          for (const k in body.errors) detail += body.errors[k].join(', ');
        }
        const msg = detail || body?.message || err?.message || 'Error al publicar. Intenta de nuevo.';
        const t = await this.toast.create({
          message: msg,
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        await t.present();
      }
    });
  }

}
