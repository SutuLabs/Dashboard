# Chiabee

## 简介

Chiabee，一站式Chia农场管理工具。

通过可视化的界面呈现及简洁操作，让非技术人员也能轻松完成大规模集群的管理工作，推进挖矿产业的智能化、透明化、平民化。以下是一些功能和优点：

* 使用可视化界面进行管理，非技术人员也能轻松运维Chia农场。
* 解决chia官方管理界面粗糙的问题，将后台复杂的数据以图表形式，直观地展示在前端页面中。
* 监控界面内，同时显示chia集群中的故障信息。
* 通过电脑监控系统或者手机客户端，即可对整个集群进行实时监控。
* 对农场运行连接状态、Plotter、Farmer、Harvester、硬盘进行全面监控。
* 实时展示农场内机器信息、算力信息、收益/奖励信息。
* 可连接办公社交软件，将chia集群中重要信息定时汇报给管理员；另外，非正常状态信息会第一时间汇报给管理员。
* 多层级多角色管理员设置，根据实际需要配置权限。
* 支持Plotter加速、双Farmer冗余。

进入[Chiabee官方网站](https://www.chiabee.net/)获取更多Chiabee信息。
点击[Chiabee，一站式Chia农场管理工具](https://www.youtube.com/watch?v=saCTDXfI7Vc&t=12s)查看演示视频。

## 安装

使用Node.js
```
$ npm install
```

## 运行

编译并启用开发环境下的热重载
```
$ npm run serve
```

编译产品并最小化
```
$ npm run build
```

### 其他配置

获取后端API的默认路径是`/`。如果后端服务器并不是安装在本地，用户可以通过修改`.env`文件中的环境变量`VUE_APP_API`来修改路径。

## 使用

Chiabee客户端由以下五大模块组成：

### 首页

首页展示了农场的实时概况，包括连接状态，机器状态，网络空间大小等。

![概览](https://user-images.githubusercontent.com/90297530/142964227-2d3f2ce8-a8e6-4a32-a4f0-a41c61ef0f61.png)

### 矿场监控

矿场监控由三大主要板块构成：绘图机监控，收割机监控，以及硬盘监控。绘图机监控可以监控每台P图机的运行状态，调整P图的进程和田块位置以获得更高的P图效率。收割机监控可以查看田块的传输状态，传输速率，收割机的剩余空间等。用户可以展开查看每台收割机的硬盘详情，根据需要进行挂载、卸载操作，如有异常情况，界面上会有相应的提示。硬盘监控可以查看硬盘的所在位置，SMART信息，并进行查询、挂载等操作。另外，矿场监控也提供了实时的错误提示与事件提示。

![Plotter](https://user-images.githubusercontent.com/90297530/142964548-01929a5f-7802-4eec-be7e-141b6bb409bf.png)
![Harvester](https://user-images.githubusercontent.com/90297530/142964557-829f644d-3164-4e52-b48d-4c1a4859c754.png)
![硬盘](https://user-images.githubusercontent.com/90297530/142964562-80140aec-8af5-42d4-8053-3ee3f827bf7c.png)

### P盘效率

P盘效率界面展示了不同系统下的P盘效率。

### 常用工具

常用工具提供了指向Chia计算器和Chia区块浏览器的快捷方式。

### 个人中心

用户可以通过个人中心登陆自己的账号，登录后有权限的账户才可以查看矿场监控等信息，或进行卸载机器等有风险的操作。

---

# Chiabee

## Introduction

Chiabee: One-Stop Chia Farm Management Tool.

Through the visual interface presentation and concise operation, non-technical personnel can easily complete the management of large-scale clusters. Promote the intelligence, transparency, and civilianization of the mining industry. Here are some features and advantages:

* Using a visual interface for management, non-technical personnel can easily operate and maintain Chia Farm.
* Solve the problem of rough chia official management interface. The complex data in the background is visually displayed on the front-end page in the form of charts.
* In the monitoring interface, fault information in the chia cluster is displayed at the same time.
* The entire cluster can be monitored in real time through a computer monitoring system or a mobile phone client.
* Fully monitor the operation connection status of the farm, Plotter, Farmer, Harvester, and hard disk.
* Real-time display of machine information, computing power information, income/reward information in the farm.
* It can be connected to office social software to report important information in the chia cluster to the administrator regularly. In addition, abnormal status information will be reported to the administrator as soon as possible.
* Multi-level and multi-role administrator settings, configure permissions according to actual needs.
* Support Plotter acceleration and dual Farmer redundancy.

Go to [Chiabee official website](https://www.chiabee.net/) for more information about Chiabee.
Click [Chiabee: One-Stop Chia Farm Management Tool](https://www.youtube.com/watch?v=xtDcrkQ6teM) to view the demo video.

## Prerequisites

**Node.js** version 10.x and above with npm installed.

## Build Client

Project setup using Node.js
```
$ npm install
```

Compiles and hot-reloads for development
```
$ npm run serve
```

Compiles and minifies for production
```
$ npm run build
```

### Additional Configuration

The default route to communicate with backend API is `/`. If the backend server is install in another machine, you can access it by changing the environment variable `VUE_APP_API` in `.env` file. 

## Usage

Chiabee Client consists of five tabs, including: 

### Home

Home page gives an real-time overview of the farm, including connection status, machine status, network space, etc.

![概览](https://user-images.githubusercontent.com/90297530/142965346-1f86fdc4-6790-4636-bc72-7ca783b5de05.png)

### Farm Monitor

Farm Monitor consists of three main sections, Plotter Moniter, Harvester Monitor, Hard Disk Monitor. Plotter Monitor displays real-time information of all plotter, supports adjusting plotting progress and automatically coordinates and balances plots storage to achieve optimal efficiency. Harvester Monitor displays transferring status of plots, remaining storage of hard disks and other useful indicators at a glance. Harvester Monitor reports abnormalies when hard disk is not functioning properly, and provides management controls which allow authoritized users to manipulate the machines accordingly. Hard Disk Mornitor collects physical location and SMART information of all hard disks and enables information filtering and disk management. Additionally, Farm Monitor supports real-time notification of errors and events.

![Plotter](https://user-images.githubusercontent.com/90297530/142965376-202aef26-690b-41e4-b9a3-d9bc3f10107a.png)
![Harvester](https://user-images.githubusercontent.com/90297530/142965378-b9d4be6a-26d0-4f37-8cce-2391b50bdfb0.png)
![硬盘](https://user-images.githubusercontent.com/90297530/142965465-74e26ec0-6ad3-4abe-ac6b-19f06a463a7b.png)

### Plotting Efficiency

Plotting Efficiency provides a list of plotting efficiency on different operation systems based on data from Chia.

### Useful Tools

Useful Tools redirects to external tools such as Chia Calculator and Chia Explorer which facilitates rational evaluation of Chia farming. 

### User Center

User Center implement user authoritation to allow authoritized personnel have access to confidential information, such as Farm Monitor, and perform potentially hazardous actions, such as terminating machines.
