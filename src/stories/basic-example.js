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
      name: 'Camilo Jimenez',
      role: 'Team lead',
      nationality: 'Australian',
      age: 12,
      ':-)': '🏄🏾',
    }, {
      name: 'Jennifer Wong',
      role: 'UX Designer',
      nationality: 'American',
      age: 11,
      ':-)': '🐶',
    }, {
      name: 'Adnan Asani',
      role: 'Developer',
      nationality: 'Swedish',
      age: 14,
      ':-)': '🍹',
    }, {
      name: 'Josh Bones',
      role: 'Developer',
      nationality: 'Australian',
      age: 12,
      ':-)': '🤘🏻',
    }, {
      name: 'Sven Heckler',
      role: 'UI Designer',
      nationality: 'German',
      age: 10,
      ':-)': '🏋',
    }, {
      name: 'Luis Gomes',
      role: 'Developer',
      nationality: 'Brazilian',
      age: 9,
      ':-)': '🏋🏾',
    }, {
      name: 'Nicola Molinari',
      role: 'Developer',
      nationality: 'Italian',
      age: 11,
      ':-)': '🏀',
    }, {
      name: 'Dominik Ferber',
      role: 'Developer',
      nationality: 'German',
      age: 4,
      ':-)': '🗺',
    }, {
      name: 'Philipp Sporrer',
      role: 'Developer',
      nationality: 'German',
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
