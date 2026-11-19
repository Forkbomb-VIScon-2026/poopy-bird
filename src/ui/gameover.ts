// The game-over screen: the run's stats and the run in pictures.

import type { Game } from "../game";
import { pick } from "../random";
import { drawFrontPage, drawTrophyPrint, drawWeddingPrint, newCanvas, type Photo } from "../render";
import { $, show } from "./dom";

/** The title and the stats of the run that just ended. */
export function showRunStats(game: Game, best: number, newBest: boolean): void {
  $("go-title").textContent = game.trophy !== null
    ? pick(["Hooked!", "Reeled in!", "Gone fishing.", "Fish and chips!"])
    : pick(["Splat!", "Plop.", "Flushed!", "Wiped out!", "Down the drain!"]);
  show($("go-newbest"), newBest);
  const stats: Record<string, string | number> = {
    "go-score": game.score,
    "go-best": best,
    "go-targets": game.targetsHit,
    "go-combo": game.bestCombo > 1 ? `x${game.bestCombo}` : game.bestCombo,
    "go-distance": `${Math.round(game.distance / 50)} m`,
    "go-accidents": game.accidents,
    "go-smashed": game.camerasSmashed,
    "go-scandals": game.frontPages.length,
    "go-kids": game.kidsDisarmed + game.pebblesShot,
    "go-weddings": game.weddingsRuined,
    "go-balloons": game.balloonsPopped,
    "go-lines": game.anglersSnapped,
    "go-sharks": game.sharksSpiked,
  };
  for (const [id, value] of Object.entries(stats)) $(id).textContent = String(value);
}

/** The game-over prints' canvases have this many pixels per logical unit, so they stay sharp. */
const PRINT_SCALE = 2;

/**
 * The run in pictures on the game-over screen, all on one level: the finest
 * strain (static in index.html, first), then every front page, wedding photo
 * and the trophy photo in the order they were taken (photo ids count up).
 */
/** Drops the last run's pictures from the game-over screen (the privacy page: gone when you play again). */
export function clearRunPhotos(): void {
  for (const el of $("go-photos").querySelectorAll(".go-print:not(#go-snapshot)")) el.remove();
  $<HTMLImageElement>("go-snapshot-img").removeAttribute("src");
}

export function showRunPhotos(game: Game, photos: ReadonlyMap<number, Photo>, hasSnapshot: boolean): void {
  const strip = $("go-photos");
  for (const el of strip.querySelectorAll(".go-print:not(#go-snapshot)")) el.remove();
  type Print = { photoId: number; title: string; kind: string; w: number; h: number; draw: (ctx: CanvasRenderingContext2D) => void };
  const prints: Print[] = [
    ...game.frontPages.map((t): Print => ({
      photoId: t.photoId, title: "Tomorrow's front page", kind: "frontpage", w: 200, h: 240,
      draw: (ctx) => drawFrontPage(ctx, 2, 2, 196, 236, t, photos),
    })),
    ...game.weddingPhotos.map((w): Print => ({
      photoId: w.photoId, title: "The official wedding photo", kind: "wedding", w: 250, h: 235,
      draw: (ctx) => drawWeddingPrint(ctx, 2, 2, 240, w, photos.get(w.photoId)),
    })),
  ];
  const trophy = game.trophy;
  if (trophy !== null) {
    prints.push({
      photoId: trophy, title: "Catch of the day", kind: "trophy", w: 250, h: 235,
      draw: (ctx) => drawTrophyPrint(ctx, 2, 2, 240, photos.get(trophy)),
    });
  }
  prints.sort((a, b) => a.photoId - b.photoId);
  for (const p of prints) {
    const figure = document.createElement("figure");
    figure.className = `go-print ${p.kind}`;
    figure.title = p.title;
    const print = newCanvas(p.w * PRINT_SCALE, p.h * PRINT_SCALE);
    if (!print) continue;
    print.canvas.setAttribute("role", "img");
    print.canvas.setAttribute("aria-label", p.title);
    print.ctx.scale(PRINT_SCALE, PRINT_SCALE);
    p.draw(print.ctx);
    figure.append(print.canvas);
    strip.append(figure);
  }
  show(strip, prints.length > 0 || hasSnapshot);
  strip.scrollLeft = 0;
}
