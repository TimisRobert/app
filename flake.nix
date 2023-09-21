{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";

    devshell.url = "github:numtide/devshell";
    devshell.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = inputs@{ flake-parts, nixpkgs, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "aarch64-darwin" "x86_64-linux" ];
      imports = [ inputs.devshell.flakeModule ];
      perSystem = { config, pkgs, lib, self', inputs', ... }: {
        devshells.default = {
          packages = [
            pkgs.nodejs_18
            pkgs.nodePackages.pnpm
            pkgs.postgresql
            pkgs.awscli2
          ];

          env = [
            {
              name = "PGDATA";
              eval = "$PRJ_DATA_DIR/.db";
            }
            {
              name = "PGHOST";
              eval = "$PRJ_DATA_DIR/.db";
            }
          ];

          serviceGroups = {
            local = {
              services.sst.command = "pnpm dev";
              services.api.command = "pnpm --filter '@app/api' dev";
              services.web.command = "pnpm --filter '@app/web' dev";
              services.postgres.command =
                "postgres -c unix_socket_directories=$PGDATA";
            };
          };

          commands = [{
            name = "migrate";
            help = "generate and apply migrations";
            command = ''
              pnpm --filter '@app/core' generate && pnpm --filter '@app/core' migrate;
            '';
          }];

          devshell.startup.setup_database.text = ''
            if [[ ! -d "$PGDATA" ]]; then
              mkdir -p $PGDATA
              initdb -U postgres
              pg_ctl -o "-c unix_socket_directories=$PGDATA" start
              createdb -U postgres app
              pg_ctl stop
            fi
          '';
        };
      };
    };
}
