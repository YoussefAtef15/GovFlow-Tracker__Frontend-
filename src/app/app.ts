import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import {Footer} from './components/footer/footer';
// =======================================================
// ===> START: تمت إضافة هذا السطر <===
// =======================================================
import { InactivityPopupComponent } from './inactivity-popup/inactivity-popup';
// =======================================================
// ===> END: نهاية الإضافة <===
// =======================================================

@Component({
  selector: 'app-root',
  standalone: true,
  // ✅ تم إضافة المكون الجديد هنا
  imports: [RouterOutlet, NavbarComponent, Footer, InactivityPopupComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = signal('GovFrontend');
}
