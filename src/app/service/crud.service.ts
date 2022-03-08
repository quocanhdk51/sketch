import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sketch } from '../model/canvas.model';
import { SketchUpdateBackgroundRequest, SketchUpdateImageRequest, SketchUpdateNameRequest, SketchUpdateSizeRequest } from '../model/sketch-request.model';
import { Page } from '../model/paging.model';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(private http: HttpClient) { }

  public getAllSketches(): Observable<Sketch[]> {
    const url = environment.config.appURL;
    return this.http.get<Sketch[]>(url);
  }

  public getAllSketchesByPaging(page: number, size: number): Observable<Page<Sketch>> {
    const url = environment.config.appURL + `paging?page=${page}&size=${size}`;
    return this.http.get<Page<Sketch>>(url);
  }

  public searchForSketch(name: string): Observable<Sketch[]> {
    const url = environment.config.appURL + `search?name=${name}`;
    return this.http.get<Sketch[]>(url);
  }

  public searchForSketchByPaging(
    name: string,
    page: number,
    size: number
  ): Observable<Page<Sketch>> {
    const url = environment.config.appURL + `search/paging?name=${name}&page=${page}&size=${size}`;
    return this.http.get<Page<Sketch>>(url);
  }

  public getSketch(id: number): Observable<Sketch> {
    const url = environment.config.appURL + `${id}`;
    return this.http.get<Sketch>(url);
  }

  public saveNewSketch(sketch: Sketch): Observable<Sketch> {
    const url = environment.config.appURL;
    return this.http.post<Sketch>(url, sketch);
  }

  public updateSketch(sketch: Sketch): Observable<Sketch> {
    const url = environment.config.appURL;
    return this.http.put<Sketch>(url, sketch);
  }

  public updateSketchName(request: SketchUpdateNameRequest): Observable<Sketch> {
    const url = environment.config.appURL + "/name";
    return this.http.put<Sketch>(url, request);
  }

  public updateSketchImage(request: SketchUpdateImageRequest): Observable<Sketch> {
    const url = environment.config.appURL + "/image";
    return this.http.put<Sketch>(url, request);
  }

  public updateSketchBackground(request: SketchUpdateBackgroundRequest): Observable<Sketch> {
    const url = environment.config.appURL + "/background";
    return this.http.put<Sketch>(url, request);
  }

  public updateSketchSize(request: SketchUpdateSizeRequest): Observable<Sketch> {
    const url = environment.config.appURL + "/size";
    return this.http.put<Sketch>(url, request);
  }

  public deleteSketch(id: number): Observable<Sketch> {
    const url = environment.config.appURL + `${id}`;
    return this.http.delete<Sketch>(url);
  }
}
