import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonImg, IonButtons, IonBackButton, IonIcon, IonCol, IonGrid, IonRow, ToastController } from '@ionic/angular/standalone';
import { Api } from '../../services/api';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { camera, fileTray, cloudUpload } from 'ionicons/icons';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
  standalone: true,
  imports: [IonRow, 
    IonGrid, IonCol, IonIcon, IonBackButton, IonImg, IonHeader, 
    IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, FormsModule, IonButtons, CommonModule,
    IonGrid, IonCol
  ]
})
export class NewPostPage {

  caption = '';
  file?: File;
  preview?: string;
  uploading = false;

  constructor(
    private api: Api,
    private router: Router,
    private toast: ToastController
  ) {
    addIcons({camera, fileTray, cloudUpload});
  }

  onFileChange(ev: any) {
    const f = ev.target.files[0];
    if (f) this.file = f;
    this.preview = URL.createObjectURL(f);
  }

  async upload() {
    if (!this.file || this.uploading) return;
    this.uploading = true;
    this.api.createPost(this.file, this.caption).subscribe({
      next: async () => {
        const t = await this.toast.create({
          message: 'Publicación creada',
          duration: 1500,
          color: 'success',
          position: 'bottom'
        });
        await t.present();
        setTimeout(() => this.router.navigateByUrl('/feed'), 1500);
      },
      error: () => this.uploading = false
    });
  }

}
