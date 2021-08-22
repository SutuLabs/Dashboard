import {
  SnackbarProgrammatic as Snackbar,
  DialogProgrammatic as Dialog,
} from 'buefy'

export default {
  confirmAndExecute(options: {
    confirmTitle: string,
    confirmMessage: string,
    confirmType?: 'success' | 'danger',
    workingMessage: string,
    successMessage: string,
    failureMessage: string
  },
    operation: () => Promise<Response>, callback: () => void) {
    Dialog.confirm({
      title: options.confirmTitle,
      message: options.confirmMessage,
      cancelText: '取消',
      confirmText: '确定',
      type: options.confirmType == 'danger' ? 'is-danger' : 'is-success',
      onConfirm: () => {
        const t = Snackbar.open({
          type: 'is-info',
          message: options.workingMessage,
          indefinite: true,
          queue: false
        })
        operation()
          .then(resp => {
            t.close();
            if (resp.ok) {
              Snackbar.open({
                type: 'is-success',
                message: options.successMessage,
                indefinite: true,
                queue: false
              });
              callback();
            } else {
              Snackbar.open({
                type: 'is-danger',
                message: options.failureMessage,
                indefinite: true,
              });
            }
          }).catch(() => {
            t.close();
            Snackbar.open({
              type: 'is-danger',
              message: options.failureMessage,
              indefinite: true,
            });
          });
      }
    })
  }
}