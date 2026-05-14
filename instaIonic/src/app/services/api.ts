import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Api {

  private apiUrl = 'https://20.151.96.66/api/';

  constructor(private http: HttpClient) {}

  getMe() {
    return this.http.get<any>(this.apiUrl + 'me');
  }

  getFeed() {
    return this.http.get<any>(this.apiUrl + 'posts');
  }

  getFriends() {
    return this.http.get<any>(this.apiUrl + 'friends');
  }

  likePost(id: number) {
    return this.http.post(this.apiUrl + `posts/${id}/like`, {});
  }

  createPost(file: File, caption: string) {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('caption', caption);
    return this.http.post(this.apiUrl + 'posts', fd);
  }

  commentPost(postId: number, content: string) {
    return this.http.post(
      this.apiUrl + `posts/${postId}/comments`,
      { content }
    );
  }

  getComments(postId: number) {
    return this.http.get<any[]>(
      this.apiUrl + `posts/${postId}/comments`
    );
  }

  searchUsers(q: string) {
    return this.http.get<any[]>(this.apiUrl + `users/search?q=${q}`);
  }

  sendFriendRequest(username: string) {
    return this.http.post(this.apiUrl + `users/${username}/friend`, {});
  }

  getPendingFriendRequests() {
    return this.http.get<any>(this.apiUrl + `friendships/pending`);
  }

  acceptFriendship(friendshipId: number) {
    return this.http.post(this.apiUrl + `friendships/${friendshipId}/accept`, {});
  }

  getSuggestedUsers() {
    return this.http.get<any[]>(this.apiUrl + 'users/suggested');
  }

  removeFriend(username: string) {
    return this.http.delete(this.apiUrl + `users/${username}/friend`);
  }

  getUserPosts(username: string) {
    return this.http.get<any[]>(this.apiUrl + `users/${username}/posts`);
  }

  likeComment(commentId: number) {
    return this.http.post(this.apiUrl + `comments/${commentId}/like`, {});
  }

  unlikeComment(commentId: number) {
    return this.http.delete(this.apiUrl + `comments/${commentId}/like`);
  }

  cancelFriendRequest(username: string) {
    return this.http.delete(this.apiUrl + `users/${username}/friend/cancel`);
  }

  getFriendshipStatus(username: string) {
    return this.http.get(this.apiUrl + `users/${username}/friend/status`);
  }

  updateProfile(data: { bio?: string; website?: string }) {
    return this.http.put<any>(this.apiUrl + 'profile', data);
  }

  updateAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.http.post<any>(this.apiUrl + 'profile/avatar', fd);
  }

}
