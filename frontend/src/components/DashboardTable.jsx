import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Checkbox,
  IconButton,
  Typography,
  Box,
  Toolbar,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Delete,
  Edit,
  FilterList,
  MoreVert,
  GetApp,
  Visibility,
  Search,
} from '@mui/icons-material';

const DashboardTable = ({
  columns,
  data,
  loading = false,
  selectable = false,
  actions = true,
  onEdit,
  onDelete,
  onView,
  onRowClick,
  selectedRows,
  setSelectedRows,
  customActions,
  hideActions = false,
  stickyHeader = true,
  dense = false,
  className = '',
  emptyMessage = 'No data available',
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => row.id);
      setSelectedRows(newSelected);
      return;
    }
    setSelectedRows([]);
  };

  const handleRowSelect = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const handleActionsClick = (event, row) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedRow(row);
  };

  const handleActionsClose = () => {
    setActionMenuAnchor(null);
    setSelectedRow(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id) => selectedRows.indexOf(id) !== -1;

  const renderCellContent = (column, row) => {
    if (column.render) {
      return column.render(row[column.field], row);
    }

    if (column.type === 'status') {
      return (
        <Chip
          label={row[column.field]}
          color={column.getColor ? column.getColor(row[column.field]) : 'default'}
          size="small"
        />
      );
    }

    if (column.type === 'date') {
      return new Date(row[column.field]).toLocaleDateString();
    }

    return row[column.field];
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center p-8">
        <CircularProgress />
      </Box>
    );
  }

  if (!data.length) {
    return (
      <Box className="flex items-center justify-center p-8 text-gray-500">
        {emptyMessage}
      </Box>
    );
  }

  return (
    <Paper className={`overflow-hidden ${className}`}>
      {(selectable || customActions) && (
        <Toolbar className="px-6 py-4 bg-gray-50">
          {selectedRows?.length > 0 ? (
            <Typography color="inherit" variant="subtitle1" className="flex-1">
              {selectedRows.length} selected
            </Typography>
          ) : (
            <Typography variant="h6" className="flex-1">
              {selectedRows?.length} selected
            </Typography>
          )}

          {selectedRows?.length > 0 && customActions}
        </Toolbar>
      )}

      <TableContainer>
        <Table size={dense ? 'small' : 'medium'} stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 && selectedRows.length < data.length
                    }
                    checked={selectedRows.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sortDirection={orderBy === column.field ? order : false}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.field}
                      direction={orderBy === column.field ? order : 'asc'}
                      onClick={() => handleSort(column.field)}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}
              {!hideActions && actions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = selectable && isSelected(row.id);

                return (
                  <TableRow
                    hover
                    onClick={(event) => {
                      if (selectable) {
                        handleRowSelect(row.id);
                      } else if (onRowClick) {
                        onRowClick(row);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id || index}
                    selected={isItemSelected}
                    className={onRowClick ? 'cursor-pointer' : ''}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || 'left'}
                        className={column.cellClassName}
                      >
                        {renderCellContent(column, row)}
                      </TableCell>
                    ))}
                    {!hideActions && actions && (
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleActionsClick(event, row);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionsClose}
      >
        {onView && (
          <MenuItem
            onClick={() => {
              onView(selectedRow);
              handleActionsClose();
            }}
          >
            <Visibility className="mr-2" /> View
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem
            onClick={() => {
              onEdit(selectedRow);
              handleActionsClose();
            }}
          >
            <Edit className="mr-2" /> Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={() => {
              onDelete(selectedRow);
              handleActionsClose();
            }}
          >
            <Delete className="mr-2" /> Delete
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default DashboardTable;
