import { Ref, ref } from 'vue'
import { Fragments } from './fragment'
import { translate } from '../fonts/trainslate'

// Json化的字符表
class Chars {
    jsons: string[] = []
    schs: string[] = []
    zchs: string[] = []

    rpl(chs: string[], ch: string, fgs: Fragments) {
        const i = chs.indexOf(ch[0])
        if (i >= 0) {
            this.schs[i] = fgs.sch[0]
            this.zchs[i] = fgs.zch[0]
            this.jsons[i] = fgs.tojson()
            return 1
        } else {
            return 0
        }
    }

    add(fgs: Fragments) {
        const res = this.rpl(this.schs, fgs.sch, fgs) + this.rpl(this.schs, fgs.zch, fgs) + this.rpl(this.zchs, fgs.sch, fgs) + this.rpl(this.zchs, fgs.zch, fgs)
        if (res === 0) {
            this.schs.push(fgs.sch[0])
            this.zchs.push(fgs.zch[0])
            this.jsons.push(fgs.tojson())
        }
    }

    hasjson(char: string) {
        function findJson(jsons: string[], chs: string[], char: string) {
            const i = chs.indexOf(char)
            return i >= 0 ? jsons[i] : null
        }
        const res = [
            findJson(this.jsons, this.schs, char),
            findJson(this.jsons, this.zchs, char),
            findJson(this.jsons, this.schs, translate(char)),
            findJson(this.jsons, this.zchs, translate(char))
        ]
        for (let json of res) {
            if (json) {
                return json
            }
        }
        return null
    }
}
export const refChars: Ref<Chars> = ref(new Chars())

// 从Json中获取信息
export function jsonInfo(json: string) {
    const head = JSON.parse(json).head
    return `${head.zch[0]}`
}