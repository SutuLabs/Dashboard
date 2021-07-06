<template>
  <section>
    <b-field class="columns is-centered">
      <b-upload class="column is-2" v-model="file" drag-drop>
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

    <div class="columns is-centered">
      <div class="column is-1 mb-2 tag is-primary" v-if="file != null">
        {{ file.name | shorten }}
        <button class="delete is-small" type="button" @click="deleteDropFile"></button>
      </div>

    </div>
    <div class="columns is-centered">
      <b-button class="column is-1" v-on:click="submitFiles()">确认上传</b-button>
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

@Component({
  filters: {
    shorten: function (value: string, len = 15) {
      if (!value) return ''
      let padding = '...';
      let left = Math.ceil((len - padding.length) / 2);
      let right = len - padding.length - left;
      return value.length >= len ? value.substr(0, left) + padding + value.substr(-right) : value;
    },
  },
})
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