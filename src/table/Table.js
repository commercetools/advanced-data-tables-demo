import React, { PropTypes } from 'react'
import { AutoSizer, CellMeasurer } from 'react-virtualized'
import { Table as FixedDataTable, Column, Cell } from 'fixed-data-table-2'
import SortHeaderCell, { SortTypes } from './SortHeaderCell'
import BodyCell from './BodyCell'
import TableMeasurer from './TableMeasurer'
import 'fixed-data-table-2/dist/fixed-data-table.min.css'
import './Table.css'

const HEADER_HEIGHT = 40

const Table = React.createClass({
  propTypes: {
    /* an array of objects describing the tables columns */
    columns: PropTypes.arrayOf(PropTypes.shape({
      /* The unique key of the columns that is used to identify your data. */
      key: PropTypes.string.isRequired,
      /* The horizontal alignment of the table column content */
      align: PropTypes.oneOf(['left', 'center', 'right']),
      /* The label of the column that will be shown in the column header. */
      label: PropTypes.string,
      getLabel: PropTypes.func,
      /* Indicates wether the column should be resizeable. */
      isResizable: PropTypes.bool,
      /**
       * Indicates whether the column should be fixed and stick to the left side
       * so that the other content is scrolled below it.
       */
      isFixed: PropTypes.bool,
      /**
       * Whether clicking on the column header will sort the column.
       * Will call the onSortChange callback and respond to sortBy and
       * sortDirection changes.
       * Only the column whose key is equal to sortBy will be shown as sorted,
       * which means that the table only supports single column sorting.
       */
      isSortable: PropTypes.bool,
      /**
       * The grow factor relative to other columns. Basically, take any
       * available extra width and distribute it proportionally according to all
       * columns' flexGrow values.
       * This is also useful, when you want some columns to stick to their
       * width (like a column with actions or checkboxes) and some other columns
       * to take up the rest of the width.
       */
      flexGrow: PropTypes.number,
      /**
       * Sets the width of the column regardless of the cells contents' size.
       * If given, it sets the columns' flexGrow to 0, so that the columns does
       * not extend over the given width.
       * If it is not given, it will set the width to be equal to the widest
       * columns content width. Use this if you don't want any horiontal
       * overflow.
       */
      width: PropTypes.number,
    })).isRequired,
    /**
     * The total number of rows that should displayed in the table
     */
    rowCount: PropTypes.number.isRequired,
    /**
     * Responsible for rendering a cell given an row and column index.
     * Should implement the following interface:
     * ({
     *   rowIndex: number, columnKey: number, height: number, width: number
     * }): PropTypes.node
     */
    itemRenderer: PropTypes.func.isRequired,
    /**
     * The maximum height of the table.
     * If the table's contents are taller than this height, there will be a
     * vertical scrollbar with a sticky column header row
     */
    maxHeight: PropTypes.number,
    /**
     * Function that is called when a sortable column's header is clicked.
     * Required if you set `isSortable` on at least on column.
     * Should implement the following interface:
     * (columnKey: number, sortDirection: string): void
     */
    onSortChange: (props, propName, componentName) => {
      // check if one of the columns is sortable
      const hasSortableColumn = props.columns.some(col => col.isSortable)
      if (hasSortableColumn)
        // check if prop is given and a function
        if (!Object.keys(props).includes(propName))
          return new Error(
            `Prop \`${propName}\` is required if there is at least ` +
            'one column set to `isSortable`.'
          )
      return props[propName] && !(typeof props[propName] === 'function')
        ? new Error(
          `Invalid prop \`${propName}\` supplied to` +
          ` \`${componentName}\`. Validation failed.`
        )
        : null
    },
    /**
     * The key of the column that the data currently sorted by.
     * Only if this prop is provided you will see the corresponding header
     * show the sort indication and direction.
     */
    sortBy: PropTypes.string,
    /**
     * The direction in which sortBy is applied. Allowed values: DESC, ASC
     */
    sortDirection: PropTypes.oneOf(Object.values(SortTypes)),
    /**
     * Function that is called when the user resizes a resizable column.
     * Required if you set `isResizable` on at least on column.
     * Should implement the following interface:
     * (width: number, columnKey: string, allWidths: object): void
     */
    // TODO check if this can be put in a HOC/child as function component
    // since atm the resizing logic needs to be implement in every component
    // that uses this functionality
    onColumnResize: (props, propName, componentName) => {
      // check if one of the columns is sortable
      const hasSortableColumn = props.columns.some(col => col.isResizable)
      if (hasSortableColumn)
        // check if prop is given and a function
        if (!Object.keys(props).includes(propName))
          return new Error(
            `Prop \`${propName}\` is required if there is at least ` +
            'one column set to `isResizable`.'
          )
      return props[propName] && !(typeof props[propName] === 'function')
        ? new Error(
          `Invalid prop \`${propName}\` supplied to` +
          ` \`${componentName}\`. Validation failed.`
        )
        : null
    },
    /**
     * Function that is called when the user clicks a row.
     * Should implement the following interface:
     * (event: object, rowIndex: number): void
     */
    onRowClick: PropTypes.func,
    /**
     * The fixed width that the table should have.
     * If omitted, the table autmatically streches to its containers width.
     * Set this to the sum of all columns widths, if your columns are resized
     * and not as wide as the screen
     */
    width: PropTypes.number,
    /**
     * Function that will be called before the content is measured. As the first
     * param it gets an object with three methods that can be used to reset
     * the cell measurements cache:
     * - `resetMeasurements`: Use this function to clear cached measurements,
     *   which results in **all** cells being remeasured.
     * - `resetMeasurementForColumn(index)`: Use this function to clear cached
     *   measurements for specific column. All cells in this column will be
     *   remeasured.
     * - `resetMeasurementForRow(index)`: Use this function to clear cached
     *   measurements for a specific row. All cells in this row will be
     *   remeasured.
     * Use this functionality to tell the table if your content has changed
     * it's size, so that the table will not read the cell's dimensions from
     * the internal cache, but remeasure the cell's dimensions.
     * Should implement the following interface: (resetters: object): void
     */
    measurementResetter: PropTypes.func,
  },
  columnWidths: [],
  storeColumnWidth (columnKey, width) {
    this.columnWidths[columnKey] = width
  },
  getColumnWidths () {
    return this.columnWidths
  },
  renderColumnHeader (col, { width: colWidth } = {}) {
    const {
      storeColumnWidth,
      props: { onSortChange, sortBy, sortDirection },
    } = this
    if (colWidth)
      storeColumnWidth(col.key, colWidth)
    return (
      col.isSortable ? (
        <SortHeaderCell
          onSortChange={onSortChange}
          columnKey={col.key}
          sortDirection={
            sortBy === col.key ? sortDirection : null
          }
          className="header-cell"
        >
          {col.getLabel ? col.getLabel() : col.label}
        </SortHeaderCell>
      ) : (
        <Cell className="header-cell">
          {col.getLabel ? col.getLabel() : col.label}
        </Cell>
      )
    )
  },
  render () {
    const {
      getColumnWidths, renderColumnHeader,
      props: {
        columns, rowCount, itemRenderer, maxHeight, onColumnResize,
        width: fixedWidth, onRowClick, measurementResetter,
      },
    } = this
    return (
      <AutoSizer disableHeight={true}>
        {({ width }) => (
          <CellMeasurer
            cellRenderer={({ columnIndex, rowIndex }) => {
              if (rowIndex === rowCount)
                return renderColumnHeader(columns[columnIndex])
              const columnKey = columns[columnIndex].key
              return itemRenderer({ rowIndex, columnKey })
            }}
            columnCount={columns.length}
            rowCount={
              // increase the row count by one in order to also measure the
              // dimensions of the column headers, so that a column is at least
              // as wide as it's header
              rowCount + 1
            }
          >
            {({
              getColumnWidth,
              getRowHeight,
              resetMeasurements,
              resetMeasurementForColumn,
              resetMeasurementForRow,
            }) => (
              <TableMeasurer
                getRowHeight={getRowHeight}
                rowCount={rowCount}
                getColumnWidth={getColumnWidth}
                colCount={columns.length}
                resetMeasurements={resetMeasurements}
                resetMeasurementForColumn={resetMeasurementForColumn}
                resetMeasurementForRow={resetMeasurementForRow}
                measurementResetter={measurementResetter}
              >
                {({ widths, heights }) => (
                  <FixedDataTable
                    rowsCount={rowCount}
                    rowHeight={HEADER_HEIGHT}
                    width={fixedWidth ? Math.min(fixedWidth, width) : width}
                    maxHeight={maxHeight}
                    headerHeight={HEADER_HEIGHT}
                    rowHeightGetter={index => heights[index] || HEADER_HEIGHT}
                    onColumnResizeEndCallback={(...args) => {
                      const columnWidths = getColumnWidths()
                      onColumnResize(...args, columnWidths)
                    }}
                    onRowClick={onRowClick}
                    isColumnResizing={false}
                  >
                    {columns.map((col, colIndex) => (
                      <Column
                        key={col.key}
                        columnKey={col.key}
                        align={col.align}
                        isResizable={col.isResizable || false}
                        allowCellsRecycling={true}
                        fixed={col.isFixed}
                        width={col.width || widths[colIndex] || 0}
                        flexGrow={
                          Number.isInteger(col.flexGrow)
                          ? col.flexGrow
                          : 1
                        }
                        header={(...args) => renderColumnHeader(col, ...args)}
                        cell={cellProps => (
                          <BodyCell
                            {...cellProps}
                            itemRenderer={itemRenderer}
                            isClickable={!!onRowClick}
                          />
                        )}
                      />
                    ))}
                  </FixedDataTable>
                )}
              </TableMeasurer>
            )}
          </CellMeasurer>
        )}
      </AutoSizer>
    )
  },
})

export default Table
