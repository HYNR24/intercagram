import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonAvatar, IonInput, IonSpinner, ToastController, MenuController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../services/api';
import { SocketService } from '../../services/socket.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline, sendOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    IonSpinner, IonInput, IonAvatar, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon,
    CommonModule, FormsModule
  ]
})
export class ChatPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content!: IonContent;

  username = '';
  otherUser: any = null;
  messages: any[] = [];
  newMessage = '';
  base = 'https://20.151.96.66/storage/';
  loading = true;
  sending = false;
  socketReady = false;
  private pollInterval: any = null;
  private socketSub: any = null;
  private connSub: any = null;

  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private router: Router,
    private menuCtrl: MenuController,
    private socket: SocketService,
  ) {
    addIcons({ arrowBackOutline, sendOutline, personOutline });
  }

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username') || '';
    this.loadMessages();

    const token = localStorage.getItem('token');
    if (token) {
      this.socket.connect(token);
      this.connSub = this.socket.onConnectionChange().subscribe(connected => {
        this.socketReady = connected;
        if (connected) {
          this.socket.joinConversation(this.username);
          this.stopPolling();
        } else {
          this.startPolling();
        }
      });
      this.socketSub = this.socket.onNewMessage().subscribe((msg: any) => {
        const isRelevant = msg.conversation === this.username ||
          msg.sender?.username === this.username ||
          msg.receiver?.username === this.username;
        if (isRelevant) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      });
    }
    setTimeout(() => this.startPolling(), 2000);
  }

  ngOnDestroy() {
    this.stopPolling();
    this.socketSub?.unsubscribe();
    this.connSub?.unsubscribe();
    this.socket.leaveConversation(this.username);
  }

  private startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && !this.socketReady) {
        this.api.getMessages(this.username).subscribe(res => {
          this.messages = res;
        });
      }
    }, 3000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  loadMessages() {
    this.loading = true;
    this.api.getMessages(this.username).subscribe({
      next: (res) => {
        this.messages = res;
        this.loading = false;
        if (res.length > 0) {
          this.otherUser = res[0].sender?.profile?.username === this.username
            ? res[0].sender
            : res[0].receiver;
        }
        this.scrollToBottom();
      },
      error: () => this.loading = false
    });

    this.api.searchUsers(this.username).subscribe({
      next: (res) => {
        const found = res.find((u: any) => u.profile?.username === this.username);
        if (found) this.otherUser = found;
      }
    });
  }

  send() {
    if (!this.newMessage.trim() || this.sending) return;
    this.sending = true;
    this.api.sendMessage(this.username, this.newMessage).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.sending = false;
        this.scrollToBottom();
      },
      error: () => this.sending = false
    });
  }

  openMenu() {
    this.menuCtrl.open();
  }

  goBack() { this.router.navigateByUrl('/messages'); }

  private scrollToBottom() {
    setTimeout(() => this.content?.scrollToBottom(0));
  }

  isMine(msg: any): boolean {
    return msg.sender?.profile?.username !== this.username;
  }
}
