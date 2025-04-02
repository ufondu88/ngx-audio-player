import { HttpClient } from '@angular/common/http';
import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  @ViewChild('mlogo') mlogo!: ElementRef;
  public src = 'https://raw.githubusercontent.com/mudigal-technologies/mudigal.com/master/logo/m-logo.txt';

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.http.get(this.src, { responseType: 'text' }).subscribe(svg => {
      this.mlogo.nativeElement.innerHTML = svg;
    });
  }
}
