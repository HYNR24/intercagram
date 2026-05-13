import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonImg, IonButtons, IonBackButton, IonIcon, IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';
import { Api } from '../../services/api';
import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { camera, cameraReverse, fileTray, cloudUpload } from 'ionicons/icons';

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
export class NewPostPage implements OnInit, AfterViewInit {

  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasEl!: ElementRef<HTMLCanvasElement>;

  caption = '';
  file?: File;
  preview?: string;
  showCamera = false;
  uploading = false;
  facingMode: 'user' | 'environment' = 'environment';
  private stream: MediaStream | null = null;

  constructor(private api: Api, private router: Router) {
    addIcons({camera, cameraReverse, fileTray, cloudUpload});
  }
  
  ngOnInit() {}

  ngAfterViewInit() {}

  async openCamera() {
    this.showCamera = true;
    await this.startCamera();
  }

  private async startCamera() {
    this.stopCamera();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: this.facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (this.videoEl?.nativeElement) {
        this.videoEl.nativeElement.srcObject = this.stream;
      }
    } catch {
      if (this.facingMode === 'environment') {
        this.facingMode = 'user';
        await this.startCamera();
      }
    }
  }

  flipCamera() {
    this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.startCamera();
  }

  capture() {
    const video = this.videoEl?.nativeElement;
    const canvas = this.canvasEl?.nativeElement;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(blob => {
      if (!blob) return;
      this.file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
      this.preview = URL.createObjectURL(blob);
      this.closeCamera();
    }, 'image/jpeg', 0.85);
  }

  closeCamera() {
    this.stopCamera();
    this.showCamera = false;
  }

  private stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  onFileChange(ev: any) {
    const f = ev.target.files[0];
    if (f) this.file = f;
    this.preview = URL.createObjectURL(f);
  }

  upload() {
    if (!this.file || this.uploading) return;
    this.uploading = true;
    this.api.createPost(this.file, this.caption).subscribe({
      next: () => this.router.navigateByUrl('/feed'),
      error: () => this.uploading = false
    });
  }

}
