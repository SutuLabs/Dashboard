<template>
  <div class="home">
    <div class="block">
      <b-tabs>
        <b-tab-item>
          <template #header>
            <span>
              转账
            </span>
          </template>
          <div class="card">
            <div class="card-content">
              <b-field horizontal label="转账">
                <b-select placeholder="选择对象" v-model="target">
                  <option v-for="option in receivers" :value="option.address" :key="option.address">
                    {{ option.name }}
                  </option>
                </b-select>
              </b-field>

              <b-field horizontal label="金额">
                <b-input name="amount" type="text" v-model="amount"></b-input>
              </b-field>

              <b-field horizontal>
                <p class="control">
                  <b-button label="转账" type="is-primary" @click="preTransfer" />
                </p>
              </b-field>

              <b-field v-if="showVerification" horizontal label="验证码">
                <b-input name="vcode" expanded v-model="vcode"></b-input>
                <p class="control">
                  <b-button type="is-success" label="确认转账" @click="transfer" />
                </p>
              </b-field>
            </div>
          </div>
        </b-tab-item>
        <b-tab-item>
          <template #header>
            <span>
              转账对象管理
            </span>
          </template>
          <div class="card">
            <div class="card-content">
              <b-table :data="receivers" :mobile-cards="true" detail-key="address" narrowed striped hoverable focusable>
                <b-table-column field="name" label="名字" sortable v-slot="props">
                  {{ props.row.name }}
                </b-table-column>

                <b-table-column field="address" label="地址" sortable v-slot="props">
                  {{ props.row.address }}
                </b-table-column>

                <b-table-column field="address" label="操作" sortable v-slot="props">
                  <b-button @click="delete props.row.address">delete</b-button>
                </b-table-column>
              </b-table>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <b-field horizontal label="名字">
                <b-input name="name" expanded></b-input>
              </b-field>

              <b-field horizontal label="地址">
                <b-input name="address" placeholder="xch111......" expanded></b-input>
              </b-field>

              <b-field horizontal>
                <p class="control">
                  <b-button label="创建转账对象" type="is-primary" />
                </p>
              </b-field>
            </div>
          </div>
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import getInfo from '@/services/getInfo'

interface IReceiver {
  id: string,
  name: string,
  address: string,
}

@Component({
  components: {
  },
})
export default class Transfer extends Vue {
  username = localStorage.getItem("username")
  receivers: IReceiver[] = [];
  showVerification = false;
  vcode = '';
  amount = 0;
  target = '';

  mounted() {
    this.refresh();
  }

  refresh() {
    getInfo.getChiaPrice()
      .then(response => response.json())
      .then(json => {
        let price = json
      });
    getInfo.getPublicInfo("farmer")
      .then(response => response.json())
      .then(json => {
        let hh = json;

      });
  }

  delete(address: string) {

    let d = ''
  }

  preTransfer() {
    console.log(this.amount, this.target);
    if (this.amount < 0 || !this.target) return;
    this.showVerification = true;
  }

  transfer() {
    let d = ''
  }

}
</script>
