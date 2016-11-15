import React, { PropTypes } from 'react'
import { Cell } from 'fixed-data-table-2'
import omit from 'lodash/omit'

export const SortTypes = {
  ASC: 'ASC',
  DESC: 'DESC',
}

function reverseSortDirection (sortDirection) {
  return sortDirection === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC
}

const SortHeaderCell = React.createClass({
  propTypes: {
    onSortChange: PropTypes.func,
    columnKey: PropTypes.string.isRequired,
    sortDirection: PropTypes.string,
    children: PropTypes.any,
  },
  onSortChange (e) {
    const { props: { onSortChange, columnKey, sortDirection } } = this
    e.preventDefault()

    if (onSortChange)
      onSortChange(
        columnKey,
        reverseSortDirection(sortDirection)
      )
  },
  renderSortDir (sortDirection) {
    return sortDirection === SortTypes.DESC ? '↓' : '↑'
  },
  render () {
    const {
      onSortChange, renderSortDir,
      props: { sortDirection, children, ...props },
    } = this
    return (
      <Cell
        {...omit(props, 'onSortChange')}
        onClick={onSortChange}
      >
        {children} {sortDirection ? renderSortDir(sortDirection) : ''}
      </Cell>
    )
  },
})

export default SortHeaderCell
