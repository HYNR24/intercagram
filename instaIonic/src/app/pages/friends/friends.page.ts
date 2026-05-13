import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons,
  IonBackButton, IonAvatar
} from '@ionic/angular/standalone';
import { Api } from '../../services/api';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [
    IonButtons, IonButton, IonHeader, IonToolbar, IonTitle, IonContent,
    IonBackButton, IonAvatar,
    CommonModule, FormsModule
  ]
})
export class FriendsPage implements OnInit {

  friends: any[] = [];
  pending: any[] = [];
  base = 'http://20.151.96.66/storage/';

  constructor(private api: Api) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getFriends().subscribe(res => this.friends = res);
    this.api.getPendingFriendRequests().subscribe(res => this.pending = res);
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe(_ => this.load());
  }

  unfollow(f: any) {
    this.api.removeFriend(f.profile?.username || f.username).subscribe(_ => this.load());
  }
}
