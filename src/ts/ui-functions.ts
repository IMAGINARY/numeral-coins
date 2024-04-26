import * as d3 from "d3-selection";
import { prizesImgs } from "./prizes";
import wallet from "./wallet";

function makeWallet() {
  document.getElementById("wallet")?.remove();

  // calculate number of pockets
  let i = 0;

  if (window.currentMode.type === "junior") {
    for (i = 0; window.radix ** i - 1 < window.price; i += 1) {}
  } else {
    for (
      i = 0;
      window.radix ** i - 1 < window.currentMode.priceInterval[1];
      i += 1
    ) {}
  }
  console.log(`making wallet with ${i} pockets`);

  window.W = new wallet(window.radix, i);
}

function newChallenge() {
  // Set price
  window.price = Math.floor(
    window.currentMode.priceInterval[0] +
      Math.random() *
        (window.currentMode.priceInterval[1] -
          window.currentMode.priceInterval[0] +
          1)
  );

  // Set prize image

  window.prizeImg = prizesImgs[Math.floor(Math.random() * prizesImgs.length)];

  d3.select("#prize").select("img").attr("src", window.prizeImg);
  d3.select("#prize-img").classed("decomposition-found", false);
  d3.select("#walletValue-img").classed("goal-reached", false);

  d3.select("#price").text(window.price.toString());

  makeWallet();
}

function changeRadix(b: number) {
  window.radix = b;
  d3.select("#radix-display").text(b.toString());
  d3.select("#prize-img").classed("decomposition-found", false);
  d3.select("#walletValue-img").classed("goal-reached", false);
  clearResults();
  makeWallet();
}

function clearResults() {
  d3.select("#results").text("");
}

function createRadixMenu(radixOptions: number[]) {
  document.getElementById("radix-menu")?.remove();

  const radixMenu = d3
    .select("#radix-menu-container")
    .append("div")
    .attr("id", "radix-menu")
    .classed("dropdown", true)
    .classed("dropdown-right", true);

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
}

/* Text modals */

function createTextModal(
  id: string,
  titleKey: string,
  textUrl: URL
): HTMLSpanElement {
  // Creates a modal (HTMLDivElement) and a button that activates the modal.
  // Returns an HTMLSpanElement that contains the button.

  // 1. Create modal
  const modal = d3
    .select("body")
    .append("div")
    .classed("modal", true)
    .attr("id", id);

  const content = modal.append("div").classed("modal-content", true);

  const header = content.append("div").classed("modal-header", true);

  const body = content.append("div").classed("modal-body", true);

  const btnClose = header
    .append("span")
    // .attr("type", "button")
    .classed("btn-close", true)
    .html("&times");

  header.append("div").text(titleKey);

  fetch(textUrl)
    .then((x) => x.text())
    .then((text) => {
      // eslint-disable-next-line no-param-reassign
      body.html(text);
    })
    // eslint-disable-next-line no-console
    .catch((error) => console.log(error));

  //   body.html(textId);

  // 2. Create button
  const container = document.createElement("span");

  const button = d3
    .select(container)
    .append("span")
    // .classed("btn btn-secondary", true)
    // .attr("id", `btn-${id}`)
    .text(titleKey);

  // button.append('img').attr('src', iconCalculator);

  //   button
  //     .append("div")
  //     .classed("translate", true)
  //     .attr("data-i18n", `[html]${titleKey}`);

  //   button.attr("data-bs-toggle", "modal").attr("data-bs-target", `#${id}`);

  button.on("click", () => {
    console.log("click");
    // console.log(modal.style("display"));
    modal.style("display", "block");
  });

  btnClose.on("click", () => {
    modal.style("display", "none");
  });

  window.onclick = function (event) {
    if (event.target == modal.node()) {
      modal.style("display", "none");
    }
  };

  return container;
}

export {
  makeWallet,
  newChallenge,
  changeRadix,
  clearResults,
  createRadixMenu,
  createTextModal,
};
