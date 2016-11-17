import React from 'react';
import { storiesOf } from '@kadira/storybook';
import Table from '../table/Table';

const itemRenderer = (item, key) => (
  <div style={{ padding: '10px' }}>
    {item[key]}
  </div>
)

storiesOf('Table', module)
  .add('Basic Example', () => {
    const columns = [{
      key: 'name',
      label: 'Name',
    }, {
      key: 'role',
      label: 'Role',
    }, {
      key: 'nationality',
      label: 'Nationality',
    }, {
      key: 'age',
      label: 'Age',
      align: 'right',
    }, {
      key: ':-)',
      label: ':-)',
      align: 'center',
    }]
    const rows = [{
      name: 'Rochelle	Graham',
      role: 'Team lead',
      nationality: 'American',
      age: 12,
      ':-)': '🏄🏾',
    }, {
      name: 'Byron	Lowe',
      role: 'UX Designer',
      nationality: 'French',
      age: 11,
      ':-)': '🐶',
    }, {
      name: 'Mildred	Lindsey',
      role: 'Developer',
      nationality: 'Finnish',
      age: 14,
      ':-)': '🍹',
    }, {
      name: 'Tabitha	Horton',
      role: 'Developer',
      nationality: 'Australian',
      age: 12,
      ':-)': '🤘🏻',
    }, {
      name: 'Stephen	Hayes',
      role: 'UI Designer',
      nationality: 'German',
      age: 10,
      ':-)': '🏋',
    }, {
      name: 'Kerry	Long',
      role: 'Developer',
      nationality: 'Portuguese',
      age: 9,
      ':-)': '🏋🏾',
    }, {
      name: 'Bill	Green',
      role: 'Developer',
      nationality: 'Italian',
      age: 11,
      ':-)': '🏀',
    }, {
      name: 'Courtney	Wilson',
      role: 'Developer',
      nationality: 'Polish',
      age: 4,
      ':-)': '🗺',
    }, {
      name: 'Heather	Wilkerson',
      role: 'Developer',
      nationality: 'Romanian',
      age: 7,
      ':-)': '☕️',
    }]
    return (
      <div style={{ padding: '20px' }}>
        <Table
          maxHeight={300}
          columns={columns}
          rowCount={rows.length}
          itemRenderer={
            ({ rowIndex, columnKey }) => itemRenderer(rows[rowIndex], columnKey)
          }
        />
      </div>
    )
  })
