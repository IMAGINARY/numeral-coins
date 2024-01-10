import "./wallet";
import wallet from "./wallet";

const W = new wallet(10, 5);

declare global {
  interface Window {
    W: wallet;
  }
}

window.W = W;
W.setPocket(0, 15);
console.log(W.pockets);
