import "./wallet";
import wallet from "./wallet";
import * as d3 from "d3-selection";

const W = new wallet(10, 5);

declare global {
  interface Window {
    W: wallet;
    d3: typeof d3;
  }
}

window.W = W;
window.d3 = d3;
console.log(W.pockets);
