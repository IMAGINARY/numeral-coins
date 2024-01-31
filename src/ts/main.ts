import wallet from "./wallet";
import * as d3 from "d3-selection";
import { prizes } from "./prizes";

declare global {
  interface Window {
    W: wallet;
    d3: typeof d3;
    price: number;
  }
}

let mode = "junior";
let maxPrice = 200;

window.price = 145;

// let W: wallet;

function makeWallet() {
  console.log("making wallet");

  document.getElementById("wallet")?.remove();
  document.getElementById("walletValue")?.remove();

  let radix = Math.max(
    Number((document.getElementById("radix") as HTMLInputElement).value),
    2
  );

  // calculate number of pockets
  let i = 0;
  for (i = 0; radix ** i < maxPrice; i += 1) {}

  window.W = new wallet(radix, i);
}

function newPrize() {
  const i = Math.floor(Math.random() * prizes.length);
  d3.select("#prize").select("img").attr("src", prizes[i].img);
  d3.select("#price").text(prizes[i].price.toString());

  window.price = prizes[i].price;
}

d3.select("#radix").on("change", makeWallet);

d3.select("#newprize")
  .append("button")
  .text("New")
  .on("click", () => {
    d3.select("#results").text("");
    newPrize();
    makeWallet();
  });

d3.select("#prize").append("div").append("img").attr("width", "200");

d3.select("#prize").append("span").attr("id", "price");

d3.select("#prize").append("span").attr("id", "walletValue-container");

makeWallet();
newPrize();
// window.W = W;
window.d3 = d3;
// console.log(window.W.pockets);
