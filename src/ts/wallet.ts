interface wallet {
  radix: number;
  pockets: number[];
  value(): number;
}

class wallet implements wallet {
  constructor(radix: number, numPockets: number) {
    this.radix = radix;
    this.pockets = new Array(numPockets).fill(0);
  }
  setPocket(index: number, x: number) {
    this.pockets[index] = x;
  }

  explode(index: number) {
    if (index >= this.pockets.length) {
      return;
    }
    if (this.pockets[index] >= this.radix) {
      this.pockets[index] -= this.radix;
      this.pockets[index + 1] += 1;
    }
  }

  unexplode(index: number) {
    if (index >= this.pockets.length || index < 1) {
      return;
    }
    if (this.pockets[index] >= 1) {
      this.pockets[index] -= 1;
      this.pockets[index - 1] += this.radix;
    }
  }

  value() {
    return this.pockets.reduce(
      (acc, curr, i) => acc + curr * Math.pow(this.radix, i)
    );
  }
}

export default wallet;
