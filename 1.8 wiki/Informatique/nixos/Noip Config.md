install noip in nixos conifg file :

``environment.systemPackages = with pkgs; [noip]``


run to create a config nile in etc :

``/nix/store/*-noip-2.1.9-1/bin/noip2 -C -c /etc/no-ip2.conf``

saisir : 
- email
- mot de passe
- hostname 

create systemd service in nixos config file  :

````systemd.services.noip = {
    description = "No-IP Dynamic DNS Client";
    wantedBy = [ "multi-user.target" ];
    serviceConfig = {
      Type = "forking";
      Restart = "on-failure";
      RestartSec = 60;
    };
    script = ''
      ${pkgs.noip}/bin/noip2 -c /etc/no-ip2.conf
    '';
  };


