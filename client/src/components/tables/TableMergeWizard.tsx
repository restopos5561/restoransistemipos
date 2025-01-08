import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Grid,
  Paper,
  Stack,
  Box,
  Chip,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { Table as TableType, TableStatus } from '../../types/table.types';

interface TableMergeWizardProps {
  open: boolean;
  onClose: () => void;
  onMerge: (mainTableId: number, tableIdsToMerge: number[]) => Promise<void>;
  mainTable?: TableType;
  availableTables: TableType[];
}

const steps = ['Ana Masa Seçimi', 'Birleştirilecek Masalar', 'Onay'];

const TableMergeWizard: React.FC<TableMergeWizardProps> = ({
  open,
  onClose,
  onMerge,
  mainTable,
  availableTables,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTables, setSelectedTables] = useState<TableType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (activeStep === 2) {
      handleMerge();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedTables([]);
    setError(null);
    onClose();
  };

  const handleTableSelect = (table: TableType) => {
    if (selectedTables.find(t => t.id === table.id)) {
      setSelectedTables(selectedTables.filter(t => t.id !== table.id));
    } else {
      setSelectedTables([...selectedTables, table]);
    }
  };

  const handleMerge = async () => {
    try {
      if (!mainTable) return;
      await onMerge(mainTable.id, selectedTables.map(t => t.id));
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Birleştirme işlemi başarısız oldu');
    }
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        return !!mainTable;
      case 1:
        return selectedTables.length > 0;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography gutterBottom>
              Birleştirme işlemi için ana masayı seçtiniz. Bu masa, birleştirme sonrası aktif kalacak masadır.
            </Typography>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6">
                  {mainTable?.tableNumber}
                </Typography>
                <Chip
                  label={mainTable?.status === TableStatus.IDLE ? 'Boş' : 'Dolu'}
                  color={mainTable?.status === TableStatus.IDLE ? 'success' : 'error'}
                  size="small"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Kapasite: {mainTable?.capacity || '-'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Konum: {mainTable?.location || '-'}
              </Typography>
            </Paper>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography gutterBottom>
              Birleştirilecek masaları seçin. Sadece boş masalar seçilebilir.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {availableTables
                .filter(table => 
                  table.id !== mainTable?.id && 
                  table.status === TableStatus.IDLE &&
                  table.branchId === mainTable?.branchId
                )
                .map(table => (
                  <Grid item xs={12} sm={6} md={4} key={table.id}>
                    <Paper
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: theme => 
                          selectedTables.find(t => t.id === table.id)
                            ? `2px solid ${theme.palette.primary.main}`
                            : '2px solid transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => handleTableSelect(table)}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h6">
                          {table.tableNumber}
                        </Typography>
                        <Chip
                          label="Boş"
                          color="success"
                          size="small"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Kapasite: {table.capacity || '-'}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography gutterBottom>
              Birleştirme işlemini onaylayın. Bu işlem geri alınamaz.
            </Typography>
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Birleştirme Sonrası:
              </Typography>
              <ul>
                <li>Seçilen masalar pasif duruma alınacak</li>
                <li>Ana masanın kapasitesi güncellenecek</li>
                <li>Birleştirilen masalar listede görünmeyecek</li>
              </ul>
            </Alert>

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Ana Masa
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6">
                  {mainTable?.tableNumber}
                </Typography>
                <Chip
                  label="Ana Masa"
                  color="primary"
                  size="small"
                />
              </Stack>
            </Paper>

            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Birleştirilecek Masalar
              </Typography>
              <Grid container spacing={1}>
                {selectedTables.map(table => (
                  <Grid item xs={12} sm={6} key={table.id}>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>
                          {table.tableNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          (Kapasite: {table.capacity || '-'})
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Birleştirme Sonrası Toplam Kapasite
              </Typography>
              <Typography variant="h5">
                {(mainTable?.capacity || 0) + selectedTables.reduce((sum, table) => sum + (table.capacity || 0), 0)}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Masa Birleştirme</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ py: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>İptal</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Geri
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!validateStep()}
        >
          {activeStep === steps.length - 1 ? 'Birleştir' : 'İleri'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableMergeWizard; 