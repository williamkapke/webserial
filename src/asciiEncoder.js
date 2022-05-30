

// const substitutions = [ '␀','␁','␂','␃','␄','␅','␆','␇','␈','␉','␊','␋','␌','␍','␎','␏','␐','␑','␒','␓','␔','␕','␖','␗','␘','␙','␚','␛','␜','␝','␞','␟']
// substitutions[127] = '␡'

const classMap = [
    'NUL','SOH','STX','ETX','EOT','ENQ','ACK','BEL','BS','HT','LF','VT','FF','CR','SO','SI','DLE',
    'DC1','DC2','DC3','DC4','NAK','SYN','ETB','CAN','EM','SUB','ESC','FS','GS','RS','US'
]
classMap[127] = 'DEL'

const substitute = (c) => c === 127? '␡' : c === 9216? '␀' : String.fromCodePoint(c+9216)
const encode = (msg) => msg.replace(/[\x00-\x1F\x7F]/g, (m) => substitute(m.charCodeAt(0)))
function decode(msg) {
    return msg.replace(/[\u2400-\u241F\u2421]/g, (m) =>
        String.fromCodePoint(m === '␡'? 127 : m.charCodeAt(0)-9216)
    )
}
function encodeWithHtml(msg, addBR=true) {
    return msg.replace(/[\x00-\x1F\x7F\u2400-\u241F\u2421]/g, (m) => {
        let c = m.charCodeAt(0)
        if (c  === 9249) c = 127
        else if (c > 9216) c -= 9216

        if (addBR && c === 10)
            return `<x class="LF">␊</x><br>`
        return `<x class="${classMap[c] || ''}">${substitute(c)}</x>`
    })
}

export { substitute, encode, decode, encodeWithHtml }
