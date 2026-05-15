import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IonApp, IonRouterOutlet, IonMenu, IonContent, IonButton, IonIcon, IonAvatar } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { home, chatbubbles, people, person, addCircle, logOutOutline, chevronForward, menuOutline } from 'ionicons/icons';
import { Auth } from './services/auth';
import { Api } from './services/api';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    CommonModule,
    IonApp, IonRouterOutlet, IonMenu, IonContent, IonButton, IonIcon, IonAvatar
  ],
})
export class AppComponent implements OnInit {

  logOutIcon = logOutOutline;
  currentUrl = '';
  base = 'https://20.151.96.66/storage/';
  user: any = null;

  pages = [
    { title: 'Feed', icon: home, route: '/feed' },
    { title: 'Mensajes', icon: chatbubbles, route: '/messages' },
    { title: 'Amigos', icon: people, route: '/friends' },
    { title: 'Perfil', icon: person, route: '/profile' },
    { title: 'Nuevo Post', icon: addCircle, route: '/new-post' },
  ];

  constructor(
    private router: Router,
    private auth: Auth,
    private api: Api,
  ) {
    addIcons({ home, chatbubbles, people, person, addCircle, logOutOutline, chevronForward, menuOutline });
    this.currentUrl = this.router.url;
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      setTimeout(() => this.currentUrl = e.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.api.getMe().subscribe({
      next: res => this.user = res,
      error: () => {}
    });
  }

  isActive(route: string): boolean {
    return this.currentUrl.startsWith(route);
  }

  navigate(route: string) {
    this.router.navigateByUrl(route);
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

}
