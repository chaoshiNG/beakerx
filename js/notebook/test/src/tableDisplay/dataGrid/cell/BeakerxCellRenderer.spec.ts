/*
 *  Copyright 2017 TWO SIGMA OPEN SOURCE, LLC
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

import * as sinon from 'sinon';
import { expect } from 'chai';
import { BeakerXDataGrid } from "@beakerx/tableDisplay/dataGrid/BeakerXDataGrid";
import {GraphicsContext, TextRenderer} from "@phosphor/datagrid";
import modelStateMock from "../mock/modelStateMock";
import BeakerXCellRenderer from "@beakerx/tableDisplay/dataGrid/cell/BeakerXCellRenderer";
import createStore from "@beakerx/tableDisplay/dataGrid/store/BeakerXDataStore";
import cellConfigMock from "../mock/cellConfigMock";
import cellDataMock from "../mock/cellDataMock";

describe('BeakerXCellRenderer', () => {
  let dataGrid;
  let cellRenderer;
  let dataStore;
  let gc: GraphicsContext;

  before(() => {
    dataStore = createStore(modelStateMock);
    dataGrid = new BeakerXDataGrid({}, dataStore);

    gc = new GraphicsContext(dataGrid['_canvasGC']);

    gc['_context'].fillText = () => {};
    cellRenderer = new BeakerXCellRenderer(dataGrid);
  });

  after(() => {
    dataGrid.destroy();
  });

  it('should be an instance of TextRenderer', () => {
    expect(cellRenderer).to.be.an.instanceof(TextRenderer);
  });

  it('should implement drawTextUnderline method', () => {
    expect(cellRenderer).to.have.property('drawTextUnderline');
    expect(cellRenderer.drawTextUnderline).to.be.a('Function');
  });

  it('should not call drawTextUnderline method', () => {
    const stub = sinon.stub(cellRenderer, 'drawTextUnderline');
    gc = new GraphicsContext(dataGrid['_canvasGC']);

    cellRenderer.drawText(gc, cellConfigMock);
    expect(stub.notCalled).to.be.true;

    stub.restore();
  });

  it('should call drawTextUnderline method', () => {
    const stub = sinon.stub(cellRenderer, 'drawTextUnderline');

    dataGrid.cellManager.hoveredCellData = cellDataMock;
    cellRenderer.drawText(gc, cellConfigMock);

    expect(stub.calledOnce).to.be.true;

    stub.restore();
  });
});
