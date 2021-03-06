import { NgModule } from '@angular/core';
import { NgxGooglemapsTrackingViewComponent } from './ngx-googlemaps-tracking-view.component';
import { TrackedObjectComponent } from './components/tracked-object/tracked-object.component';
import { CommonModule } from '@angular/common';
import { GoogleMapsWrapper } from './services/googlemaps-wrapper';
import { InfowindowComponent } from './components/infowindow/infowindow.component';
import { GeolocationButtonComponent } from './components/geolocation-button/geolocation-button';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    NgxGooglemapsTrackingViewComponent,
    TrackedObjectComponent,
    InfowindowComponent,
    GeolocationButtonComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [GoogleMapsWrapper],
  exports: [
    NgxGooglemapsTrackingViewComponent,
    InfowindowComponent,
    GeolocationButtonComponent
  ]
})
export class NgxGooglemapsTrackingViewModule { }
