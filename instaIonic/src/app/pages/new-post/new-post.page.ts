import { Component, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  caption = '';
  file?: File;
  preview?: string;
  uploading = false;
  dragOver = false;

  cameraActive = false;
  capturedImageUrl: string | null = null;
  private cameraStream: MediaStream | null = null;
  private capturedCanvas: HTMLCanvasElement | null = null;

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
    if (this.isMobileDevice()) {
      this.cameraInput.nativeElement.click();
    } else {
      this.startCamera();
    }
  }

  pickFile() {
    this.fileInput.nativeElement.click();
  }

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.cameraStream = stream;
      this.cameraActive = true;
      this.capturedImageUrl = null;
      this.capturedCanvas = null;
      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = stream;
        }
      });
    } catch {
      this.cameraInput.nativeElement.click();
    }
  }

  private stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
    this.cameraActive = false;
    this.capturedImageUrl = null;
    this.capturedCanvas = null;
  }

  capturePhoto() {
    const video = this.videoRef?.nativeElement;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    this.capturedCanvas = canvas;
    this.capturedImageUrl = canvas.toDataURL('image/jpeg', 0.92);
  }

  retakePhoto() {
    this.capturedCanvas = null;
    this.capturedImageUrl = null;
  }

  acceptPhoto() {
    if (!this.capturedCanvas) return;
    this.capturedCanvas.toBlob((blob) => {
      if (!blob) return;
      const f = new File([blob], 'camera_photo.jpg', { type: 'image/jpeg' });
      this.file = f;
      if (this.preview) URL.revokeObjectURL(this.preview);
      this.preview = URL.createObjectURL(f);
      this.stopCamera();
    }, 'image/jpeg', 0.92);
  }

  cancelCamera() {
    this.stopCamera();
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
