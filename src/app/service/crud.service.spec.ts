import { Sketch } from './../model/canvas.model';
import { environment } from './../../environments/environment';
import {
  HttpClientTestingModule,
  HttpTestingController
} from "@angular/common/http/testing";
import { TestBed } from '@angular/core/testing';

import { CrudService } from './crud.service';
import { Page } from '../model/paging.model';

describe('CrudService', () => {
  let service: CrudService;
  let controller: HttpTestingController;
  const resourceUrl = environment.config.appURL;
  const sketchMock: Sketch = {
    id: 0,
    name: 'Name mock',
    imageURL: 'Image Url mock',
    background: 'Background mock',
    width: 0,
    height: 0
  };
  const pageSketchMock: Page<Sketch> = {
    content: [sketchMock],
    empty: false,
    first: true,
    last: true,
    number: 1,
    numberOfElements: 1,
    pageable: {
      offset: 0,
      pageNumber: 0,
      pageSize: 20,
      paged: true,
      sort: {
        empty: false,
        sorted: true,
        unsorted: false
      },
      unpaged: false
    },
    size: 20,
    sort: {
      empty: false,
      sorted: true,
      unsorted: false
    },
    totalElements: 1,
    totalPages: 1
  };
  const page = 0;
  const size = 20;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        CrudService
      ]
    });
    service = TestBed.inject(CrudService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getAllSketches', () => {
    const response: Sketch[] = [sketchMock];
    let result: Sketch[] | undefined;
    service.getAllSketches().subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should getAllSketchesByPaging', () => {
    const response: Page<Sketch> = pageSketchMock;
    let result: Page<Sketch> | undefined;
    service.getAllSketchesByPaging(page, size).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + `paging?page=${page}&size=${size}`);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should searchForSketch', () => {
    const response: Sketch[] = [sketchMock];
    let result: Sketch[] | undefined;
    service.searchForSketch(sketchMock.name).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + `search?name=${sketchMock.name}`);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should searchForSketchByPaging', () => {
    const response: Page<Sketch> = pageSketchMock;
    let result: Page<Sketch> | undefined;
    service.searchForSketchByPaging(sketchMock.name, page, size).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + `search/paging?name=${sketchMock.name}&page=${page}&size=${size}`);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should getSketch', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.getSketch(sketchMock.id as number).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + `${sketchMock.id}`);
    expect(req.request.method).toEqual('GET');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should saveNewSketch', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.saveNewSketch(sketchMock).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl);
    expect(req.request.method).toEqual('POST');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should updateSketch', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.updateSketch(sketchMock).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl);
    expect(req.request.method).toEqual('PUT');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should updateSketchName', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.updateSketchName({
      id: sketchMock.id as number,
      name: sketchMock.name
    }).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + "/name");
    expect(req.request.method).toEqual('PUT');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should updateSketchImage', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.updateSketchImage({
      id: sketchMock.id as number,
      imageURL: sketchMock.imageURL as string
    }).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + "/image");
    expect(req.request.method).toEqual('PUT');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should updateSketchBackground', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.updateSketchBackground({
      id: sketchMock.id as number,
      background: sketchMock.background
    }).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + "/background");
    expect(req.request.method).toEqual('PUT');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should updateSketchSize', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.updateSketchSize({
      id: sketchMock.id as number,
      width: sketchMock.width,
      height: sketchMock.height
    }).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + "/size");
    expect(req.request.method).toEqual('PUT');
    req.flush(response);
    expect(result).toEqual(response);
  });

  it('should deleteSketch', () => {
    const response: Sketch = sketchMock;
    let result: Sketch | undefined;
    service.deleteSketch(sketchMock.id as number).subscribe(
      (val) => result = val
    );
    const req = controller.expectOne(resourceUrl + `${sketchMock.id}`);
    expect(req.request.method).toEqual('DELETE');
    req.flush(response);
    expect(result).toEqual(response);
  });
});
