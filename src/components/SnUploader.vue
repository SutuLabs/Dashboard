<template>
  <section>
    <b-field>
      <b-upload v-model="file" drag-drop>
        <section class="section">
          <div class="content has-text-centered">
            <p>
              <img src="../../public/img/icons8-upload-to-cloud-100.png" />
            </p>
            <p>请上传.csv格式文件</p>
          </div>
        </section>
      </b-upload>
    </b-field>

    <div class="tags">
      <span v-if="file != null" class="tag is-primary">
        {{ file.name }}
        <button class="delete is-small" type="button" @click="deleteDropFile"></button>
      </span>
    </div>

    <div class="large-12 medium-12 small-12 cell">
      <b-button v-on:click="submitFiles()">确认上传</b-button>
    </div>
  </section>
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
  private file: any = null;
  deleteDropFile() {
    this.file = null
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
}
</script>