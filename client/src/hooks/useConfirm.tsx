import React from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const useConfirm = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const [resolveRef, setResolveRef] = React.useState<((value: boolean) => void) | null>(
    null
  );

  const confirm = React.useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setOptions(options);
        setDialogOpen(true);
        setResolveRef(() => resolve);
      }),
    []
  );

  const handleClose = React.useCallback(
    (value: boolean) => {
      setDialogOpen(false);
      resolveRef?.(value);
    },
    [resolveRef]
  );

  const handleCancel = React.useCallback(() => handleClose(false), [handleClose]);
  const handleConfirm = React.useCallback(() => handleClose(true), [handleClose]);

  const ConfirmationDialog = React.useCallback(
    () => (
      <ConfirmDialog
        open={dialogOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [dialogOpen, options, handleConfirm, handleCancel]
  );

  return Object.assign(confirm, {
    ConfirmationDialog,
  });
};

export default useConfirm; 