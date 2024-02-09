import wallet from "./wallet";
import * as d3 from "d3-selection";
import { prizes } from "./prizes";
import { createTextModal } from "./ui-functions";

declare global {
  interface Window {
    W: wallet;
    d3: typeof d3;
    price: number;
    radix: number;
  }
}

let mode = "junior";
let maxPrice = 400;

window.price = 145;
window.radix = 4;

// let W: wallet;

function makeWallet() {
  console.log("making wallet");

  document.getElementById("wallet")?.remove();
  // document.getElementById("walletValue")?.remove();

  // calculate number of pockets
  let i = 0;
  for (i = 0; window.radix ** i - 1 < maxPrice; i += 1) {}

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
  d3.select("#radix-display").text(b.toString());
  makeWallet();
}

/* MAIN SETUP */

d3.select("#config-opts").append(() =>
  createTextModal(
    "about",
    "About",
    new URL("../txt/prints.html", import.meta.url)
  )
);

const menu = d3.select("#menu");

// Create radix menu
const radixOptions = [2, 3, 4, 5, 10];
const radixMenu = menu
  .append("div")
  .attr("id", "radix-menu")
  .classed("dropdown", true);

radixMenu
  .append("img")
  .attr("src", new URL("../img/star.png", import.meta.url).href);

radixMenu
  .append("span")
  .attr("id", "radix-display")
  .classed("radix-text", true)
  .text(window.radix);

radixMenu
  .append("ul")
  .selectAll("li")
  .data(radixOptions)
  .enter()
  .append("li")
  .text((d) => d)
  .on("click", (ev, d) => changeRadix(d));

// Create load prize button
menu
  .append("div")
  .append("img")
  .attr("src", new URL("../img/reload.png", import.meta.url).href)
  .attr("id", "prize-reload-button")
  .on("click", () => {
    d3.select("#results").text("");
    newPrize();
    makeWallet();
  });

// Create current total wallet value display
const walletValue = menu.append("div").attr("id", "walletValue");

walletValue
  .append("img")
  .attr("src", new URL("../svg/3bags.svg#svg1", import.meta.url).href);

walletValue.append("span").attr("id", "total");

//
const prizeDiv = d3.select("#central").append("div").attr("id", "prize");

prizeDiv.append("img").attr("id", "prize-img");
prizeDiv.append("div").attr("id", "price");

d3.select("#central").append("div").attr("id", "results");

makeWallet();
newPrize();
// window.W = W;
window.d3 = d3;
// console.log(window.W.pockets);
