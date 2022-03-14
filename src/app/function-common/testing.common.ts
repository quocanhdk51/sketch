import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export const getElementByCss = (
  fixture: ComponentFixture<any>,
  css: string
): DebugElement => {
  return fixture.debugElement.query(By.css(css));
};
