import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonAvatar, IonLabel, IonButton, IonButtons,
  IonInput, IonIcon, IonSearchbar, IonSpinner
} from '@ionic/angular/standalone';
import {
  cameraOutline, heartOutline, heart,
  chatbubbleOutline, paperPlaneOutline,
  personAdd, closeOutline, searchOutline,
  chevronBackOutline, chevronForwardOutline,
  checkmarkCircle, personRemove
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
    IonSpinner, IonSearchbar, IonInput, IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonAvatar, IonLabel, IonButton, IonButtons,
    FormsModule, CommonModule, IonIcon
  ]
})
export class FeedPage implements OnInit {

  posts: any[] = [];
  storyUsers: any[] = [];
  base = 'https://20.151.96.66/storage/';

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
  viewerUserIdx = 0;
  private viewerTimer: any = null;
  private viewerInterval: any = null;

  followLoading: { [key: string]: boolean } = {};
  commentLikeLoading: { [key: number]: boolean } = {};
  searchLoading = false;

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
    chevronForward: chevronForwardOutline,
    checkmark: checkmarkCircle,
    personRemove
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
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe((res: any) => {
      res.likes_count = 0;
      res.liked_by_me = false;
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  toggleCommentLike(c: any) {
    const id = c.id;
    if (this.commentLikeLoading[id]) return;
    this.commentLikeLoading[id] = true;

    if (c.liked_by_me) {
      this.api.unlikeComment(id).subscribe({
        next: () => {
          c.liked_by_me = false;
          c.likes_count = Math.max(0, (c.likes_count || 0) - 1);
          this.commentLikeLoading[id] = false;
        },
        error: () => this.commentLikeLoading[id] = false
      });
    } else {
      this.api.likeComment(id).subscribe({
        next: () => {
          c.liked_by_me = true;
          c.likes_count = (c.likes_count || 0) + 1;
          this.commentLikeLoading[id] = false;
        },
        error: () => this.commentLikeLoading[id] = false
      });
    }
  }

  onSearchInput(ev: any) {
    const q = ev.detail.value?.trim();
    if (!q || q.length < 1) {
      this.searchResults = [];
      return;
    }
    this.searchLoading = true;
    this.api.searchUsers(q).subscribe({
      next: res => {
        this.searchResults = res;
        this.searchLoading = false;
      },
      error: () => this.searchLoading = false
    });
  }

  toggleFollow(user: any) {
    const username = user.profile?.username || user.username;
    if (!username || this.followLoading[username]) return;
    this.followLoading[username] = true;

    if (user.friendship_status === 'none') {
      this.api.sendFriendRequest(username).subscribe({
        next: () => {
          user.friendship_status = 'pending';
          this.followLoading[username] = false;
        },
        error: () => this.followLoading[username] = false
      });
    } else if (user.friendship_status === 'pending') {
      this.api.cancelFriendRequest(username).subscribe({
        next: () => {
          user.friendship_status = 'none';
          this.followLoading[username] = false;
        },
        error: () => this.followLoading[username] = false
      });
    } else if (user.friendship_status === 'accepted') {
      this.api.removeFriend(username).subscribe({
        next: () => {
          user.friendship_status = 'none';
          this.followLoading[username] = false;
        },
        error: () => this.followLoading[username] = false
      });
    }
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

  userIdxFromUsername(username: string): number {
    return this.storyUsers.findIndex((u: any) => u.profile?.username === username);
  }

  openUserPosts(p: any) {
    const username = p.user?.profile?.username;
    if (username) {
      this.viewerUserIdx = this.userIdxFromUsername(username);
      this.viewUserPosts(username, p.id);
    }
  }

  viewUserPosts(username: string, focusPostId?: number) {
    this.api.getUserPosts(username).subscribe(posts => {
      if (!posts.length) {
        this.tryNextUser();
        return;
      }
      this.viewerPosts = posts;
      this.viewerIndex = focusPostId != null
        ? Math.max(0, posts.findIndex((x: any) => x.id === focusPostId))
        : 0;
      this.showViewer = true;
      this.viewerProgress = 0;
      this.startViewerTimer();
    });
  }

  closeViewer() {
    this.showViewer = false;
    this.viewerPosts = [];
    this.viewerIndex = 0;
    this.viewerUserIdx = 0;
    this.stopViewerTimer();
  }

  private tryNextUser() {
    this.viewerUserIdx++;
    if (this.viewerUserIdx < this.storyUsers.length) {
      const nextUser = this.storyUsers[this.viewerUserIdx];
      this.viewUserPosts(nextUser.profile?.username);
    } else {
      this.closeViewer();
    }
  }

  private tryPrevUser() {
    this.viewerUserIdx--;
    if (this.viewerUserIdx >= 0) {
      const prevUser = this.storyUsers[this.viewerUserIdx];
      this.api.getUserPosts(prevUser.profile?.username).subscribe(posts => {
        if (!posts.length) {
          this.tryPrevUser();
          return;
        }
        this.viewerPosts = posts;
        this.viewerIndex = posts.length - 1;
        this.viewerProgress = 0;
        this.resetViewerTimer();
      });
    } else {
      this.closeViewer();
    }
  }

  prevPost() {
    if (this.viewerIndex > 0) {
      this.viewerIndex--;
      this.viewerProgress = 0;
      this.resetViewerTimer();
    } else if (this.viewerUserIdx > 0) {
      this.tryPrevUser();
    }
  }

  nextPost() {
    if (this.viewerIndex < this.viewerPosts.length - 1) {
      this.viewerIndex++;
      this.viewerProgress = 0;
      this.resetViewerTimer();
    } else if (this.viewerUserIdx < this.storyUsers.length - 1) {
      this.tryNextUser();
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
    } else if (this.viewerUserIdx < this.storyUsers.length - 1) {
      this.tryNextUser();
    } else {
      this.closeViewer();
    }
  }

  get currentViewerPost() {
    return this.viewerPosts[this.viewerIndex];
  }

  get hasPrev() {
    return this.viewerIndex > 0 || this.viewerUserIdx > 0;
  }

  get hasNext() {
    return this.viewerIndex < this.viewerPosts.length - 1 ||
           this.viewerUserIdx < this.storyUsers.length - 1;
  }

  get viewerStoryUser() {
    const post = this.currentViewerPost;
    return post?.user;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.showViewer) this.closeViewer();
  }
}
