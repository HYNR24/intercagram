import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';


@Injectable({
  providedIn: 'root',
})
export class Api {

  private apiUrl = 'https://20.151.96.66/api/';

  constructor(private http: HttpClient, private auth: Auth) {}

  private authHeaders() {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  getMe() {
    return this.http.get<any>(this.apiUrl + 'me', this.authHeaders());
  }

  getFeed() {
    return this.http.get<any>(this.apiUrl + 'posts', this.authHeaders());
  }

  getFriends() {
    return this.http.get<any>(this.apiUrl + 'friends', this.authHeaders());
  }

  likePost(id: number) {
    return this.http.post(this.apiUrl + `posts/${id}/like`, {}, this.authHeaders());
  }

  createPost(file: File, caption: string) {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('caption', caption);
    return this.http.post(this.apiUrl + 'posts', fd, this.authHeaders());
  }

  commentPost(postId: number, content: string) {
    return this.http.post(
      this.apiUrl + `posts/${postId}/comments`,
      { content },
      this.authHeaders()
    );
  }

  getComments(postId: number) {
    return this.http.get<any[]>(
      this.apiUrl + `posts/${postId}/comments`,
      this.authHeaders()
    );
  }

  searchUsers(q: string) {
    return this.http.get<any[]>(this.apiUrl + `users/search?q=${q}`, this.authHeaders());
  }

  sendFriendRequest(username: string) {
    return this.http.post(this.apiUrl + `users/${username}/friend`, {}, this.authHeaders());
  }

  getPendingFriendRequests() {
    return this.http.get<any>(this.apiUrl + `friendships/pending`, this.authHeaders());
  }

  acceptFriendship(friendshipId: number) {
    return this.http.post(this.apiUrl + `friendships/${friendshipId}/accept`, {}, this.authHeaders());
  }

  getSuggestedUsers() {
    return this.http.get<any[]>(this.apiUrl + 'users/suggested', this.authHeaders());
  }

  removeFriend(username: string) {
    return this.http.delete(this.apiUrl + `users/${username}/friend`, this.authHeaders());
  }

  getUserPosts(username: string) {
    return this.http.get<any[]>(this.apiUrl + `users/${username}/posts`, this.authHeaders());
  }

  likeComment(commentId: number) {
    return this.http.post(this.apiUrl + `comments/${commentId}/like`, {}, this.authHeaders());
  }

  unlikeComment(commentId: number) {
    return this.http.delete(this.apiUrl + `comments/${commentId}/like`, this.authHeaders());
  }

  cancelFriendRequest(username: string) {
    return this.http.delete(this.apiUrl + `users/${username}/friend/cancel`, this.authHeaders());
  }

  getFriendshipStatus(username: string) {
    return this.http.get(this.apiUrl + `users/${username}/friend/status`, this.authHeaders());
  }

}
