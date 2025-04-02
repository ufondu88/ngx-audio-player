import { HttpClient, HttpClientModule } from '@angular/common/http';
import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import { FooterService } from './footer.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
  footerService = inject(FooterService);
  
  @ViewChild('mlogo') mlogo!: ElementRef;
  public src = 'https://raw.githubusercontent.com/mudigal-technologies/mudigal.com/master/logo/m-logo.txt';


  ngOnInit(): void {
    this.footerService.getLogo(this.src).subscribe(svg => {
      this.mlogo.nativeElement.innerHTML = svg;
    });
  }
}
