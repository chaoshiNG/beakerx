/*
 *  Copyright 2018 TWO SIGMA OPEN SOURCE, LLC
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { BeakerXDataGrid } from "../BeakerXDataGrid";
import DataGridColumn from "./DataGridColumn";
import {selectColumnPosition, selectColumnWidth} from "./selectors";
import {DataGridHelpers} from "../dataGridHelpers";
import getEventKeyCode = DataGridHelpers.getEventKeyCode;
import {KEYBOARD_KEYS} from "../event/enums";
import {Widget} from "@phosphor/widgets";
import throttle = DataGridHelpers.throttle;

export default class ColumnFilter {
  dataGrid: BeakerXDataGrid;
  column: DataGridColumn;
  filterWidget: Widget;
  filterNode: HTMLElement;
  filterIcon: HTMLSpanElement;
  clearIcon: HTMLSpanElement;
  filterInput: HTMLInputElement;
  useSearch: boolean;

  static getColumnNameVarPrefix(columnName: any) {
    return isNaN(columnName) ? '' : 'col_';
  }

  constructor(dataGrid: BeakerXDataGrid, column: DataGridColumn, options: { x, y, width, height }) {
    this.dataGrid = dataGrid;
    this.column = column;

    this.addInputNode(options);
  }

  showSearchInput(shouldFocus: boolean) {
    this.useSearch = true;
    this.filterIcon.classList.remove('fa-filter');
    this.filterIcon.classList.add('fa-search');
    this.showInput(shouldFocus);
  }

  showFilterInput(shouldFocus: boolean) {
    this.useSearch = false;
    this.filterIcon.classList.add('fa-filter');
    this.filterIcon.classList.remove('fa-search');
    this.showInput(shouldFocus);
  }

  hideInput() {
    this.filterWidget.setHidden(true);
    this.filterInput.value = '';
  }

  updateInputNode() {
    this.filterNode.style.width = `${selectColumnWidth(this.dataGrid.store.state, this.column)}px`;
    this.updateInputPosition();
  }

  attach(node: HTMLElement) {
    Widget.attach(this.filterWidget, node);
    this.bindEvents();
  }

  private updateInputPosition() {
    const position = this.column.getPosition();
    const offset = this.dataGrid.getColumnOffset(
      position.value,
      position.region
    );

    this.filterNode.style.left = `${offset}px`;
  }

  private showInput(shouldFocus: boolean): void {
    this.updateInputNode();

    if (this.filterWidget.isVisible) {
      return;
    }

    this.filterWidget.setHidden(false);

    if (shouldFocus) {
      this.filterInput.focus();
    }
  }

  private filterHandler(event: KeyboardEvent) {
    const keyCode = getEventKeyCode(event);

    event.preventDefault();
    event.stopImmediatePropagation();

    if (
      keyCode === KEYBOARD_KEYS.Enter
      || keyCode === KEYBOARD_KEYS.Escape
      || !this.filterInput
    ) {
      return;
    }

    if (this.useSearch) {
      return this.column.search(this.createExpression(this.filterInput.value));
    }

    this.column.filter(this.createExpression(this.filterInput.value));
  }

  private createExpression(value: string) {
    if (this.useSearch) {
      return this.createSearchExpression(value);
    }

    return this.createFilterExpression(value);
  }

  private createFilterExpression(value: any): string {
    return value.replace('$', `${ColumnFilter.getColumnNameVarPrefix(this.column.name)}${this.column.name}`);
  }

  private createSearchExpression(value: any) {
    const expression = `String($).indexOf("${String(value)}") !== -1`;

    return this.createFilterExpression(expression);
  }

  private addInputNode(options: { x, y, width, height }): void {
    this.filterWidget = new Widget();
    this.filterNode = this.filterWidget.node;

    this.filterNode.innerHTML = `<div class="input-clear">
      <span class="fa filter-icon fa-filter"></span>
      <input class="filter-input" type="text" title='filter with an expression with a variable defined for each column and $ means the current column.  eg "$ > 5"'>
      <span class="fa fa-times clear-filter"></span>
    </div>`;

    this.filterNode.classList.add('input-clear-growing');
    this.filterNode.style.width = `${options.width}px`;
    this.filterNode.style.height = `${this.dataGrid.baseRowSize}px`;
    this.filterNode.style.left = `${options.x}px`;
    this.filterNode.style.top = `${options.y}px`;
    this.filterNode.style.position = 'absolute';

    this.filterIcon = this.filterNode.querySelector('.filter-icon') || new HTMLSpanElement();
    this.filterInput = this.filterNode.querySelector('input') || new HTMLInputElement();
    this.clearIcon = this.filterNode.querySelector('.clear-filter') || new HTMLSpanElement();
    this.filterInput.style.height = `${this.dataGrid.baseRowSize}px`;

    this.filterWidget.setHidden(true);
  }

  private bindEvents() {
    const handleMouseDown = (event) => {
      this.dataGrid.setFocus(true);
      event.stopImmediatePropagation();

      if (event.target === this.clearIcon) {
        this.column.columnManager.resetFilters();
      }
    };

    this.filterInput.addEventListener('keyup', throttle(this.filterHandler, 100, this), true);
    this.filterInput.addEventListener('mousedown', handleMouseDown, true);
    this.filterNode.addEventListener('mousedown', handleMouseDown, true);
  }
}
