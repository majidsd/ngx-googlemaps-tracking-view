/// <reference types="@types/googlemaps" />
import { Component, OnDestroy, Input, ViewChild, AfterContentInit, OnChanges, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { InfowindowComponent } from '../infowindow/infowindow.component';
import { TrackedObject } from '../../models/tracked-object';
import { GoogleMapsWrapper } from '../../services/googlemaps-wrapper';

/** Size in meters to draw each unity speed on map in a dashed line */
const SPEED_UNIT_LENGTH_M = 20;

/**
 * Level of detail.
 * Minimal zoom to start drawing objects
 * */
const LOD = {
  speed: 15,
  scaleTriangle: 15,
  nameLabels: 0
}

/**
 * This class renders a trackable object on the map
 */
@Component({
  selector: 'gmtv-tracked-object',
  templateUrl: './tracked-object.component.html',
})
export class TrackedObjectComponent implements AfterContentInit, OnChanges, OnDestroy {
  polygon: google.maps.Polygon;
  vectorLine: google.maps.Polyline;
  dotMarker: google.maps.Marker;
  hoverDotListeners: google.maps.MapsEventListener[] = [];
  hoverPolygonListeners: google.maps.MapsEventListener[] = [];
  zoomListener: google.maps.MapsEventListener;
  subscription = new Subscription();

  @Input() trackedObject: TrackedObject;
  @Input() color = 'red';
  @Input() online = true;
  @Input() template: TemplateRef<any>;
  drawSpeedVector = false;

  @ViewChild(InfowindowComponent) infowindow: InfowindowComponent;
  constructor(private googleMaps: GoogleMapsWrapper) { }

  async ngAfterContentInit() {
    await this.googleMaps.ready();

    // Add bounds changed event
    this.checkRenderObject();
    this.subscription.add(
      this.googleMaps.boundsChanged
        .subscribe(() => this.checkRenderObject())
    );

    this.drawObject();
  }

  ngOnChanges() {
    if (!this.trackedObject) return;
    this.drawObject();
  }

  ngOnDestroy() {
    this.polygon.setMap(null);
    this.vectorLine.setMap(null);
    this.dotMarker.setMap(null);
    this.subscription.unsubscribe();
    if (this.zoomListener) this.zoomListener.remove();
  }

  get hasValidMeasures(): boolean {
    return true;
  }

  get isMoving(): boolean {
    return this.trackedObject.speed !== 0;
  }

  /**
   * Adaptive scale according to current zoom
   */
  protected get scale(): number {
    const zoom = this.googleMaps && this.googleMaps.map && this.googleMaps.map.getZoom() || 1;
    const s = Math.ceil(LOD.scaleTriangle - zoom);
    return Math.pow(2, s);
  }

  /**
   * Tip point
   */
  get tipLatLng(): google.maps.LatLng {
    if (this.hasValidMeasures)
      return this.polygon && this.polygon.getPath().getAt(3);
    else
      return this.trackedObject.position;
  }

  /**
   * Rear point
   */
  get rearLatLng(): google.maps.LatLng {
    if (this.hasValidMeasures)
      return this.polygon && this.polygon.getPath().getAt(0);
    else
      return this.trackedObject.position;
  }

  protected get canDrawPolygon(): boolean {
    return this.hasValidMeasures;
  }

  /**
   * Current map's zoom
   */
  protected get zoom(): number {
    return this.googleMaps.map && this.googleMaps.map.getZoom();
  }

  /**
   * Current relation to convert pixels to meters on the map
   */
  getMetersPerPx() {
    if (!this.trackedObject.position || !this.googleMaps.map) return 0;
    return this.googleMaps.getMetersPerPx(this.trackedObject.position.lat());
  }

  /**
   * Checks if object is on screen and renders/unrenders it
   */
  protected checkRenderObject() {
    let isPolygonOnScreen = false;
    const path = this.polygon && this.polygon.getPath();
    if (path.getArray().length) {
      const bounds = this.googleMaps.map.getBounds();
      path.forEach(p => isPolygonOnScreen = isPolygonOnScreen || bounds && bounds.contains(p));
    }

    if (isPolygonOnScreen) {
      this.dotMarker.setVisible(true);
      this.polygon.setVisible(true);
      this.vectorLine.setVisible(true);
    } else {
      this.dotMarker.setVisible(false);
      this.polygon.setVisible(false);
      this.vectorLine.setVisible(false);
    }
  }

  protected clearEventListeners() {
    this.hoverPolygonListeners.forEach(l => l.remove());
    this.hoverPolygonListeners = [];
    this.hoverDotListeners.forEach(l => l.remove());
    this.hoverDotListeners = [];
  }

  protected setupEventListeners() {

    const showPolygon = (this.canDrawPolygon && this.zoom >= LOD.scaleTriangle) || (this.isMoving && this.zoom < LOD.scaleTriangle);

    if (showPolygon) {

      // Add listeners for polygon, not do
      if (this.hoverPolygonListeners.length < 1) {
        this.clearEventListeners();
        this.hoverPolygonListeners.push(
          this.polygon.addListener('mouseover', () => this.onMouseOver()),
          this.polygon.addListener('mouseout', () => this.onMouseOut())
        );
      }
    } else {

      // Add listeners for dot, not polygon
      if (this.hoverDotListeners.length < 1) {
        this.clearEventListeners();
        this.hoverDotListeners.push(
          this.dotMarker.addListener('mouseover', () => this.onMouseOver()),
          this.dotMarker.addListener('mouseout', () => this.onMouseOut())
        );
      }
    }

    // Listen for zoom change
    if (!this.zoomListener)
      this.zoomListener = this.googleMaps.map.addListener('zoom_changed', () => this.onZoomChanged());
  }

  protected initPolygon() {
    if (this.polygon) this.polygon.setMap(null);

    this.polygon = new google.maps.Polygon({
      strokeColor: this.color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: this.color,
      fillOpacity: this.online ? .35 : 0,
      draggable: false
    });

  }

  /**
	 * Returns the series of icons according to the current zoom level
	 */
  protected getSpeedLineIcons() {
    const s = Math.ceil(this.zoom - LOD.scaleTriangle);
    s <= 0 ? 1 : Math.pow(2, s);

    const icons: google.maps.IconSequence[] = [];
    const l = SPEED_UNIT_LENGTH_M * this.scale;
    const dashLength = Math.round(l / this.getMetersPerPx() * .5);
    const skipIconOnFifth = false;

    // Units

    const iconUnits = {
      path: `M 0 0 L 0 ${dashLength}`,
      scale: 1,
      strokeWeight: 2,
      fillOpacity: 1
    };

    const units = Math.round(this.trackedObject.speed);
    for (let i = 1; i <= units; i++) {
      const percent = Math.round(100 / units * i);
      icons.push({
        icon: (i % 5 == 0 && skipIconOnFifth) ? null : iconUnits,
        offset: `${percent}%`
      });
    }

    // Fifths

    const iconFifths = {
      path: `M ${dashLength} ${dashLength / 2} L -${dashLength} ${dashLength / 2}`,
      scale: 1,
      strokeWeight: 2,
    }

    const fifths = Math.floor(units / 5);
    for (let i = 1; i <= fifths; i++) {
      const percent = Math.round(100 / units * 5 * i);
      icons.push({
        icon: iconFifths,
        offset: `${percent}%`
      });
    }

    return icons;
  }

  /**
	 * Initis/updates polyline with icons according to current zoom level
	 */
  protected initSpeedPolyline() {
    if (this.vectorLine) this.vectorLine.setMap(null);

    this.vectorLine = new google.maps.Polyline({
      strokeColor: 'green',
      strokeWeight: 0,
      draggable: false,
      editable: false,
      path: [],
      icons: this.getSpeedLineIcons(),
      map: this.googleMaps.map,
    });

    this.vectorLine.setVisible(false);
  }

  protected initDotaMarker() {
    if (this.dotMarker) this.dotMarker.setMap(null);

    this.dotMarker = new google.maps.Marker({
      position: {
        lat: NaN,
        lng: NaN
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: this.color = this.color,
        fillOpacity: 0.6,
        strokeColor: this.color = this.color,
        strokeOpacity: 0.9,
        strokeWeight: 1,
        scale: 5,
        labelOrigin: new google.maps.Point(0, 5)
      },
      label: this.zoom >= LOD.nameLabels ? this.trackedObject.name : ''
    });

    this.googleMaps.addMarker(this.dotMarker);
  }

  protected getTrianglePath() {
    if (!this.polygon) return [];

    const positionDot = this.trackedObject.position;
    const center = positionDot;
    const h = this.trackedObject.heading || 0;
    const w = 50;
    const l = 100;

    const rear = google.maps.geometry.spherical.computeOffset(center, l / 2 * this.scale, h + 180);
    const rearLeft = google.maps.geometry.spherical.computeOffset(rear, w / 2 * this.scale, h - 90);
    const rearRight = google.maps.geometry.spherical.computeOffset(rear, w / 2 * this.scale, h + 90);
    const tip = google.maps.geometry.spherical.computeOffset(rear, l * this.scale, h);

    return [rear, rearLeft, tip, rearRight];
  }

  protected getVectorLinePath(start: google.maps.LatLng) {
    const l = SPEED_UNIT_LENGTH_M * this.trackedObject.speed;
    const end = google.maps.geometry.spherical.computeOffset(start, l, this.trackedObject.speed);
    return [start, end];
  }

  displayInfowindow(show: boolean) {
    if (!this.infowindow) return;

    if (show) {
      const o = this.trackedObject.position;
      this.infowindow.open(o);
    } else {
      this.infowindow.close();
    }
  }

  drawObject() {
    if (!this.polygon) this.initPolygon();
    if (!this.dotMarker) this.initDotaMarker();
    this.initSpeedPolyline();

    if (!this.trackedObject.position) return;

    this.setupEventListeners();
    const showDot = !this.isMoving;
    const showTriangle = this.isMoving;
    const showSpeedLine = this.drawSpeedVector && this.isMoving && this.zoom >= LOD.speed;

    // Show triangle
    if (showTriangle) {
      const polygonPath = this.getTrianglePath();
      if (polygonPath.length) {
        this.polygon.setOptions({ fillOpacity: this.online ? .35 : 0 });
        this.polygon.setPath(polygonPath);
        this.polygon.setVisible(true);
        this.polygon.setMap(this.googleMaps.map);
      }
    }
    else {
      this.polygon.setVisible(false);
      this.polygon.setMap(null);
    }

    // Draw speed vector
    if (showSpeedLine) {
      const o = this.trackedObject.position;
      const linePath = this.getVectorLinePath(o);
      this.vectorLine.setPath(linePath);
      this.vectorLine.setVisible(true);
      this.vectorLine.setMap(this.googleMaps.map);
    } else {
      this.vectorLine.setVisible(false);
      this.vectorLine.setMap(null);
    }

    // Update dot icon
    const solidDot = this.online || this.canDrawPolygon;
    this.dotMarker.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: this.color,
      fillOpacity: solidDot && showDot ? 0.6 : 0,
      strokeColor: this.color,
      strokeOpacity: showDot ? 0.9 : 0,
      strokeWeight: 1,
      scale: 5,
      labelOrigin: new google.maps.Point(0, 5)
    });
    this.dotMarker.setLabel(this.zoom >= LOD.nameLabels ? this.trackedObject.name : '');
    this.dotMarker.setPosition(this.trackedObject.position);
    this.dotMarker.setMap(this.googleMaps.map);
    this.dotMarker.setVisible(true);
  }

  onMouseOver() {
    this.displayInfowindow(true);
  }

  onMouseOut() {
    this.displayInfowindow(false);
  }

  onZoomChanged() {
    this.drawObject();
  }
}