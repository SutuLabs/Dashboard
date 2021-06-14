<template>
  <div>
    <div class="large-12 medium-12 small-12 cell">
      <label
        >Files
        <input type="file" id="files" ref="files" v-on:change="handleFilesUpload()" />
      </label>
    </div>
    <div class="large-12 medium-12 small-12 cell">
      <button v-on:click="submitFiles()">Submit</button>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Component,
  Vue,
  Prop
} from 'vue-property-decorator';
import getInfo from '@/services/getInfo';
import {
  SnackbarProgrammatic as Snackbar
} from 'buefy'

@Component
export default class SnUploader extends Vue {
  private file: any;
  $refs!: {
    files: HTMLInputElement
  }

  submitFiles() {
    let formData = new FormData();

    formData.append('file', this.file);

    getInfo.uploadFile(`serial-number`, formData)
      .then(resp => {
        if (resp.ok) {
          Snackbar.open({
            type: 'is-success',
            message: `Uploaded`,
          })
        } else {
          Snackbar.open({
            type: 'is-danger',
            message: `Failed to upload`,
          })
        }
      }).catch(() => {
        Snackbar.open({
          type: 'is-danger',
          message: `Failed to upload`,
        })
      });
  }

  handleFilesUpload() {
    this.file = this.$refs.files.files && this.$refs.files.files[0];
    console.log(this.file, this.$refs.files.files)
  }
}
</script>