import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed.page').then( m => m.FeedPage)
  },
  {
    path: 'new-post',
    loadComponent: () => import('./pages/new-post/new-post.page').then( m => m.NewPostPage)
  },
  {
    path: 'friends',
    loadComponent: () => import('./pages/friends/friends.page').then( m => m.FriendsPage)
  },
  {
    path: 'messages',
    loadComponent: () => import('./pages/messages/messages.page').then( m => m.MessagesPage)
  },
];
