{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";

    flake-parts = {
      url = "github:hercules-ci/flake-parts";
      inputs.nixpkgs-lib.follows = "nixpkgs";
    };

    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    inputs@{ flake-parts, systems, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.git-hooks.flakeModule ];
      systems = import systems;

      perSystem =
        { config, pkgs, ... }:
        {
          devShells.default = pkgs.mkShell {
            inputsFrom = [ config.pre-commit.devShell ];

            packages = with pkgs; [
              bun
              nixd
              playwright-driver.browsers
            ];

            shellHook = ''
              export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
              export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            '';
          };

          pre-commit.settings = {
            package = pkgs.prek;
            hooks = {
              actionlint.enable = true;
              convco.enable = true;
              nil.enable = true;
              ripsecrets.enable = true;
              typos.enable = true;

              biome = {
                enable = true;
                args = [ "--indent-style=space" ];
              };
            };
          };
        };
    };
}
