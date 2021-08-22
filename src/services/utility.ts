import {
  NotificationProgrammatic as Notification,
} from 'buefy'

export default {
  copy(copyText: string) {
    const textArea = document.createElement("textarea");
    textArea.value = copyText;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      Notification.open({
        message: `拷贝成功: ${copyText}`,
        type: 'is-success'
      })
    } catch (err) {
      Notification.open({
        message: '拷贝成功失败',
        type: 'is-danger'
      })
    }

    document.body.removeChild(textArea);
  },
}