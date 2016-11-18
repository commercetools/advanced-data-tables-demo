# React Virtualized + FixedDataTable
> Examples of how to combine React Virtualized and FixedDataTable to build a truly flexible and customizable data table in React.

![table in action](https://cl.ly/203l3P1N0u2H/Screen%20Recording%202016-11-17%20at%2011.27%20AM.gif)

## Live Playground
For examples of the table in action, go to https://commercetools.github.io/modern-data-tables-demo/ 👀✨.

OR

To run that demo on your own computer:

```bash
$ git clone git@github.com:commercetools/modern-data-tables-demo.git
$ cd modern-data-tables-demo
$ npm install
$ npm start
$ open http://localhost:9000/
```

## Components
This repository contains some important components that the table is made up of:

- `Table`: composes `CellMeasurer`, `TableMeasurer` and `FixedDataTable`.
- `TableMeasurer`: Is used for providing FixedDataTable with static column width and row height values. Uses CellMeasurer's measuring callbacks to figure out the column widths and row heights of the whole table.
- `BodyCell`: Used for rendering a cell. Decoupled from Table.
- `SortHeaderCell`: Used to render the column header cell when a column is sortable.
