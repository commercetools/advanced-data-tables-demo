import React from 'react'
import { shallow, mount } from 'enzyme'
import sinon from 'sinon'
import TableMeasurer from './TableMeasurer'

describe('Core::Components::Tables::TableMeasurer', () => {
  it('should return default values if no props are given', () => {
    const renderCallback = sinon.stub().returns(null)
    shallow(<TableMeasurer>{renderCallback}</TableMeasurer>)
    expect(renderCallback.calledOnce).toBe(true)
    expect(renderCallback.args[0][0]).toEqual({
      heights: [], height: 0, widths: [], width: 0,
    })
  })
  it('should calculate row heights', () => {
    const renderCallback = sinon.stub().returns(null)
    const getRowHeight = ({ index }) => 10 * index
    mount(
      <TableMeasurer getRowHeight={getRowHeight} rowCount={5}>
        {renderCallback}
      </TableMeasurer>
    )
    expect(renderCallback.callCount).toBe(2)
    expect(renderCallback.args[1][0]).toEqual({
      heights: [0, 10, 20, 30, 40], height: 100, widths: [], width: 0,
    })
  })
  it('should calculate col widths', () => {
    const renderCallback = sinon.stub().returns(null)
    const getColumnWidth = ({ index }) => 10 * index
    mount(
      <TableMeasurer getColumnWidth={getColumnWidth} colCount={5}>
        {renderCallback}
      </TableMeasurer>
    )
    expect(renderCallback.callCount).toBe(2)
    expect(renderCallback.args[1][0]).toEqual({
      heights: [], height: 0, widths: [0, 10, 20, 30, 40], width: 100,
    })
  })
  it('should calculate col widths and row heights', () => {
    const renderCallback = sinon.stub().returns(null)
    const getColumnWidth = ({ index }) => 10 * index
    const getRowHeight = getColumnWidth
    mount(
      <TableMeasurer
        getColumnWidth={getColumnWidth} colCount={5}
        getRowHeight={getRowHeight} rowCount={5}
      >
        {renderCallback}
      </TableMeasurer>
    )
    expect(renderCallback.callCount).toBe(2)
    expect(renderCallback.args[1][0]).toEqual({
      heights: [0, 10, 20, 30, 40],
      height: 100,
      widths: [0, 10, 20, 30, 40],
      width: 100,
    })
  })

  it('should update when new props are passed', () => {
    const renderCallback = sinon.stub().returns(null)
    const getColumnWidth = ({ index }) => 10 * index
    const getRowHeight = getColumnWidth
    const wrapper = mount(
      <TableMeasurer
        getColumnWidth={getColumnWidth} colCount={5}
        getRowHeight={getRowHeight} rowCount={5}
      >
        {renderCallback}
      </TableMeasurer>
    )
    expect(renderCallback.callCount).toBe(2)
    expect(renderCallback.args[1][0]).toEqual({
      heights: [0, 10, 20, 30, 40],
      height: 100,
      widths: [0, 10, 20, 30, 40],
      width: 100,
    })
    wrapper.setProps({ colCount: 6 })
    expect(renderCallback.callCount).toBe(3)
    expect(renderCallback.args[2][0]).toEqual({
      heights: [0, 10, 20, 30, 40],
      height: 100,
      widths: [0, 10, 20, 30, 40, 50],
      width: 150,
    })
    wrapper.setProps({ rowCount: 6 })
    expect(renderCallback.callCount).toBe(4)
    expect(renderCallback.args[3][0]).toEqual({
      heights: [0, 10, 20, 30, 40, 50],
      height: 150,
      widths: [0, 10, 20, 30, 40, 50],
      width: 150,
    })
  })
  it('should call measurementResetter before rendering', () => {
    const renderCallback = () => null
    const measurementResetter = sinon.spy()
    const resetMeasurements = sinon.spy()
    const resetMeasurementForColumn = sinon.spy()
    const resetMeasurementForRow = sinon.spy()
    const getColumnWidth = ({ index }) => 10 * index
    const getRowHeight = getColumnWidth
    const wrapper = mount(
      <TableMeasurer
        getColumnWidth={getColumnWidth}
        colCount={5}
        getRowHeight={getRowHeight}
        rowCount={5}
        resetMeasurements={resetMeasurements}
        resetMeasurementForColumn={resetMeasurementForColumn}
        resetMeasurementForRow={resetMeasurementForRow}
        measurementResetter={measurementResetter}
      >
        {renderCallback}
      </TableMeasurer>
    )
    expect(measurementResetter.callCount).toBe(0)
    wrapper.setProps({ colCount: 6 })
    expect(measurementResetter.callCount).toBe(1)
    expect(measurementResetter.args[0][0]).toEqual({
      resetMeasurements,
      resetMeasurementForRow,
      resetMeasurementForColumn,
    })
  })

  it('should pass the new widths down to the rendering child', () => {
    const renderCallback = sinon.stub().returns(null)
    const getNumber = ({ index }) => 10 * index
    const wrapper = mount(
      <TableMeasurer
        getColumnWidth={getNumber}
        getRowHeight={getNumber}
        colCount={5}
        rowCount={5}
      >
        {renderCallback}
      </TableMeasurer>
    )

    expect(renderCallback.lastCall.args[0]).toEqual({
      heights: [0, 10, 20, 30, 40],
      height: 100,
      widths: [0, 10, 20, 30, 40],
      width: 100,
    })

    wrapper.setProps({
      // For every indexed value in the array, we return 20
      // this becomes 100
      getColumnWidth: sinon.stub().returns(20),
    })

    const expectedNewState = {
      heights: [0, 10, 20, 30, 40],
      height: 100,
      widths: [20, 20, 20, 20, 20], // different values among the widths
      width: 100, // same total width
    }

    expect(wrapper.state()).toEqual(expectedNewState)
    expect(renderCallback.lastCall.args[0]).toEqual(expectedNewState)
    expect(renderCallback.callCount).toBe(3)
  })
})
/* eslint-enable no-shadow */
