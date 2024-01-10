import * as d3 from "d3-selection";

interface wallet {
  radix: number;
  pockets: number[];
  value(): number;
}

class wallet implements wallet {
  constructor(radix: number, numPockets: number) {
    this.radix = radix;
    this.pockets = new Array(numPockets).fill(0);
    this.setPocket(0, 143);
    this.createUI(document.getElementById("wallet-container") as HTMLElement);
    this.updateUI();
  }
  setPocket(index: number, x: number) {
    this.pockets[index] = x;
  }

  // explode: join points into next pocket
  explode(index: number) {
    if (index >= this.pockets.length) {
      return;
    }
    if (this.pockets[index] >= this.radix) {
      this.pockets[index] -= this.radix;
      this.pockets[index + 1] += 1;
    }
    this.updateUI();
  }

  // unexplode: split points into previous pocket
  unexplode(index: number) {
    if (index >= this.pockets.length || index < 1) {
      return;
    }
    if (this.pockets[index] >= 1) {
      this.pockets[index] -= 1;
      this.pockets[index - 1] += this.radix;
    }
    this.updateUI();
  }

  value() {
    return this.pockets.reduce(
      (acc, curr, i) => acc + curr * Math.pow(this.radix, i)
    );
  }

  createUI(container: HTMLElement) {
    const div = d3.select(container).append("div").attr("id", "wallet");

    interface itemList {
      type: string;
      pocketIndex: number;
    }

    const pocketsList = this.pockets.map((d, i) => ({
      type: "pocket",
      value: d,
      pocketIndex: i,
    }));

    const itemsList = [] as itemList[];
    pocketsList.forEach((d, i) => {
      itemsList.push(d);
      if (i < pocketsList.length - 1) {
        itemsList.push({ type: "expControls", pocketIndex: i });
      }
    });

    console.log(itemsList);

    const items = div
      .selectAll("div")
      .data(itemsList)
      .enter()
      .append("div")
      .attr("class", (d) =>
        d.type === "pocket" ? "pocket" : "exploding-controls"
      );

    const pockets = d3.selectAll(".pocket");
    const graphicPockets = pockets
      .append("div")
      .attr("class", "graphic-pocket");
    const numericPockets = pockets
      .append("div")
      .attr("class", "numeric-pocket");
    const creationControls = pockets
      .append("div")
      .attr("class", "creation-controls");
    const explodingControls = d3.selectAll(".exploding-controls");

    creationControls
      .append("div")
      .attr("class", "creation-button")
      .text((d) => {
        const i = (d as itemList).pocketIndex;
        return (this.radix ** i).toString();
      })
      .on("click", (ev, d) => {
        const i = (d as itemList).pocketIndex;
        const v = this.pockets[i];
        this.setPocket(i, v + 1);
        this.updateUI();
      });

    explodingControls
      .append("div")
      .attr("class", "explode-button")
      .text("⇦")
      .on("click", (ev, d) => {
        this.explode((d as itemList).pocketIndex);
      });

    explodingControls
      .append("div")
      .attr("class", "unexplode-button")
      .text("⇨")
      .on("click", (ev, d: any) =>
        this.unexplode((d as itemList).pocketIndex + 1)
      );
  }

  updateUI() {
    const pockets = d3.selectAll(".numeric-pocket").data(this.pockets);
    pockets.text((d) => d.toString());
  }
}

export default wallet;
