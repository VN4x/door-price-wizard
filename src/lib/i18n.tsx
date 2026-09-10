import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LANGS = [
  { id: "et", label: "Eesti" },
  { id: "en", label: "English" },
  { id: "ru", label: "Русский" },
  { id: "fi", label: "Suomi" },
  { id: "sv", label: "Svenska" },
] as const;

export type Lang = (typeof LANGS)[number]["id"];

const STORAGE_KEY = "kv.lang.v1";

/**
 * Customer-facing wording. Estonian is the default; anything not translated yet
 * falls back to Estonian, then to the key itself, so no screen can break.
 */
type Dict = Record<string, string>;

const et: Dict = {
  "nav.prices": "Hinnad",
  "nav.outlet": "Laoluuk",
  "nav.configure": "Koosta uks",
  "nav.differences": "Slide või HST",
  "nav.cart": "Korv",
  "home.eyebrow": "Rehau Synego Slide ja HST · Siegenia sulused",
  "home.title": "Sinu liugukse hind kohe",
  "home.lead":
    "Sisesta ava mõõdud. Näitame mõlemat süsteemi kõrvuti koos käibemaksuga, paigaldus ja transport eraldi.",
  "home.opening": "Sinu ava",
  "home.width": "Laius",
  "home.height": "Kõrgus",
  "home.options": "Lisad",
  "home.glass": "Klaas",
  "home.wantIt": "Soovin seda",
  "home.included": "sisaldub",
  "home.fitting": "Paigaldus, hinnanguline",
  "home.delivery": "Transport, hinnanguline",
  "home.deliveryTime": "Tarneaeg",
  "home.whiteNote": "Valge mõlemalt poolt, käibemaksuga",
  "home.footnote":
    "Hinnad sisaldavad käibemaksu ja on esialgsed kuni mõõtude kinnitamiseni. Paigaldus ja transport on hinnangulised Mandri-Eestis.",
  "diff.link": "Slide või HST – mis vahet on?",
  "cta.getOffer": "Küsi pakkumist",
};

const en: Dict = {
  "nav.prices": "Prices",
  "nav.outlet": "Outlet",
  "nav.configure": "Configure",
  "nav.differences": "Slide or HST",
  "nav.cart": "Cart",
  "home.eyebrow": "Rehau Synego Slide & HST · Siegenia hardware",
  "home.title": "Your sliding door price, right now",
  "home.lead":
    "Enter your opening. Both systems are priced side by side, including VAT, with fitting and delivery estimated separately.",
  "home.opening": "Your opening",
  "home.width": "Width",
  "home.height": "Height",
  "home.options": "Options",
  "home.glass": "Glass",
  "home.wantIt": "I want it",
  "home.included": "included",
  "home.fitting": "Fitting, estimated",
  "home.delivery": "Delivery, estimated",
  "home.deliveryTime": "Delivery time",
  "home.whiteNote": "White both sides, incl. VAT",
  "home.footnote":
    "Prices include VAT and are indicative until we confirm the measurements. Fitting and delivery are estimates for mainland Estonia.",
  "diff.link": "Slide or HST — the differences",
  "cta.getOffer": "Get my offer",
};

const ru: Dict = {
  "nav.prices": "Цены",
  "nav.outlet": "Склад",
  "nav.configure": "Собрать дверь",
  "nav.differences": "Slide или HST",
  "nav.cart": "Корзина",
  "home.eyebrow": "Rehau Synego Slide и HST · фурнитура Siegenia",
  "home.title": "Цена вашей раздвижной двери сразу",
  "home.lead":
    "Введите размеры проёма. Обе системы показаны рядом, с НДС; монтаж и доставка считаются отдельно.",
  "home.opening": "Ваш проём",
  "home.width": "Ширина",
  "home.height": "Высота",
  "home.options": "Дополнения",
  "home.glass": "Стекло",
  "home.wantIt": "Хочу такую",
  "home.included": "входит",
  "home.fitting": "Монтаж, ориентировочно",
  "home.delivery": "Доставка, ориентировочно",
  "home.deliveryTime": "Срок поставки",
  "home.whiteNote": "Белый с двух сторон, с НДС",
  "home.footnote":
    "Цены с НДС и предварительные до подтверждения размеров. Монтаж и доставка ориентировочны для материковой Эстонии.",
  "diff.link": "Slide или HST — в чём разница",
  "cta.getOffer": "Получить предложение",
};

const fi: Dict = {
  "nav.prices": "Hinnat",
  "nav.outlet": "Outlet",
  "nav.configure": "Kokoa ovi",
  "nav.differences": "Slide vai HST",
  "nav.cart": "Kori",
  "home.eyebrow": "Rehau Synego Slide ja HST · Siegenia-helat",
  "home.title": "Liukuovesi hinta heti",
  "home.lead":
    "Syötä aukon mitat. Molemmat järjestelmät rinnakkain, alv mukana; asennus ja toimitus erikseen.",
  "home.opening": "Aukkosi",
  "home.width": "Leveys",
  "home.height": "Korkeus",
  "home.options": "Lisät",
  "home.glass": "Lasi",
  "home.wantIt": "Haluan tämän",
  "home.included": "sisältyy",
  "home.fitting": "Asennus, arvio",
  "home.delivery": "Toimitus, arvio",
  "home.deliveryTime": "Toimitusaika",
  "home.whiteNote": "Valkoinen molemmin puolin, alv mukana",
  "home.footnote":
    "Hinnat sisältävät alvin ja ovat ohjeellisia mittojen vahvistamiseen asti. Asennus ja toimitus ovat arvioita Manner-Viroon.",
  "diff.link": "Slide vai HST — erot",
  "cta.getOffer": "Pyydä tarjous",
};

const sv: Dict = {
  "nav.prices": "Priser",
  "nav.outlet": "Outlet",
  "nav.configure": "Bygg din dörr",
  "nav.differences": "Slide eller HST",
  "nav.cart": "Varukorg",
  "home.eyebrow": "Rehau Synego Slide och HST · Siegenia-beslag",
  "home.title": "Priset på din skjutdörr direkt",
  "home.lead":
    "Ange öppningens mått. Båda systemen visas sida vid sida med moms; montering och frakt räknas separat.",
  "home.opening": "Din öppning",
  "home.width": "Bredd",
  "home.height": "Höjd",
  "home.options": "Tillval",
  "home.glass": "Glas",
  "home.wantIt": "Jag vill ha den",
  "home.included": "ingår",
  "home.fitting": "Montering, uppskattad",
  "home.delivery": "Frakt, uppskattad",
  "home.deliveryTime": "Leveranstid",
  "home.whiteNote": "Vit på båda sidor, inkl. moms",
  "home.footnote":
    "Priserna inkluderar moms och är preliminära till måtten är bekräftade. Montering och frakt är uppskattningar för fastlandet.",
  "diff.link": "Slide eller HST — skillnaderna",
  "cta.getOffer": "Begär offert",
};

const DICTS: Record<Lang, Dict> = { et, en, ru, fi, sv };

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("et");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && stored in DICTS) setLang(stored);
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang: (l) => {
        setLang(l);
        try {
          window.localStorage.setItem(STORAGE_KEY, l);
        } catch {
          /* private mode — the choice simply does not persist */
        }
      },
      t: (key) => DICTS[lang][key] ?? et[key] ?? key,
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) return { lang: "et", setLang: () => {}, t: (key) => et[key] ?? key };
  return ctx;
}
