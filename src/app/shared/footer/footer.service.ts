import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FooterService {

  constructor(private http: HttpClient) { }

  getLogo(link: string) {
    return this.http.get(link, { responseType: 'text' });
  }
}
