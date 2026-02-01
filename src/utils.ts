import { OPTIONS } from "./config.js";

export function random(len: number) {
    let length = OPTIONS.length;

    let ans = "";

    for (let i = 0; i < len; i++) {
        ans += OPTIONS[Math.floor((Math.random() * length))] // 0 => 20
    }

    return ans;
}