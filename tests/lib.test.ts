import assert from "node:assert/strict";
import { test } from "node:test";
import { brl } from "../lib/format.ts";
import { cardImage, isGame } from "../lib/types.ts";

test("brl formata em reais", () => {
  assert.match(brl(1234.5), /1\.234,50/);
  assert.match(brl(0), /0,00/);
});

test("isGame só aceita jogos conhecidos", () => {
  assert.equal(isGame("pokemon"), true);
  assert.equal(isGame("riftbound"), true);
  assert.equal(isGame("outro"), false);
});

test("cardImage prioriza foto própria, depois a da API, depois o verso", () => {
  assert.equal(cardImage({ photo_urls: ["a.jpg"], image_api_url: "b.jpg" }), "a.jpg");
  assert.equal(cardImage({ photo_urls: [], image_api_url: "b.jpg" }), "b.jpg");
  assert.equal(cardImage({ photo_urls: [], image_api_url: null }), "/card-back.svg");
});
