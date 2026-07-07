# Layero Shop UI for Elementor + WooCommerce

WordPress plugin a `C:\layero webshop` aktuális statikus shopjának Elementor + WooCommerce újraépítéséhez.

A cél: a design, a widgetek, a hero slider, a kategóriák és a Layero élmény a pluginből jöjjön, de a webshop motorja WooCommerce maradjon: termékek, árak, kosár, checkout, fizetés, kuponok, rendelések.

## Aktuális shop szinkron

A plugin jelenleg a statikus shop alábbi tartalmaira épül:

- 3 főoldali hero slide
- 6 kategória: `lampak`, `kulcstartok`, `dekoraciok`, `ceges`, `rajongoi`, `egyedi`
- 20 Layero termék demó/fallback adata
- népszerű termék sorrend
- `karacsonyi-lampa` mint hónap terméke fallback
- shopos trust bar: ingyenes szállítás, 50 lej minimum, gyors gyártás, PLA + napelemes gyártás
- demo képek a pluginben: `assets/demo`

## Elementor widgetek

Az Elementor szerkesztőben a `Layero Shop` kategória alatt:

- `Layero főoldali slider`
- `Layero termékrács`
- `Layero kategóriák`
- `Layero kiemelt termék`
- `Layero bizalmi sáv`
- `Layero Lab előnézet`

## WooCommerce integráció

A termékoldalon a plugin személyre szabási mezőket ad:

- Felirat / név
- Méret: Kicsi, Közepes, Nagy
- Szín: Natúr, Fekete, Fehér
- Egyedi megjegyzés

Ezek bekerülnek:

- kosár tételadatba
- checkout tételadatba
- rendelési tétel metaadatba

Shortcode:

```text
[layero_mini_cart]
```

## Online építés menete

1. A WooCommerce-ben hozd létre a kategóriákat a fenti slugokkal.
2. A termékek slugjai lehetőleg egyezzenek a statikus shop `shop-data.js` id mezőivel.
3. Tölts fel rendes WooCommerce termékképeket.
4. Elementorral rakd össze az oldalt a Layero widgetekből.
5. Amíg nincs minden Woo adat kész, a widgetek a plugin `assets/demo` képeiből és `Shop_Content` fallback adataiból építik fel a látványt.

## Lokális hely

```text
C:\layero webshop\layero_shop_00_2026
```

Remote:

```text
https://github.com/SimonTamass/layero_shop_00_2026.git
```

Megjegyzés: a push GitHub jogosultságot igényel a repón. A helyi Git jelenleg elkészíthető, de push csak olyan GitHub felhasználóval megy, akinek van joga a `SimonTamass/layero_shop_00_2026` repóhoz.
