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
              <b-field horizontal label="转账" :message="target">
                <b-select placeholder="选择对象" v-model="target">
                  <option v-for="option in receivers" :value="option.address" :key="option.id">
                    {{ option.name }}
                  </option>
                </b-select>
              </b-field>

              <b-field horizontal label="金额" :message="(amount * 1000000000000).toFixed() + ' mojo'">
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
              <b-field>
                <b-button type="is-primary" size="is-small" @click="refreshReceivers">刷新</b-button>
              </b-field>
              <b-table :data="receivers" :mobile-cards="true" narrowed striped hoverable focusable>
                <b-table-column field="name" label="名字" sortable v-slot="props">
                  {{ props.row.name }}
                </b-table-column>

                <b-table-column field="address" label="地址" sortable v-slot="props">
                  {{ props.row.address }}
                </b-table-column>

                <b-table-column field="address" label="操作" sortable v-slot="props">
                  <b-button @click="deleteReceiver(props.row.id)">删除</b-button>
                </b-table-column>
              </b-table>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <b-field horizontal label="名字">
                <b-input name="name" expanded v-model="receiverName"></b-input>
              </b-field>

              <b-field horizontal label="地址">
                <b-input name="address" placeholder="xch111......" expanded v-model="receiverAddress"></b-input>
              </b-field>

              <b-field horizontal>
                <p class="control">
                  <b-button label="创建转账对象" type="is-primary" @click="createReceiver"></b-button>
                </p>
              </b-field>
            </div>
          </div>
        </b-tab-item>
        <b-tab-item>
          <template #header>
            <span>
              钱包管理
            </span>
          </template>
          <div class="card">
            <div class="card-content">
              <b-button type="is-primary" class="is-pulled-right" @click="refreshBalance">刷新</b-button>
              <ul v-if="balance">
                <li>
                  高度: {{ balance.height }}
                  <span v-if="balance.isSynced" class="tag is-info">
                    已同步
                  </span>
                  <span v-else class="tag is-danger">
                    未同步
                  </span>
                </li>
                <li v-if="balance.balance == balance.pending && balance.pending == balance.spendable">
                  余额: {{ balance.balance }}
                </li>
                <li v-else>余额: {{ balance.balance }}/待可用: {{ balance.pending }}/可用: {{ balance.spendable }}</li>
              </ul>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <b-field>
                <b-button type="is-primary" size="is-small" @click="refreshTxs">刷新</b-button>
              </b-field>
              <b-table :data="txs" :mobile-cards="true" narrowed striped hoverable focusable>
                <b-table-column field="name" label="ID" v-slot="props">
                  <b-tooltip :label="props.row.id">
                    <a @click="copy(props.row.id)">{{ props.row.id.slice(2, 10) }}</a>
                  </b-tooltip>
                </b-table-column>
                <b-table-column field="status" label="状态" sortable v-slot="props">
                  {{ props.row.status }}
                </b-table-column>
                <b-table-column field="amount" label="数量" sortable v-slot="props">
                  {{ props.row.amount }}
                </b-table-column>
                <b-table-column field="target" label="对象" sortable v-slot="props">
                  <b-tooltip :label="props.row.target">
                    <a @click="copy(props.row.target)">
                      <span class="has-text-success" v-if="receiverDict[props.row.target]">
                        {{ receiverDict[props.row.target] }}
                      </span>
                      <span class="has-text-warning" v-else>
                        {{ props.row.target.slice(4, 12) }}
                      </span>
                    </a>
                  </b-tooltip>
                </b-table-column>
                <b-table-column field="created" label="时间" sortable v-slot="props">
                  {{ props.row.created }}
                </b-table-column>
              </b-table>
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
import confirm from '@/services/confirm'
import utility from '@/services/utility'

interface IReceiver {
  id: string,
  name: string,
  address: string,
}

interface ITx {
  id: string,
  status: string,
  amount: number,
  target: string,
  created: Date,
}

interface IBalance {
  fingerprint: string,
  height: number,
  isSynced: boolean,
  balance: number,
  pending: number,
  spendable: number,
}

@Component({
  components: {
  },
})
export default class Transfer extends Vue {
  username = localStorage.getItem("username")
  receivers: IReceiver[] = [];
  receiverDict: { [idx: string]: string } = {};
  txs: ITx[] = [];
  showVerification = false;
  vcode = '';
  amount = 0;
  target = '';
  receiverName = '';
  receiverAddress = '';
  balance: IBalance | null = null;

  mounted() {
    this.refreshReceivers();
  }

  refreshReceivers() {
    getInfo.getReceivers()
      .then(response => response.json())
      .then(json => {
        this.receivers = json;
        this.receiverDict = {};
        this.receivers.forEach(r => this.receiverDict[r.address] = r.name);
      });
  }

  refreshTxs() {
    getInfo.getAllTxs()
      .then(response => response.json())
      .then(json => {
        this.txs = json.reverse();
      });
  }

  refreshBalance() {
    getInfo.getBalance()
      .then(response => response.json())
      .then(json => {
        this.balance = json;
      });
  }

  deleteReceiver(id: string) {
    var r = this.receivers.find(_ => _.id == id);
    if (!r) return;
    const target = `${r.name}@${id}`;
    confirm.confirmAndExecute({
      confirmTitle: '确认删除接收者',
      confirmMessage: `删除接收者[${target}]，确认吗？`,
      workingMessage: `正在删除 ${target}`,
      successMessage: `${target}已删除`,
      failureMessage: '删除失败',
    },
      () => getInfo.deleteReceiver(id),
      () => {
        this.refreshReceivers();
      }
    );
  }

  createReceiver() {
    const target = `${this.receiverName}@${this.receiverAddress}`;
    confirm.confirmAndExecute({
      confirmTitle: '确认创建接收者',
      confirmMessage: `创建接收者[${target}]，确认吗？`,
      workingMessage: `正在创建 ${target}`,
      successMessage: `${target}已创建`,
      failureMessage: '创建失败',
    },
      () => getInfo.createOrUpdateReceiver(this.receiverName, this.receiverAddress),
      () => {
        this.receiverName = '';
        this.receiverAddress = '';
        this.refreshReceivers();
      }
    );
  }

  preTransfer() {
    if (this.amount < 0 || !this.target) return;
    getInfo.preTransfer(this.target, this.amount)
      .then(resp => {
        if (resp.ok)
          this.showVerification = true;
      });
  }

  transfer() {
    if (this.amount < 0 || !this.target) return;
    getInfo.transfer(this.target, this.amount, this.vcode)
      .then(resp => {
        if (resp.ok) {
          resp.json()
            .then(json => {
              this.$buefy.notification.open({ message: '转账成功', type: 'is-success' });
              this.showVerification = false;
              this.vcode = '';
            })
        }
        else {
          this.$buefy.notification.open({ message: '转账失败', type: 'is-danger' });
          this.showVerification = false;
        }
      });
  }

  copy(text: string) {
    utility.copy(text);
  }
}
</script>
