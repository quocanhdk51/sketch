import { HttpErrorResponse } from '@angular/common/http';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { SketchCreateEditDialogComponent } from './../sketch-create-edit-dialog/sketch-create-edit-dialog.component';
import { Sketch } from './../../model/canvas.model';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from './../../service/crud.service';
import { ComponentFixture, fakeAsync, TestBed, async } from '@angular/core/testing';

import { CardComponent } from './card.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../shared/material.module';
import { getElementByCss } from '../../function-common/testing.common';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

const createSpyObj = jasmine.createSpyObj;

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let crudServiceMock: CrudService;
  let routerMock: Router;
  let toastSvMock: ToastrService;
  let dialogMock: MatDialog;
  let dialogRefSpyObj = {
    afterClosed: () => of(true),
  };
  let loader: HarnessLoader;

  let sketchMock: Sketch = {
    id: 0,
    name: 'Name Mock',
    imageURL: 'Image URL Mock',
    background: 'Background Mock',
    width: 0,
    height: 0
  }

  beforeEach(async () => {
    crudServiceMock = createSpyObj(
      'CrudService',
      [
        'deleteSketch'
      ]
    );
    routerMock = createSpyObj(
      'Router',
      [
        'navigate'
      ]
    );
    toastSvMock = createSpyObj(
      'ToastrService',
      [
        'success',
        'error'
      ]
    );
    dialogMock = createSpyObj(
      'MatDialog',
      [
        'open'
      ]
    );

    await TestBed.configureTestingModule({
      declarations: [
        CardComponent
      ],
      imports: [
        MaterialModule,
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: CrudService,
          useValue: crudServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: ToastrService,
          useValue: toastSvMock
        },
        {
          provide: MatDialog,
          useValue: dialogMock
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.sketch = sketchMock;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    (dialogMock.open as jasmine.Spy).and.returnValue(dialogRefSpyObj);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getImageURL', () => {
    expect(component.getImageSrc(sketchMock)).toEqual(sketchMock.imageURL as string);
  });

  it('should handle onCardClick', () => {
    let card = getElementByCss(fixture, '.card');
    card.nativeElement.click();
    expect(routerMock.navigate).toHaveBeenCalledWith(
      [
        '/whiteboard',
        {
          id: sketchMock.id
        }
      ]
    );
  });

  it('should display more-menu button and display 2 menu item on show', async () => {
    const menu = await loader.getHarness(MatMenuHarness.with({
      selector: `[data-testid="moreBtn"]`
    }));
    expect(menu).toBeTruthy();
    await menu.open();
    expect((await menu.getItems()).length).toBe(2);
  });

  it('should handle onEditSketch', async () => {
    spyOn(component.onEventSuccess, 'emit').and.callThrough;
    const menu = await loader.getHarness(MatMenuHarness.with({
      selector: `[data-testid="moreBtn"]`
    }));
    await menu.open();
    const [edit] = await menu.getItems({selector: `[data-testid="editBtn"]`});
    expect(edit).toBeTruthy();
    await edit.click();
    expect(dialogMock.open).toHaveBeenCalledWith(
      SketchCreateEditDialogComponent,
      {
        data: {
          isCreating: false,
          sketch: sketchMock
        }
      }
    );
    expect(component.onEventSuccess.emit).toHaveBeenCalled();
    expect(toastSvMock.success).toHaveBeenCalled();
  });

  it('should handle deleteSketch', async () => {
    const menu = await loader.getHarness(MatMenuHarness.with({
      selector: `[data-testid="moreBtn"]`
    }));
    await menu.open();
    const [del] = await menu.getItems({selector: `[data-testid="deleteBtn"]`});
    await del.click();
    expect(dialogMock.open).toHaveBeenCalledWith(
      DeleteConfirmationComponent
    );
  });

  it('should handle successful deleting sketch', async () => {
    spyOn(component.onEventSuccess, 'emit').and.callThrough;
    (crudServiceMock.deleteSketch as jasmine.Spy).and.returnValue(of(true));
    const menu = await loader.getHarness(MatMenuHarness.with({
      selector: `[data-testid="moreBtn"]`
    }));
    await menu.open();
    const [del] = await menu.getItems({selector: `[data-testid="deleteBtn"]`});
    await del.click();
    expect(component.onEventSuccess.emit).toHaveBeenCalled();
  });

  it('should handle error deleting sketch',async () => {
    const errorMessage = 'Error Message Mock';
    (crudServiceMock.deleteSketch as jasmine.Spy).and.returnValue(throwError({
      error: {
        message: errorMessage
      } as HttpErrorResponse
    }));
    const menu = await loader.getHarness(MatMenuHarness.with({
      selector: `[data-testid="moreBtn"]`
    }));
    await menu.open();
    const [del] = await menu.getItems({selector: `[data-testid="deleteBtn"]`});
    await del.click();
    expect(toastSvMock.error).toHaveBeenCalledWith(errorMessage);
  })
});
