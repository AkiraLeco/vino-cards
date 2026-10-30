import assert from "node:assert/strict";
import { test } from "node:test";
import { normNum } from "../lib/liga.ts";
import { UUID, csvCell, safeUrl } from "../lib/validation.ts";
import { whatsappUrl, type CartLine } from "../lib/whatsapp.ts";

const SUPA = "https://abc.supabase.co";

test("UUID aceita ids válidos e recusa o resto", () => {
  assert.equal(UUID.test("41e22b67-4daf-4fa9-9030-d09f53a59c8d"), true);
  assert.equal(UUID.test("abc"), false);
  assert.equal(UUID.test("41e22b67-4daf-4fa9-9030-d09f53a59c8d'; drop"), false);
});

test("safeUrl só aceita https de hosts conhecidos", () => {
  assert.equal(safeUrl("https://images.pokemontcg.io/basep/1.png", SUPA), true);
  assert.equal(safeUrl("https://abc.supabase.co/storage/v1/object/public/card-photos/a.jpg", SUPA), true);
  assert.equal(safeUrl("http://images.pokemontcg.io/a.png", SUPA), false);
  assert.equal(safeUrl("javascript:alert(1)", SUPA), false);
  assert.equal(safeUrl("https://evil.example/a.png", SUPA), false);
  assert.equal(safeUrl("não é url", SUPA), false);
});

test("csvCell escapa aspas e neutraliza fórmulas", () => {
  assert.equal(csvCell('Pika "chu"'), '"Pika ""chu"""');
  assert.equal(csvCell("=HYPERLINK(1)"), `"'=HYPERLINK(1)"`);
  assert.equal(csvCell("@cmd"), `"'@cmd"`);
  assert.equal(csvCell("-5"), '"-5"'); // número negativo continua número
  assert.equal(csvCell(null), '""');
});

test("normNum ignora zeros à esquerda e caixa", () => {
  assert.equal(normNum("007"), "7");
  assert.equal(normNum("0"), "0");
  assert.equal(normNum("TG05"), "tg05");
});

test("whatsappUrl monta a mensagem com total e número do pedido", () => {
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER = "5511999999999";
  const lines: CartLine[] = [
    { id: "i1", name: "Pikachu", condition: "NM", price: 10, qty: 2 },
    { id: "i2", name: "Booster", condition: "NM", price: 5.5, qty: 1 },
  ];
  const url = whatsappUrl(lines, "https://loja.exemplo", 42);
  assert.ok(url.startsWith("https://wa.me/5511999999999?text="));
  const text = decodeURIComponent(url.split("text=")[1]);
  assert.match(text, /pedido #0042/);
  assert.match(text, /2x Pikachu/);
  assert.match(text, /https:\/\/loja\.exemplo\/cartas\/i1/);
  assert.match(text, /Total: R\$\s?25,50/);
  assert.doesNotMatch(decodeURIComponent(whatsappUrl(lines, "https://x").split("text=")[1]), /pedido #/);
});
