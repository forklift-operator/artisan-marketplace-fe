import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  role: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9090/api/v1/auth';
  private currentUser = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(() => this.checkAuthStatus())
    );
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.next(null);
        sessionStorage.removeItem('currentUser');
      })
    );
  }

  checkAuthStatus(): void {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      this.currentUser.next(JSON.parse(user));
    }
  }

  setCurrentUser(user: User): void {
    this.currentUser.next(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return this.currentUser.value !== null;
  }

getLoggedInUserId(): number  {
  const user = this.currentUser.value;
  return user ? user.id : -1;
}
}
