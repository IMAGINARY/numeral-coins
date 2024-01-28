interface prizeData {
  img: string;
  price: number;
}

export const prizes = [
  {
    img: new URL("../img/diamond.png", import.meta.url).href,
    price: 150,
  },
  {
    img: new URL("../img/diamond.png", import.meta.url).href,
    price: 30,
  },
  {
    img: new URL("../img/diamond.png", import.meta.url).href,
    price: 87,
  },
  {
    img: new URL("../img/diamond.png", import.meta.url).href,
    price: 49,
  },
];
