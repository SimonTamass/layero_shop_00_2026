# Layero Shop UI for Elementor + WooCommerce

WordPress plugin a Layero shop vizualis rendszerhez. A cel: WooCommerce maradjon a webshop motorja, Elementor widgetekbol pedig osszerakhato legyen a Layero shop frontend.

## Mit ad a plugin?

- Elementor widget kategoria: `Layero Shop`
- Widgetek:
  - Layero hero slider
  - Layero termekracs WooCommerce termekekbol
  - Layero kategoriak WooCommerce kategoriakbol
  - Layero kiemelt termek
  - Layero bizalmi sav
  - Layero Lab elo-nezet
- WooCommerce szemelyre szabasi mezok:
  - felirat / nev
  - egyedi megjegyzes
  - bekerul a kosarba
  - bekerul a rendeles teteleihez
- Shortcode:
  - `[layero_mini_cart]`

## Telepites

1. Masold a plugin mappat a WordPress `wp-content/plugins/layero-shop-ui` ala.
2. Aktivalt pluginok:
   - Elementor
   - WooCommerce
   - Layero Shop UI for Elementor + WooCommerce
3. Elementor szerkesztoben keresd a `Layero Shop` kategoriat.

## Javasolt hasznalat

- Elementorral epitsd a shop landinget es kategoriablokkokat.
- A termekadatok, arak, kuponok, checkout, fizetes es rendeleskezeles maradjon WooCommerce-ben.
- A checkoutot elsokorben ne irjuk ujra, csak stilusozzuk, hogy kompatibilis maradjon a fizetesi/szallitasi pluginokkal.

## Fejlesztesi allapot

Elso scaffold verzio. A widgetek mukodo alapok, a kovetkezo korben johet:

- Elementor style controls widgetenkent
- AJAX mini cart drawer
- WooCommerce archive/single template design override
- product filter widget
- brand/header widget
- Layero Lab 3D-s canvas portolasa

