export type Project = {
  slug: string;            // адрес как на старом сайте, например proekty/proekt-243-c1-plus
  no: string;              // номер проекта: 243-C1+
  title: string;           // Проект дома 243-C1+
  kind: "house" | "banya" | "house-banya" | "series";
  area: number | null;     // общая площадь, м²
  areaGarage: number | null;
  bedrooms: number | null;
  floors: 1 | 2 | null;
  price: number | null;    // цена строительного проекта, BYN
  priceSketch: number | null; // цена эскизного проекта, BYN
  sketchLabel?: string;
  img: string | null;
  plans: string[];
  gallery: string[];
  tags: string[];          // признаки из разделов старого сайта
  size: string | null;     // 10x12
  description: string | null;
  specs: Record<string, string>;
  h1?: string | null;
  imgBig?: string | null;
  hasMirror?: boolean;
  review: { name: string; text: string; date: string } | null;
};
