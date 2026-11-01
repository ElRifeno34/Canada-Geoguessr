export type LabelPlacement = { anchor: "top" | "bottom" | "left" | "right"; offset?: [number, number] };
export type City = { name: string; lat: number; lng: number; hint: string; fact: string; aliases?: string[]; label?: LabelPlacement };

export const CITIES: City[] = [
  { name: "Toronto", lat: 43.65, lng: -79.38, hint: "This city is home to the CN Tower.", fact: "Toronto is the largest city in Canada." },
  { name: "Montreal", lat: 45.5, lng: -73.57, hint: "Known for its French heritage and its famous Jazz Festival.", fact: "Montreal is the second largest French-speaking city in the world.", aliases: ["Montréal"], label: { anchor: "right", offset: [0, 8] } },
  { name: "Vancouver", lat: 49.28, lng: -123.12, hint: "Hosted the 2010 Winter Olympics.", fact: "Vancouver is surrounded by mountains and ocean.", label: { anchor: "top" } },
  { name: "Calgary", lat: 51.05, lng: -114.07, hint: "Famous for the Stampede, a huge annual rodeo.", fact: "Calgary is a gateway to the Rocky Mountains.", label: { anchor: "bottom" } },
  { name: "Ottawa", lat: 45.42, lng: -75.7, hint: "Canada's capital city, home to Parliament Hill.", fact: "Ottawa hosts the Canadian Tulip Festival every spring.", label: { anchor: "left", offset: [0, 8] } },
  { name: "Québec City", lat: 46.81, lng: -71.21, hint: "The only walled city north of Mexico.", fact: "Founded in 1608, Québec City is one of North America's oldest cities.", aliases: ["Quebec", "Québec"], label: { anchor: "top" } },
  { name: "Victoria", lat: 48.43, lng: -123.37, hint: "Capital of British Columbia, on the southern tip of Vancouver Island.", fact: "Its Butchart Gardens draw around a million visitors each year.", label: { anchor: "bottom", offset: [-24, 2] } },
  { name: "Edmonton", lat: 53.55, lng: -113.49, hint: "Capital of Alberta, on the North Saskatchewan River.", fact: "It is home to West Edmonton Mall, once the largest mall in the world.", label: { anchor: "top" } },
  { name: "Winnipeg", lat: 49.9, lng: -97.14, hint: "Capital of Manitoba, where the Red and Assiniboine rivers meet at The Forks.", fact: "Winnie-the-Pooh was named after a bear from this city." },
  { name: "Regina", lat: 50.45, lng: -104.61, hint: "Capital of Saskatchewan and home of the RCMP training academy.", fact: "It was originally called Pile o' Bones.", label: { anchor: "bottom" } },
  { name: "Saskatoon", lat: 52.13, lng: -106.67, hint: "Saskatchewan's largest city, nicknamed the 'City of Bridges'.", fact: "It is named after a sweet purple berry native to the prairies.", label: { anchor: "top" } },
  { name: "Halifax", lat: 44.65, lng: -63.57, hint: "Capital of Nova Scotia, with a famous star-shaped Citadel.", fact: "Many Titanic victims are buried in this city's cemeteries." },
  { name: "Fredericton", lat: 45.96, lng: -66.64, hint: "Capital of New Brunswick, on the Saint John River.", fact: "It is nicknamed the 'City of Stately Elms'." },
  { name: "Gaspé", lat: 48.83, lng: -64.48, hint: "At the tip of a Québec peninsula, where Jacques Cartier landed in 1534.", fact: "Its name comes from a Mi'kmaq word meaning 'land's end'." },
  { name: "Yellowknife", lat: 62.45, lng: -114.37, hint: "Capital of the Northwest Territories, on Great Slave Lake.", fact: "It is one of the best places on Earth to see the northern lights." },
  { name: "Whitehorse", lat: 60.72, lng: -135.06, hint: "Capital of Yukon, a hub of the Klondike Gold Rush era.", fact: "It is named after rapids that looked like the manes of white horses." },
  { name: "Iqaluit", lat: 63.75, lng: -68.52, hint: "Capital of Nunavut, on Baffin Island.", fact: "It is the only Canadian territorial capital not connected by road to any other community." },
  { name: "Kuujjuaq", lat: 58.1, lng: -68.4, hint: "The largest Inuit village in Nunavik, northern Québec.", fact: "Its name means 'great river' in Inuktitut." },
];

export const MAX_LIVES = 5;

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function findCity(input: string): City | undefined {
  const n = normalize(input);
  if (!n) return undefined;
  return CITIES.find((c) => normalize(c.name) === n || c.aliases?.some((a) => normalize(a) === n));
}
