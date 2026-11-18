{
  description = "Poopy Bird: a browser game controlled by straining your face at the webcam.";

  inputs = {
    # Same release as the infra that deploys it.
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
  };

  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      # The production build: dist/ as static files, to be served by any web server.
      packages.${system} = {
        default = self.packages.${system}.poopybird;
        poopybird = pkgs.callPackage ./nix/poopybird.nix {
          src = self;
          commit = self.shortRev or self.dirtyShortRev or "unknown";
        };
      };

      formatter.${system} = pkgs.nixfmt-tree;

      checks.${system}.poopybird = self.packages.${system}.poopybird;
    };
}
