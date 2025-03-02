<script setup lang="ts">

import { onMounted, Ref, ref, watch } from 'vue';
import { misellaneous } from '../draw/misellaneous';
import * as dw from '../draw/draw'
import { Coord } from '../util/coord';
import { Card, Power } from './card'
import { translate } from '../fonts/trainslate'
import { computed } from '@vue/reactivity';
import { refChars } from '../puzzle/chars';
import { sets } from '../fonts/sets';

const props = defineProps(['version'])

const logicWidth = 400
const logicSize = new Coord(logicWidth, logicWidth * (88 / 63))
const styleSize = new Coord().like(logicSize)

var rcvs: Ref<dw.Canvas>  // Canvas相关参数
const rcard: Ref<Card> = ref(new Card())  // 卡牌相关参数

// 更改插画
function changeIllastration(event: any) {
    const url: string = URL.createObjectURL(event.target.files[0])
    rcard.value.importIllastration(url, rcvs.value)
}

// 缩放
watch(() => {return rcard.value.scale}, (n, o) => {
    rcard.value.scale = Math.max(rcard.value.scale, 1)
    const ratio = typeof(n / 100) === 'number' ? n / 100 : 1
    const f2 = (e: number) => Number(e.toFixed(2))
    rcard.value.w = f2(rcard.value.illastration.width * ratio)
    rcard.value.h = f2(rcard.value.illastration.height * ratio)
})

// 保存卡牌
function exportCard() {
    function download() {
        const downloadLink = document.createElement('a');
        const fileName = rcard.value.name + '.png'
        downloadLink.setAttribute('download', fileName);
        rcvs.value.canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                downloadLink.setAttribute('href', url);
                downloadLink.click();
            }
        })
    }
    download();
}

// 导入插画
function importIll() {
    const file = document.getElementById('import-ill')
    file?.click()
}

// 动画循环
function loop() {
    // 清空画布
    dw.clearCanvas(rcvs.value)

    // 拖拽插画

    // 绘制插画
    dw.drawIllatration(rcvs.value, rcard.value)

    // 绘制外框
    dw.drawOutFrame(rcvs.value, rcard.value, dw.outFrame)

    // 绘制体力
    dw.drawHeartLimit(rcvs.value, rcard.value, misellaneous)

    // 绘制技能
    const bottomy = dw.drawSkill(rcvs.value, rcard.value, misellaneous).topy

    // 绘制称号与武将名
    dw.frawTitleName(rcvs.value, rcard.value, bottomy)

    // 绘制底部信息
    dw.drawBottom(rcvs.value, rcard.value)

    // 绘制版本信息
    dw.drawVersion(rcvs.value, props.version)

    // 下一帧
    window.requestAnimationFrame(loop);
}

// 修改技能数量
function changeNumSkill() {
    rcard.value.numSkill = Math.max(0, rcard.value.numSkill)
    if (rcard.value.numSkill >= 100) {
        alert('技能数过多！请勿超过100个技能！')
        rcard.value.numSkill = rcard.value.skills.length
    } else {
        while (rcard.value.skills.length < rcard.value.numSkill) {
            rcard.value.addSkill()
        }
        while (rcard.value.skills.length > rcard.value.numSkill) {
            rcard.value.rmSkill()
        }
    }
}

// 确保体力值大于等于0
watch(() => {return rcard.value.heart}, (n, o) => {
    rcard.value.heart = Math.max(0, rcard.value.heart)
    rcard.value.heartLimit = Math.max(rcard.value.heart, rcard.value.heartLimit)
})

// 确保体力上限大于体力值
watch(() => {return rcard.value.heartLimit}, (n, o) => {
    rcard.value.heartLimit = Math.max(rcard.value.heart, rcard.value.heartLimit)
})

// 缺失文字
const missing = computed(() => {
    let text = rcard.value.name
    if (rcard.value.isTranslate) {
        text = translate(rcard.value.name)
    }
    let res = ''
    for (let char of text) {
        if (!(sets.jinmei.has(char) || refChars.value.zchs.indexOf(char) >= 0)) {
            res = res + char
        }
    }
    return res
})

// 初始化Canvas
function initCanvas() {
    const canvas = document.getElementById('card-preview') as HTMLCanvasElement;
    rcvs = ref({
        canvas: canvas,
        ctx: canvas.getContext('2d') as CanvasRenderingContext2D,
        logicSize: logicSize,
        displaySize: styleSize
    })
    dw.setCanvasSize(rcvs.value, 2)
}

// 挂载时初始化canvas
onMounted(() => {
    initCanvas()
    window.requestAnimationFrame(loop);
    rcard.value.importIllastration('/png/刘备-六星耀帝.png', rcvs.value);
})

</script>

<template>

<div id="maker" class="row-flex">
    <canvas id="card-preview"></canvas>

    <div id="editor" class="card">
        <div class="row-flex-center">
            <div class="btn greenBtn" @click="exportCard()">保存卡牌</div>
        </div>
        
        <hr class="cardHr">
        <div class="row-flex-center">
            <div class="btn wideBtn" @click="importIll()">导入插画</div>
        </div>
        
        <div class="row-flex-center" style="display: none;">
            <input id='import-ill' type="file" accept="image/jpeg, image/png, image/webp, image/jpg" @change="changeIllastration($event)">
        </div>
        
        <div class="row-flex-center">
            <div class="x2 mona">X:</div>
            <input class="textInput" type="number" v-model="rcard.x">
            <div class="x2 mona">Y:</div>
            <input class="textInput" type="number" v-model="rcard.y">
        </div>
        <div class="row-flex-center">
            <div class="x2 mona">W:</div>
            <input class="textInput" type="number" v-model="rcard.w" disabled="true">
            <div class="x2 mona">H:</div>
            <input class="textInput" type="number" v-model="rcard.h" disabled="true">
        </div>
        <div class="row-flex-center">
            <div class="x2">缩放</div>
            <input class="textInput" type="number" v-model="rcard.scale">
            <div class="btn" @click="rcard.scale = Number((rcard.scale * 0.97833).toFixed(2))">-</div>
            <div class="btn" @click="rcard.scale = Number((rcard.scale * 1.02215).toFixed(2))">+</div>
            <div class="btn" @click="rcard.scale = 100">重置</div>
        </div>

        <hr class="cardHr">
        <div class="row-flex-center">
            <div class="row-flex-center x4">
                <input type="checkbox" v-model="rcard.isProducer">
                <div>版权</div>
            </div>
            <input class="textInput" :class="{hidden: !rcard.isProducer}" v-model="rcard.producer">
        </div>
        <div class="row-flex-center">
            <div class="row-flex-center x4">
                <input type="checkbox" v-model="rcard.isIllustrator">
                <div>画师</div>
            </div>
            <input class="textInput" :class="{hidden: !rcard.isIllustrator}" v-model="rcard.illastrator">
        </div>
        <div class="row-flex-center">
            <div class="row-flex-center x4">
                <input type="checkbox" v-model="rcard.isCardNum">
                <div>编号</div>
            </div>
            <input class="textInput" :class="{hidden: !rcard.isCardNum}" v-model="rcard.cardNum">
        </div>

        <hr class="cardHr">
        <div class="row-flex-center">
            <input type="checkbox" v-model="rcard.isTranslate">
            <div>自动简繁转换</div>
        </div>
        <div class="row-flex-center">
            <div class="x4">武将称号</div>
            <input class="textInput" v-model="rcard.title">
            <div class="translated" v-show="rcard.isTranslate">{{translate(rcard.title)}}</div>
        </div>
        <div class="row-flex-center">
            <div class="x4">武将名</div>
            <input class="textInput" v-model="rcard.name">
            <div class="translated" v-show="rcard.isTranslate">{{translate(rcard.name)}}</div>
        </div>
        <div class="row-flex-center">
            <div v-show="missing.length > 0" class="tip">检测到缺字({{missing}})，建议使用拼字功能</div>
        </div>

        <hr class="cardHr">
        <div class="row-flex-center">
            <div class="x4">势力</div>
            <select v-model="rcard.power">
                <option v-for="(val, name, idx) in Power" :value="val">{{name}}</option>
            </select>
            <input type="checkbox" v-model="rcard.isLord">
            <div>主公</div>
        </div>
        <div class="row-flex-center">
            <div class="x4">体力值</div>
            <input class="textInput" type="number" v-model="rcard.heart">
            <div class="btn" @click="rcard.heart--">-</div>
            <div class="btn" @click="rcard.heart++">+</div>
        </div>
        <div class="row-flex-center">
            <input type="checkbox" v-model="rcard.isHreatLimit">
            <div>体力值与体力上限不等</div>
        </div>
        <div v-show="rcard.isHreatLimit" class="row-flex-center">
            <div class="x4">体力上限</div>
            <input class="textInput" type="number" v-model="rcard.heartLimit">
            <div class="btn" @click="rcard.heartLimit--">-</div>
            <div class="btn" @click="rcard.heartLimit++">+</div>
        </div>
        
        <hr class="cardHr">
        <div class="row-flex-center">
            <div class="x4">技能数量</div>
            <input class="textInput" type="number" v-model="rcard.numSkill" @change="changeNumSkill">
            <div class="btn" @click="rcard.numSkill--; changeNumSkill()">-</div>
            <div class="btn" @click="rcard.numSkill++; changeNumSkill()">+</div>
        </div>
    </div>

    <div id="skills" class="row-flex">
        <div class="card" v-for="(skill, i) in rcard.skills">
            <div class="row-flex-center">
                <div class="x4">技能{{i+1}}</div>
                <input type="checkbox" v-model="skill.isItalic">
                <div>斜体</div>
            </div>
            <div class="row-flex-center">
                <div class="x4">技能名</div>
                <input class="textInput" v-model="skill.name">
            </div>

            <hr class="cardHr">
            <div class="row-flex-center">
                <div class="x4">技能描述</div>
            </div>
            <div class="row-flex-center">
                <textarea class="skill-text" v-model="skill.text"></textarea>
            </div>
        </div>
    </div>
</div>

<!-- <div>{{rcard}}</div> -->

</template>

<style scoped>

@font-face {
    font-family: "FangZhengZhuYuan";
    src: url("/fonts/FangZhengZhuYuan/ZhuYuan.woff") format('woff');
    font-display: swap;
}

#maker {
    font-family: "PingFang SC", SimHei, monospace, Monaco, Consolas, monospace;
    color: rgb(38, 38, 38);
    font-size: 14px;
}

.mona {
    font-family: Monaco;
    font-size: 13px;
}

.card {
    border-radius: 5px;
    box-shadow: 0px 0px 7px 0px rgb(167 161 161);
    padding: 10px;
    margin: 5px;
}

#card-preview {
    border-radius: 5px;
    box-shadow: 0px 0px 7px 0px rgb(167 161 161);
    margin: 5px;
}

.row-flex {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}

.row-flex-center {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    place-items: center;
    padding: 1px;
}

.cardHr {
   border: 0;
   height: 1px;
   background-color: rgb(195, 195, 195);
}

.x2 {
    width: 30px;
}

.x4 {
    width: 60px;
}

.textInput {
    width: 80px;
    border-radius: 5px;
    border-style: none;
    height: 15px;
    padding: 3px;
    margin: 3px;
    background-color: rgb(237, 237, 237);
}

.btn {
    padding: 1px 10px;
    margin: 0px 3px;
    border-radius: 10px;
    box-shadow: rgb(60 64 67 / 30%) 0 1px 3px 0;
    user-select: none;
}

.btn:hover {
    background-color: dimgray;
    cursor: pointer;
    background-color: rgb(216, 216, 216);
}

.btn:active {
    background-image: linear-gradient(to bottom right, #81fbb878, #28c76f78);
}

.greenBtn {
    background-image: linear-gradient(to bottom right, #4ff79bc0, #009543d6);
    padding: 4px 10px;
}

.wideBtn {
    width: 100%;
    text-align: center;
}

.hidden {
    visibility: hidden;
}

.tip {
    font-size: 10px;
    color:brown;
}

.skill-text {
    min-height: 100px;
}

.translated {
    color:gray;
    padding: 0px 0px 0px 10px;
    font-size: 10px
}

</style>