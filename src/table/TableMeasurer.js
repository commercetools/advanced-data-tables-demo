import React, { PropTypes } from 'react'
import deepEqual from 'deep-equal'

/**
 * This component is meant to get its' props from react-virtualized's
 * CellMeasurer component CellMeasurer provides getRowHeight and getColumnWidth
 * to calculate the dimensions of a given row/column. Since these functions also
 * do some rendering internally we cannot call them in a render cycle of our
 * own. This component waits for our render cycle to complete and then
 * calculates all row/col dimensions and writes them to a static array. The
 * values can then be used in the child function to set the dimensions of the
 * table.
 */

const TableMeasurer = React.createClass({
  propTypes: {
    children: PropTypes.any,
    getRowHeight: PropTypes.func,
    getColumnWidth: PropTypes.func,
    rowCount: PropTypes.number,
    colCount: PropTypes.number,
    // measurement resetting
    measurementResetter: PropTypes.func,
    resetMeasurements: PropTypes.func,
    resetMeasurementForColumn: PropTypes.func,
    resetMeasurementForRow: PropTypes.func,
  },
  calcRowHeight ({ getRowHeight, rowCount }) {
    if (!getRowHeight) return null
    const heights = Array.from({ length: rowCount })
      .map((row, index) => {
        const height = getRowHeight({ index })
        // in unit tests getColumnWidth returns NaN
        return Number.isNaN(height) ? 0 : height
      })
    const height = heights.reduce((acc, h) => acc + h, 0)
    return { height, heights }
  },
  calcColumnWidths ({ colCount, getColumnWidth }) {
    if (!getColumnWidth) return null
    const widths = Array.from({ length: colCount })
      .map((col, index) => {
        const width = getColumnWidth({ index })
        // in unit tests getColumnWidth returns NaN
        return Number.isNaN(width) ? 0 : width
      })
    const width = widths.reduce((acc, w) => acc + w, 0)
    return { widths, width }
  },
  componentDidMount () {
    // force rerender, even if we just rendered already
    // As also explained above, it is neccessary to wait for the first
    // render cycle to complete before calculating cell dimensions
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({
      ...this.calcRowHeight(this.props),
      ...this.calcColumnWidths(this.props),
    })
  },
  componentWillReceiveProps (props) {
    if (props.measurementResetter)
      props.measurementResetter({
        resetMeasurements: props.resetMeasurements,
        resetMeasurementForColumn: props.resetMeasurementForColumn,
        resetMeasurementForRow: props.resetMeasurementForRow,
      })
    const { height, heights } = this.calcRowHeight(props) || this.state
    const { width, widths } = this.calcColumnWidths(props) || this.state
    if (
      this.state.height !== height ||
      this.state.width !== width ||
      // It is important to check whether there has been a shift
      // of position of the widths (or change of value)
      // due to column-resize and due to
      // column-shifting from the <ColumnSelector /> component!
      !deepEqual(this.state.widths, widths) ||
      !deepEqual(this.state.heights, heights)
    )
      this.setState({ height, heights, width, widths })
  },
  getInitialState () {
    const { props: { colCount, rowCount } } = this
    const initialWidths = Array.from({ length: colCount }).map(() => 0)
    const initialHeights = Array.from({ length: rowCount }).map(() => 0)
    return {
      heights: initialHeights,
      height: 0,
      widths: initialWidths,
      width: 0,
    }
  },
  render () {
    const {
      props: { children },
      state: { heights, height, widths, width },
    } = this
    return children({ heights, height, widths, width })
  },
})

export default TableMeasurer
