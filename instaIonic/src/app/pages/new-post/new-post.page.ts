import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonImg, IonButtons, IonBackButton, IonIcon, IonCol, IonGrid, IonRow } from '@ionic/angular/standalone';
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
export class NewPostPage implements OnInit {

  caption = '';
  file?: File;
  preview?: string;

  constructor(private api: Api, private router: Router) {
    addIcons({camera,fileTray,cloudUpload,});
  }
  
  ngOnInit() {}

  onFileChange(ev: any) {
    const f = ev.target.files[0];
    if (f) this.file = f;
    this.preview = URL.createObjectURL(f);
  }

  upload() {
    if (!this.file) return;
    this.api.createPost(this.file, this.caption).subscribe(() => {
      this.router.navigateByUrl('/feed');
    });
  }

}
