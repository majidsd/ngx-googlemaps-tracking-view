# Angular Google Maps Tracking View

A General-purpose embedded Angular map for tracking objects in real time using [Google Maps](https://developers.google.com/maps/documentation/javascript/tutorial). Helpful for Uber-like applications.

* [Live Demo](https://raschidjfr.github.io/ngx-googlemaps-tracking-view)
* [Documentation](https://raschidjfr.github.io/ngx-googlemaps-tracking-view/reference/components/NgxGooglemapsTrackingViewComponent.html)

![Demo 1](https://raw.githubusercontent.com/RaschidJFR/ngx-googlemaps-tracking-view/master/img/demo1.jpg)

![Demo 2](https://raw.githubusercontent.com/RaschidJFR/ngx-googlemaps-tracking-view/master/img/demo2.jpg)

## 🌎 Usage

```html
<!-- component.html -->
<gmtv-map [data]="objectsToTrack"></gmtv-map>
```

```ts
// component.ts
import { TrackedObject } from 'ngx-googlemaps-tracking-view';

const objectsToTrack: TrackedObject[] = [
  {
    id: '1',
    color: 'blue',
    heading: 45,
    label: {text: 'Test object #1' },
    position: new google.maps.LatLng(19.53124, -96.91589),
  },
  {
    id: '2',
    color: 'red',
    heading: -30,
    label: {text: 'Test object #2' },
    position: new google.maps.LatLng(19.53144, -96.91523),
  },
  ...
]
```

```scss
// styles.scss (Recomended)
body {
  margin: 0;
  height: 100vh;
}

```

## 🛠 Set Up

1. Install package: `$ npm i ngx-googlemaps-tracking-view`
2. Import the directive into your desired module (usually `app.module.ts`):

    ```ts
    //app.module.ts
    import { NgxGooglemapsTrackingViewModule } from 'ngx-googlemaps-tracking-view';

    @NgModule({
      imports: [
        NgxGooglemapsTrackingViewModule,
        ...
    ```

3. Get an [Google Maps API Key](https://developers.google.com/maps/documentation/javascript/get-api-key) and add the SDK to your `index.html` (just before closing `<head>` tag). Note the final part `&libraries=geometry`, this is needed to load the Geometry library.

    ```html
    <!-- index.html -->
    <head>
      ...
      <script src="https://maps.googleapis.com/maps/api/js?key=**YOUR_API_KEY**&libraries=geometry"></script>
    </head>
    ```

>See *[
Get Started with Google Maps Platform](https://developers.google.com/maps/gmp-get-started)* for more info.

## 🧩 API

| Param              | Type                                                                                               | Required? | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data               | [`TrackedObject[]`](https://raschidjfr.github.io/ngx-googlemaps-tracking-view/reference/interfaces/TrackedObject.html)                                                                                  | Required  | Array of objects to draw on the map. They must implement the interface `TrackedObject`: <br><br><ul><li>`color?: string` The marker's color.</li><li>`heading: number` Direction measured in degrees from true north.</li><li>`id: string` Unique identifier assigned to this object.</li><li>`icon?: google.maps.Icon / google.maps.Symbol` A google map's icon object.</li><li>`isOffline?: boolean` If `true`, the default marker (circle or triangle) will be outlined instead of solid.</li><li>`label?: label?: google.maps.MarkerLabel` A google maps label object to show near the marker.</li><li>`position: google.maps.LatLng` Scale for default markers. This is overwritten when `icon` is provided.</li><li>`scale?: number` The marker's color.</li><li>`speed?: number` If this value is not provided or is greater than 0 a triangle oriented towards`heading` will be shown as marker, otherwise, a circle (if `icon` is not set).</li></ul> |
| mapOptions         | [MapOptions](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions) | Optional  | GoogleMaps initialization options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| template           | [TemplateRef](https://angular.io/api/core/TemplateRef)                                             | Optional  | An Angular template for rendering the infowindow. If non provided, a default infowindow template will be used.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

See [Full Documentation](https://raschidjfr.github.io/ngx-googlemaps-tracking-view/reference/components/NgxGooglemapsTrackingViewComponent.html)

### Example

```html
<!-- component.html -->

<div id="parent" style="height: 100%; width: 100%; position:relative">

  <!-- Add the map component -->
  <gmtv-map [data]="objectsToTrack" [template]="infowindow" [mapOptions]="mapOptions" [showLocationButton]="true">

    <!-- (Optional) Add a custom template for the infowindow -->
    <ng-template #infowindow let-o>
      <div id="rootNode">
        <h3>{{o.label?.text}}</h3>
        <p>
          <strong>ID:</strong> {{o.id}}<br>
          <strong>Position:</strong> {{o.position?.toJSON() | json}}<br>
          <strong>Heading:</strong> {{o.heading | number:'1.0-1'}}°<br>
        </p>
      </div>
    </ng-template>
  </gmtv-map>

  <!-- (Optional) Add the geo-location button **AFTER** the map -->
  <gmtv-geolocation-button (locate)="onLocation()"></gmtv-geolocation-button>

</div>
```

## Contributing
Feel free to improve the code.

* Find the source code for the demo app [`/demo`](https://github.com/RaschidJFR/ngx-googlemaps-tracking-view/tree/master/demo/Readme.md).
* You'll find the library's source in [`/projects/ngx-googlemaps-tracking-view`](https://github.com/RaschidJFR/ngx-googlemaps-tracking-view/tree/master/projects/ngx-googlemaps-tracking-view).
* Develop:
  1. `$ npm run watch` to build in watch mode,
  2. then `$ npm run link:library` to install modules.

  3. To launch the demo app, make sure you've installed the dependencies inside the [`/demo`](https://github.com/RaschidJFR/ngx-googlemaps-tracking-view/tree/master/demo/Readme.md) folder (check the [readme](https://github.com/RaschidJFR/ngx-googlemaps-tracking-view/tree/master/demo/Readme.md)) and link the module by running `$ npm link ngx-googlemaps-tracking-view` (from within  the folder).

  4. run `$ npm install` and `$ npm start` inside `/demo` to start the app.

* Publish:
    1. Publish package: `$npm run publish`
    2. Deploy demo and docs: `$ npm run deploy`

## Credits
Raschid JF. Rafaelly

<hello@raschidjfr.dev>

https://raschidjfr.dev
