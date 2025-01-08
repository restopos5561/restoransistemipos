import React from 'react';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridToolbar,
  trTR,
} from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

interface TableProps extends Omit<DataGridProps, 'columns'> {
  columns: GridColDef[];
  loading?: boolean;
  error?: string;
  showToolbar?: boolean;
}

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 'none',
  backgroundColor: theme.palette.background.paper,
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
  },
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiDataGrid-toolbar': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  '& .MuiDataGrid-footerContainer': {
    borderTop: `1px solid ${theme.palette.grey[200]}`,
  },
}));

const Table: React.FC<TableProps> = ({
  columns,
  rows,
  loading = false,
  error,
  showToolbar = false,
  ...props
}) => {
  return (
    <Card>
      <StyledDataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        components={{
          Toolbar: showToolbar ? GridToolbar : undefined,
        }}
        localeText={trTR.components.MuiDataGrid.defaultProps.localeText}
        disableColumnMenu
        disableRowSelectionOnClick
        autoHeight
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10, 25, 50]}
        {...props}
      />
    </Card>
  );
};

export default Table; 