import wallet from "./wallet";
import * as d3 from "d3-selection";
import { prizes } from "./prizes";

declare global {
  interface Window {
    W: wallet;
    d3: typeof d3;
    price: number;
    radix: number;
  }
}

let mode = "junior";
let maxPrice = 200;

window.price = 145;
window.radix = 4;

// let W: wallet;

function makeWallet() {
  console.log("making wallet");

  document.getElementById("wallet")?.remove();
  document.getElementById("walletValue")?.remove();

  // let radix = Math.max(
  //   Number((document.getElementById("radix") as HTMLInputElement).value),
  //   2
  // );

  // calculate number of pockets
  let i = 0;
  for (i = 0; window.radix ** i < maxPrice; i += 1) {}

  window.W = new wallet(window.radix, i);
}

function newPrize() {
  const i = Math.floor(Math.random() * prizes.length);
  d3.select("#prize").select("img").attr("src", prizes[i].img);
  d3.select("#price").text(prizes[i].price.toString());

  window.price = prizes[i].price;
}

function changeRadix(b: number) {
  window.radix = b;
  makeWallet();
}

/* MAIN SETUP */

const radixOptions = [2, 3, 4, 5, 10];
const radixMenu = d3
  .select("#radix-menu")
  .append("div")
  .classed("dropdown", true);

radixMenu
  .append("svg")
  .append("image")
  .attr("href", new URL("../img/star.png", import.meta.url).href);

radixMenu
  .append("ul")
  .selectAll("li")
  .data(radixOptions)
  .enter()
  .append("li")
  .text((d) => d)
  .on("click", (ev, d) => changeRadix(d));

d3.select("#radix").on("change", makeWallet);

const prizeDiv = d3
  .select("#prize")
  .append("div")
  .attr("id", "prize-img-container");

prizeDiv.append("img").attr("id", "prize-img");

prizeDiv
  .append("img")
  .attr("src", new URL("../img/reload.png", import.meta.url).href)
  .attr("id", "prize-reload-button")
  .on("click", () => {
    d3.select("#results").text("");
    newPrize();
    makeWallet();
  });

prizeDiv.append("div").attr("id", "price");

d3.select("#prize").append("span").attr("id", "walletValue-container");

makeWallet();
newPrize();
// window.W = W;
window.d3 = d3;
// console.log(window.W.pockets);
