import React, { PropTypes } from 'react'
import loremIpsum from 'lorem-ipsum'
import { storiesOf } from '@kadira/storybook';
import sortBy from 'lodash/sortBy'
import {
  Button,
  FormField,
  FormInput,
  Checkbox,
  Glyph,
  FormRow,
  Row,
  Col,
  Alert,
} from 'elemental'
import Table from '../table/Table';
import '../styles.min.css';

/**
 * Generates a random lorem ipsum string
 * @param  {Boolean} dynamicWidth
 * @param  {Boolean} dynamicHeight
 * @return {String}
 */
const generateValue = ({ dynamicWidth, dynamicHeight }) => {
  let config = {
    count: 1,
    units: 'words'
  }
  if (dynamicWidth) {
    config = {
      count: 1,
      units: 'sentences',
    }
  }
  if (dynamicHeight) {
    config = {
      units: 'paragraphs',
      // 4 paragraphs
      count: Math.round(Math.random() * 10),
      // only one word per sentence
      sentenceUpperBound: 1,
      // only one sentence per paragraph
      paragraphUpperBound: 1,
    }
  }
  if (dynamicHeight && dynamicWidth) {
    config = {
      units: 'paragraphs',
      count: Math.round(Math.random() * 10),
      sentenceUpperBound: 8,
      paragraphUpperBound: 3,
    }
  }
  return loremIpsum(config)
}

/**
 * Generates the table row data according to the column definition
 * @param  {Object} cols
 * @param  {Number} numberOfRows
 * @return {[Object]}
 */
const generateItems = (cols, numberOfRows) =>
  Array.from({ length: numberOfRows }).map(() =>
    cols.reduce((acc, col) => (
      { ...acc, [col.key]: generateValue(col) }
    ), {})
  )

/**
 * This function gets called for every cell in the table (for every row and
 * column combination). Its return value will be rendered as the cell inside the
 * table. It is also used inside CellMeasurer to detect the dimensions of this
 * cell.
 * @param  {Object} item
 * @param  {String} columnKey
 * @return {Node}
 */
const itemRenderer = (item, columnKey) => (
  <div style={{ padding: '10px', whiteSpace: 'pre' }}>
    {item[columnKey]}
  </div>
)

storiesOf('Table', module)
  .add('Full Example', () =>
    (
      <Wrapper>
        {(props) => {
          const {
            numberOfRows, maxHeight, cols, items, onSortChange, sortKey,
            sortDir, handleColumnResize, width, measurementResetter,
          } = props
          if (!cols) return null
          return (
            <Table
              maxHeight={maxHeight}
              columns={cols}
              rowCount={numberOfRows}
              itemRenderer={({ rowIndex, columnKey }) =>
                itemRenderer(items[rowIndex], columnKey)
              }
              onSortChange={onSortChange}
              sortBy={sortKey}
              sortDirection={sortDir}
              onColumnResize={handleColumnResize}
              width={width}
              measurementResetter={measurementResetter}
            />
          )
        }}
      </Wrapper>
    )
  )

const defaultColProps = {
  isFixed: false,
  dynamicWidth: false,
  dynamicHeight: false,
  isSortable: false,
  isResizable: true,
}

const Wrapper = React.createClass({
  propTypes: {
    children: PropTypes.func.isRequired,
  },
  getInitialState () {
    const cols = [
      { key: 'column-0', label: 'Column 0', ...defaultColProps },
      { key: 'column-1', label: 'Column 1', ...defaultColProps },
    ]
    const numberOfRows = 100
    const items = generateItems(cols, numberOfRows)
    return {
      numberOfRows,
      maxHeight: 500,
      cols,
      width: null,
      items,
      sortedItems: items,
    }
  },
  itemsHaveChanged: false,
  /**
   * Gets called before every render of the Table to find out whether the cells
   * need to be remeasured. If the measurements are not reset the cached cell
   * dimensions will be used.
   * In this demo the measurement cache needs to be reset whenever the dynamic
   * width/height option is en-/disabled on a column
   */
  measurementResetter ({ resetMeasurements }) {
    if (this.itemsHaveChanged) {
      this.itemsHaveChanged = false
      resetMeasurements()
    }
  },
  handleChangeNumberOfRows (e) {
    const numberOfRows = parseInt(e.target.value, 10)
    const items = generateItems(this.state.cols, numberOfRows)
    this.itemsHaveChanged = true
    this.setState({
      items,
      sortedItems: items,
      numberOfRows,
    })
  },
  handleTableDimensionsChange (e) {
    let items = this.state.items
    if (e.target.name === 'numberOfRows')
      items = generateItems(this.state.cols, parseInt(e.target.value, 10))
    this.itemsHaveChanged = true
    this.setState({
      items,
      sortedItems: items,
      [e.target.name]: e.target.value,
    })
  },
  handleTableMaxHeightChange (e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  },
  handleColChange (e, index) {
    let val = e.target.value
    if (typeof this.state.cols[index][e.target.name] === 'boolean')
      val = e.target.checked
    const cols = [
      ...this.state.cols.slice(0, index),
      {
        ...this.state.cols[index],
        [e.target.name]: val,
      },
      ...this.state.cols.slice(index + 1)
    ]
    this.handleApplyCols(cols)
  },
  handleApplyCols (cols) {
    const items = generateItems(cols, this.state.numberOfRows)
    this.itemsHaveChanged = true
    this.setState({
      items,
      sortedItems: items,
      cols,
    })
  },
  handleAddColumn () {
    const { state: { cols } } = this
    const numberOfCols = cols.length
    const newCols = [
      ...cols,
      {
        key: `column-${numberOfCols}`,
        label: `Column ${numberOfCols}`,
        ...defaultColProps,
      },
    ]
    this.handleApplyCols(newCols)
  },
  handleRemoveColumn (index) {
    const { state: { cols } } = this
    this.setState({
      cols: [
        ...cols.slice(0, index),
        ...cols.slice(index + 1),
      ],
    })
  },
  handleColumnResize (width, colKey, allColWidths) {
    const { state: { cols } } = this
    const colIndex = cols.findIndex(col => col.key === colKey)
    const newCols = {
      ...cols.reduce((acc, col, index) => ({
        ...acc,
        [index]: {
          ...col,
          width: allColWidths[col.key],
          flexGrow: 0,
        },
      }), {}),
      [colIndex]: { ...cols[colIndex], width, flexGrow: 0 },
    }
    const totalWidth = Object.values(newCols)
      .reduce((acc, col) => acc + col.width, 0)
    this.setState({
      cols: Object.values(newCols),
      width: totalWidth,
    })
  },
  onSortChange (columnKey, sortDir) {
    const { state: { items } } = this
    const sortedItems = sortBy(items, columnKey)
    if (sortDir === 'DESC')
      sortedItems.reverse()
    this.setState({ sortedItems, sortKey: columnKey, sortDir })
  },
  render () {
    const {
      onSortChange, handleColumnResize, measurementResetter,
      state: {
        numberOfRows, maxHeight, cols, sortedItems, sortKey,
        sortDir, width,
      },
    } = this
    return (
      <div style={{ padding: '16px' }}>
        <Row>
          <Col lg="30%" md="40%" sm="100%">
            <div style={{
              padding: '8px 0 0', display: 'inline-block',
            }}>
              <h3>{'Table Dimensions Settings'}</h3>
              <FormRow>
                <FormField label="Number of Rows" width="one-half">
                  <FormInput
                    type="number"
                    name="numberOfRows"
                    value={numberOfRows}
                    onChange={this.handleTableDimensionsChange}
                  />
                </FormField>
                <FormField label="Max Table Height" width="one-half">
                  <FormInput
                    type="number"
                    name="maxHeight"
                    value={maxHeight}
                    onChange={this.handleTableDimensionsChange}
                  />
                </FormField>
              </FormRow>
            </div>
            <div>
              <h3>{'Columns Definition'}</h3>
              {cols.map((col, colIndex) => (
                <div key={colIndex} style={{
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  padding: '10px',
                  margin: `0 0 ${colIndex < cols.length - 1 ? '8px' : 0} 0`,
                  position: 'relative',
                }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      zIndex: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => this.handleRemoveColumn(colIndex)}
                  >
                    <Glyph
                      icon="x"
                      type="danger"
                    />
                  </div>
                  <FormField label="Column Label">
                    <FormInput
                      name="label"
                      value={col.label}
                      onChange={e => this.handleColChange(e, colIndex)}
                    />
                  </FormField>
                  <div className="inline-controls">
                    <Checkbox
                      name="isFixed"
                      label="Fixed"
                      checked={col.isFixed}
                      onChange={e => this.handleColChange(e, colIndex)}
                    />
                    <Checkbox
                      name="isSortable"
                      label="Sortable"
                      checked={col.isSortable}
                      onChange={e => this.handleColChange(e, colIndex)}
                    />
                    <Checkbox
                      name="dynamicWidth"
                      label="Dynamic Width"
                      checked={col.dynamicWidth}
                      onChange={e => this.handleColChange(e, colIndex)}
                    />
                    <Checkbox
                      name="dynamicHeight"
                      label="Dynamic Height"
                      checked={col.dynamicHeight}
                      onChange={e => this.handleColChange(e, colIndex)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 0' }}>
              <Button onClick={this.handleAddColumn}>
                <span>{'Add Column'}</span>
              </Button>
            </div>
          </Col>
          <Col lg="70%" md="60%" sm="100%">
            <h3>{'Table'}</h3>
            {this.props.children({
              numberOfRows: parseInt(numberOfRows, 10),
              maxHeight: parseInt(maxHeight, 10),
              cols,
              items: sortedItems,
              onSortChange,
              sortKey,
              sortDir,
              handleColumnResize,
              width,
              measurementResetter,
            })}
          </Col>
        </Row>
      </div>
    )
  },
})
