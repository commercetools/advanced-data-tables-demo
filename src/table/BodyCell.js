import React, { PropTypes } from 'react'
import { Cell } from 'fixed-data-table-2'

const BodyCell = ({
  rowIndex,
  columnKey,
  itemRenderer,
  isClickable,
  height,
  width,
}) => (
  <Cell>
    {itemRenderer({ rowIndex, columnKey, height, width })}
  </Cell>
)

BodyCell.propTypes = {
  rowIndex: PropTypes.number.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  columnKey: PropTypes.string.isRequired,
  itemRenderer: PropTypes.func.isRequired,
  isClickable: PropTypes.bool,
}

export default BodyCell
