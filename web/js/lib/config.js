/* Shared addresses for the website. data-source.js repeats these defaults so a page still works if this
   file is not loaded. Change the questions block in both places, then follow docs/DATA.md. */
(function () {
  "use strict";
  window.KG = window.KG || {};
  // Question files are not on the website and not on main. They are on the game-data branch.
  // The branch keeps the game-data/ folder, so the raw URL has that name twice.
  window.KG.questions = window.KG.questions || {
    repo: "bawcejawn/KnodeGames2",
    ref: "game-data",
    prefix: "game-data/",
  };
})();
