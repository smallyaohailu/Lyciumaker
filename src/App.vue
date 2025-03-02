<script setup lang="ts">

import { Ref, ref } from 'vue'
import DrawBoard from './components/puzzle/DrawBoard.vue'
import Maker from './components/maker/Maker.vue'

import { refChars, jsonInfo } from './components/puzzle/chars';

import {Fragment, Fragments, refFragments} from './components/puzzle/fragment'
import CharPreview from './components/puzzle/CharPreview.vue';

enum Page {
  Maker,
  Puzzle
}

const page: Ref<Page> = ref(Page.Maker)
const isSmallCharHover: Ref<boolean> = ref(false)
const refHoverFgs: Ref<Fragments> = ref(new Fragments())

const refVersion: Ref<string> = ref('2.1.4')

window.onbeforeunload = (event: any) => {
  return "您确认要离开吗？所有内容将会丢失！"
}

</script>

<template>
  <div style="width: fit-content;">
    <div id="nav-bar">
      <div class="title">
        <div>Lycium制卡器{{refVersion}}</div>
      </div>
      <div class="nav-btn" @click="page = Page.Maker">
        <div>制卡</div>
      </div>
      <div class="nav-btn" @click="page = Page.Puzzle">
        <div>拼字</div>
      </div>
      <div class="nav-btn" onclick="window.open(href='https://www.bilibili.com/video/BV19P4y1j7n6/')">
        <div>反馈</div>
      </div>
      <div class="nav-btn" style="visibility: hidden;">
        <div>捐赠</div>
      </div>
      <div class="nav-btn" onclick="window.open('https://github.com/CatScarf/Lyciumaker')">
        <div>Github</div>
      </div>
    </div>

    <div style="padding: 5px; background: #a10000; font-size: 10px; text-align: center; color: white">
      因本人无力承担服务器费用，本站将于2022年8月1日关闭。届时您仍可前往Github上下载源码运行。<br>
      您也可以选择
      <a href="https://www.bilibili.com/video/BV19P4y1j7n6/" style="display: inline-block; color: white" target="_blank">
          在该视频下充电
      </a>
      以捐助本网站，此视频的充电收入将会全部用于本站的服务器费用（目前每月50元左右）。
    </div>

    <div id="chars" class="row-flex-center">
        <div class="char card" v-for="char in refChars.jsons" @click="refFragments.fromjson(char)" @mouseenter="isSmallCharHover = true; refHoverFgs = new Fragments().fromjson(char)" @mouseleave="isSmallCharHover = false">{{jsonInfo(char)}}</div>
    </div>

    <div v-show="page === Page.Maker">
      <Maker :version="refVersion"></Maker>
    </div>

    <div v-show="page === Page.Puzzle">
      <DrawBoard></DrawBoard>
    </div>
  </div>

  <div id="char-preview" v-show="isSmallCharHover">
    <CharPreview class="relative-center" width='256' :subcvs="refHoverFgs.draw()"></CharPreview>
  </div>

  <div id="bottomBar" style="margin-top:20px; margin-bottom:20px; padding: 5px 5px; background: #d5d5d5;">
    <a class="bottomInfo" href="http://beian.miit.gov.cn/" target="_blank">吉ICP备2022000349号-1</a>
    &nbsp&nbsp
    <img src="/备案图标.png" style="width:20px; height:20px;">
    <a class="bottomInfo" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=22010402001039" target="_blank">吉公网安备22010402001039号</a>
  </div>
</template>

<style scoped>

#nav-bar {
  background-color: rgb(44, 49, 50);
  height: 44px;
  display: flex;
  flex-direction: row;
  width: 100%;
  font-family: "PingFang SC", SimHei, Monaco, Consolas, monospace;

  padding: 0 0px;
}

.nav-btn {
  color: rgb(221, 221, 221);
  padding: 0px 10px;
  height: 100%;
  display: flex;
  place-items: center;
  user-select: none;

  font-size: 15px;
}
.title {
  /* color: rgb(254, 110, 110); */
  padding: 0px 10px;
  height: 100%;
  display: flex;
  place-items: center;
  user-select: none;

  font-size: 15px;
  font-weight: 500;

  background: linear-gradient(to bottom right, #fff3b0, #ca26ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-btn:hover {
  color: white;
  cursor: pointer;
}

.row-flex-center {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  place-items: center;
  padding: 1px;
}
.card {
  border-radius: 5px;
  box-shadow: 0px 0px 7px 0px rgb(167 161 161);
  padding: 5px;
  margin: 5px;
}

.char {
  user-select: none;
}

.char:hover {
  background-image: linear-gradient(to bottom right, #81fbb878, #28c76f78);
}

.char:active {
  background-image: linear-gradient(to bottom right, #81fbb8, #28c76f);
}

#char-preview {
  position: absolute;
  /* background-color: rgba(0, 0, 0, 0.575); */
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  pointer-events: none;
}

.relative-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

#bottomBar{
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    height:20px;
}

.bottomInfo{
    color:#666;
    font-size:12px;
    text-decoration:none;
    height: 20px;
    line-height: 20px;
}

</style>
