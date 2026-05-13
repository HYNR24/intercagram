import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonAvatar, IonLabel, IonButton, IonButtons,
  IonInput, IonIcon, IonSearchbar
} from '@ionic/angular/standalone';
import {
  cameraOutline, heartOutline, heart,
  chatbubbleOutline, paperPlaneOutline,
  personAdd, closeOutline, searchOutline,
  chevronBackOutline, chevronForwardOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [
    IonSearchbar, IonInput, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonAvatar, IonLabel, IonButton, IonButtons,
    FormsModule, CommonModule, IonIcon
  ]
})
export class FeedPage implements OnInit {

  posts: any[] = [];
  storyUsers: any[] = [];
  base = 'http://127.0.0.1:8000/storage/';

  selectedPost: any = null;
  newComment = '';
  comments: any[] = [];
  showComments = false;
  friendUsername = '';
  searchResults: any[] = [];
  showSearch = false;
  showSearchbar = false;
  currentUser: any = null;

  viewerPosts: any[] = [];
  viewerIndex = 0;
  showViewer = false;
  viewerProgress = 0;
  private viewerTimer: any = null;
  private viewerInterval: any = null;

  icons = {
    camera: cameraOutline,
    search: searchOutline,
    messages: paperPlaneOutline,
    heartFilled: heart,
    heartOutline,
    chat: chatbubbleOutline,
    paper: paperPlaneOutline,
    person: personAdd,
    close: closeOutline,
    chevronBack: chevronBackOutline,
    chevronForward: chevronForwardOutline
  };

  constructor(
    private api: Api,
    private router: Router,
    private auth: Auth,
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getFeed().subscribe(res => {
      const data = res.data ?? res;
      this.posts = data;
      const seen = new Set();
      this.storyUsers = data
        .map((p: any) => p.user)
        .filter((u: any) => {
          if (!u || seen.has(u.id)) return false;
          seen.add(u.id);
          return true;
        });
    });
    this.api.getMe().subscribe(res => this.currentUser = res);
  }

  like(p: any) {
    this.api.likePost(p.id).subscribe(() => this.load());
  }

  goNewPost() { this.router.navigateByUrl('/new-post'); }
  goFriends() { this.router.navigateByUrl('/friends'); }
  goMessages() { this.router.navigateByUrl('/messages'); }
  toggleSearch() { this.showSearchbar = !this.showSearchbar; }

  imgUrl(path: string) { return this.base + path; }

  openComments(p: any) {
    this.selectedPost = p;
    this.showComments = true;
    this.api.getComments(p.id).subscribe(res => this.comments = res);
  }

  sendComment() {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe(res => {
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  onSearchInput(ev: any) {
    const q = ev.detail.value?.trim();
    if (!q || q.length < 1) {
      this.searchResults = [];
      return;
    }
    this.api.searchUsers(q).subscribe(res => this.searchResults = res);
  }

  selectUser(user: any) {
    this.friendUsername = user.username;
    this.searchResults = [];
    this.showSearch = false;
  }

  followUser(username: string) {
    this.api.sendFriendRequest(username).subscribe(() => {});
  }

  unfollowUser(username: string) {
    this.api.removeFriend(username).subscribe(() => {
      this.load();
    });
  }

  closeComments() {
    this.showComments = false;
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
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

  openUserPosts(p: any) {
    const username = p.user?.profile?.username;
    if (username) this.viewUserPosts(username, p.id);
  }

  viewUserPosts(username: string, focusPostId?: number) {
    this.api.getUserPosts(username).subscribe(posts => {
      if (!posts.length) return;
      this.viewerPosts = posts;
      if (focusPostId != null) {
        this.viewerIndex = posts.findIndex((x: any) => x.id === focusPostId);
      }
      if (this.viewerIndex < 0) this.viewerIndex = 0;
      this.showViewer = true;
      this.viewerProgress = 0;
      this.startViewerTimer();
    });
  }

  closeViewer() {
    this.showViewer = false;
    this.viewerPosts = [];
    this.viewerIndex = 0;
    this.stopViewerTimer();
  }

  prevPost() {
    if (this.viewerIndex > 0) {
      this.viewerIndex--;
      this.viewerProgress = 0;
      this.resetViewerTimer();
    }
  }

  nextPost() {
    if (this.viewerIndex < this.viewerPosts.length - 1) {
      this.viewerIndex++;
      this.viewerProgress = 0;
      this.resetViewerTimer();
    } else {
      this.closeViewer();
    }
  }

  private startViewerTimer() {
    this.stopViewerTimer();
    this.viewerInterval = setInterval(() => {
      this.viewerProgress++;
      if (this.viewerProgress >= 15) {
        this.viewerProgress = 0;
        this.advanceOrClose();
      }
    }, 1000);
  }

  private resetViewerTimer() {
    this.stopViewerTimer();
    this.startViewerTimer();
  }

  private stopViewerTimer() {
    if (this.viewerInterval) {
      clearInterval(this.viewerInterval);
      this.viewerInterval = null;
    }
  }

  private advanceOrClose() {
    if (this.viewerIndex < this.viewerPosts.length - 1) {
      this.viewerIndex++;
    } else {
      this.closeViewer();
    }
  }

  get currentViewerPost() {
    return this.viewerPosts[this.viewerIndex];
  }

  get hasPrev() {
    return this.viewerIndex > 0;
  }

  get hasNext() {
    return this.viewerIndex < this.viewerPosts.length - 1;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showViewer) this.closeViewer();
  }
}
