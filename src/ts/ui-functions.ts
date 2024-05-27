import * as d3 from "d3-selection";
import { prizesImgs } from "./prizes";
import wallet from "./wallet";
import { levelIcons } from "./img-assets";

interface mode {
  id: number;
  type: "junior" | "senior";
  level: number;
  icon: string;
  priceInterval: number[];
}

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
  // console.log(`making wallet with ${i} pockets`);

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

function clearResults() {
  d3.select("#results").text("");
}

/** Radix */

function changeRadix(b: number) {
  window.radix = b;
  d3.select("#radix-display").text(b.toString());
  d3.select("#prize-img").classed("decomposition-found", false);
  d3.select("#walletValue-img").classed("goal-reached", false);
  clearResults();
  makeWallet();
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

/** Info menu */

function createInfoMenu() {
  const infoMenu = d3
    .select("#config-opts")
    .append("div")
    .attr("id", "info-menu")
    .classed("dropdown", true)
    .classed("dropdown-left", true);

  infoMenu
    .append("img")
    .attr("src", new URL("../img/info.png", import.meta.url).href);

  const infoMenuOptions = [
    {
      id: "intro",
      title: "Introduction",
      textUrl: new URL("../txt/intro.html", import.meta.url),
    },
    {
      id: "prints",
      title: "3D prints",
      textUrl: new URL("../txt/prints.html", import.meta.url),
    },
    {
      id: "about",
      title: "About",
      textUrl: new URL("../txt/about.html", import.meta.url),
    },
  ];

  infoMenu
    .append("ul")
    .selectAll("li")
    .data(infoMenuOptions)
    .enter()
    .append("li")
    .append((d) => createTextModal(d.id, d.title, d.textUrl));
}

/** Mode menu */

const modesList = [
  {
    id: 1,
    type: "junior",
    level: 1,
    icon: "1",
    priceInterval: [1, 5],
  },
  {
    id: 2,
    type: "junior",
    level: 2,
    icon: "2",
    priceInterval: [5, 10],
  },
  {
    id: 3,
    type: "junior",
    level: 3,
    icon: "3",
    priceInterval: [10, 20],
  },
  {
    id: 4,
    type: "senior",
    level: 1,
    icon: "4",
    priceInterval: [1, 20],
  },
  {
    id: 5,
    type: "senior",
    level: 2,
    icon: "5",
    priceInterval: [20, 100],
  },
  {
    id: 6,
    type: "senior",
    level: 3,
    icon: "6",
    priceInterval: [100, 400],
  },
] as mode[];

const modeChanged = (ev: Event, d: mode) => {
  clearResults();
  window.currentMode = d;
  // console.log("mode changed", window.currentMode);

  d3.select("#modeSelectorIcon")
    .attr("src", levelIcons[`level${d.icon}` as keyof typeof levelIcons])
    .attr("class", `icon-level ${d.type}`);

  if (window.currentMode.type === "junior") {
    createRadixMenu([2, 3, 4, 5, 10]);
    window.seniorMode = false;
  } else {
    createRadixMenu([2, 3, 4, 5, 10, 12, 16]);
    window.seniorMode = true;
  }
  newChallenge();
};

function createModeMenu() {
  const modeSelector = d3
    .select("#config-opts")
    .append("div")
    .attr("id", "mode-selector")
    .classed("dropdown", true)
    .classed("dropdown-left", true);

  modeSelector.append("img").attr("id", "modeSelectorIcon");

  const modeItems = modeSelector
    .append("ul")
    .selectAll("li")
    .data(modesList)
    .enter()
    .append("li")
    .append("label");

  modeItems
    .append("input")
    .attr("type", "radio")
    .attr("name", "modeRadio")
    .property("checked", (d) => d.id === 1)
    .on("change", modeChanged);

  modeItems
    .append("img")
    .attr("src", (d) => levelIcons[`level${d.icon}` as keyof typeof levelIcons])
    .attr("class", (d) => `icon-level ${d.type}`);

  modeChanged(null as any as Event, modesList[0]);
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
  createInfoMenu,
  modesList,
  createModeMenu,
  createTextModal,
};
