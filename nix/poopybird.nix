# The game's production build (`npm run build`), installed as a directory of
# static files. The web server in front of it must serve .wasm as
# application/wasm and .m4a as audio/mp4, and HTTPS (the camera needs it).
{
  lib,
  buildNpmPackage,
  fetchurl,
  nodejs_24,
  src,
  commit,
}:

let
  # The MediaPipe face model that `npm run fetch-model` downloads (the build has no network).
  faceModel = fetchurl {
    url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
    hash = "sha256-ZBhOIpsmMQe8K4BMZiXbE0H/K7cxh0sLzC/mVE4Lyf8=";
  };
in
buildNpmPackage {
  pname = "poopybird";
  version = commit;

  src = lib.fileset.toSource {
    root = ../.;
    fileset = lib.fileset.unions [
      ../package.json
      ../package-lock.json
      ../index.html
      ../privacy.html
      ../vite.config.ts
      ../tsconfig.json
      ../tsconfig.node.json
      ../public
      ../scripts
      ../src
      ../collector
    ];
  };

  nodejs = nodejs_24;
  # Update after every package-lock.json change: set it to "" and take the hash `nix build` reports.
  npmDepsHash = "sha256-1oam4KTS2hkF3PQ5tH5MpBcw2pyuNh3rLU+p8Yv5WGc=";

  env.APP_COMMIT = commit;

  preBuild = ''
    install -Dm644 ${faceModel} public/mediapipe/face_landmarker.task
  '';

  installPhase = ''
    runHook preInstall
    cp -r dist $out
    runHook postInstall
  '';

  meta.description = "Poopy Bird, built as static files";
}
