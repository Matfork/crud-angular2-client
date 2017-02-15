import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Book } from '../models/book';

@Injectable()
export class BookService {
  private booksUrl: string = 'http://localhost:3002/book';  

  // observable source
  private bookCreatedSource = new Subject<Book>();
  private bookDeletedSource = new Subject();

  // observable stream
  bookCreated$ = this.bookCreatedSource.asObservable();
  bookDeleted$ = this.bookDeletedSource.asObservable();

  constructor(private http: Http) {}

  /**
   * Get all users
   */
  getBooks(): Observable<Book[]> {
    return this.http.get(this.booksUrl)
      .map(res => res.json().data)
      .map(users => users.map(this.toBook))
      .catch(this.handleError);
  }

  /**
   * Get a single user
   */
  getBook(id: number): Observable<Book> {
    // attaching a token
    let headers = new Headers();
    let token   = localStorage.getItem('auth_token');
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.booksUrl}/${id}`, { headers })
      .map(res => res.json().data)
      .map(this.toBook)
      .catch(this.handleError);
  }

  /**
   * Create the user
   */
  createBook(user: Book): Observable<Book> {
    return this.http.post(this.booksUrl, user)
      .map(res => res.json())
      .do(user => this.bookCreated(user))
      .catch(this.handleError);
  }

  /**
   * Update the user
   */
  updateBook(user: Book): Observable<Book> {
    return this.http.put(`${this.booksUrl}/${user.id}`, user)
      .map(res => res.json())
      .catch(this.handleError);
  }

  /**
   * Delete the user
   */
  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.booksUrl}/${id}`)
      .do(res => this.bookDeleted())
      .catch(this.handleError);
  }

  /**
   * The user was created. Add this info to our stream
   */
  bookCreated(user: Book) {
    this.bookCreatedSource.next(user);
  }

  /**
   * The user was deleted. Add this info to our stream
   */
  bookDeleted() {
    this.bookDeletedSource.next();
  }

  /**
   * Convert user info from the API to our standard/format
   */
  private toBook(book): Book {
    return {
      id: book.id,
      name: `${book.name}`,
      description: `${book.description}`,
      publication_date: book.publication_date,
      author_id: book.author_id,
      author : {}
    };
  }


  /**
   * Handle any errors from the API
   */
  private handleError(err) {
    let errMessage: string;

    if (err instanceof Response) {
      let body   = err.json() || '';
      let error  = body.error || JSON.stringify(body);
      errMessage = `${err.status} - ${err.statusText || ''} ${error}`;
    } else {
      errMessage = err.message ? err.message : err.toString();
    }

    return Observable.throw(errMessage);
  }

}