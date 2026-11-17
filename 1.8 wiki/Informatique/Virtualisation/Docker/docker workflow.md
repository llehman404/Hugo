# chercher une image

`docker pull docker/getting-started` -> va chercher une image de conteneur docker. en l’occurence image test de docker

# Création et detruction de un conteneur

`docker images` -> liste les images présente sur le systéme

`docker run -d -p hostport:containerport namespace/name:tag` `docker run -d -p 8965:80 docker/getting-started:latest` :

\-d: Run in detached mode (doesn’t block your terminal) -p: Publish a container’s port to the host (forwarding) hostport: The port on your local machine containerport: The port inside the container namespace/name: The name of the image (usually in the format username/repo) tag: The version of the image (often latest)

`docker ps` -> montre les conteneur en cours exécution

`docker stop CONTAINER_ID` -> arrette le conteuneur proprement avec un signal SIGTERM

`docker kill` -> arrette le conteneur de facon forcer avec un signal SIGKILL. a utilisé en dernier ressort

exemple:

```bash
[loupulus@Vivacia:~]$ sudo docker ps
[sudo] Mot de passe de loupulus : 
CONTAINER ID   IMAGE                           COMMAND                  CREATED          STATUS          PORTS                                     NAMES
0a9654397a2e   docker/getting-started:latest   "/docker-entrypoint.…"   10 minutes ago   Up 10 minutes   0.0.0.0:8965->80/tcp, [::]:8965->80/tcp   laughing_agnesi

[loupulus@Vivacia:~]$ sudo docker stop 0a9654397a2e
0a9654397a2e

[loupulus@Vivacia:~]$ sudo docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

```

# Création et destruction de de plusieur machine

```bash
[root@Vivacia:~]# docker run -d -p 8965:80 docker/getting-started
docker run -d -p 8966:80 docker/getting-started
docker run -d -p 8967:80 docker/getting-started
docker run -d -p 8968:80 docker/getting-started
docker run -d -p 8969:80 docker/getting-started
3bf09ea388a25fcf3f41f4a5c5eb7c0152de0b7b67612e9b1353b09a9e802135
d27d7844e06010966e209129d7e971fe233103641131470beb2bd96b7f73596b
f4f479b148c94977448ca664edb1b1f3c0ed825374104e462683a1b3f4f289e4
508251a14c3951cdd9cf795beffa87180abcff2100ee18b8a0c1ced6aeec4cf1
0a3a85bdc2ea27955f4d95f2222b66027acbb2b97fb21e3cd602de3ecd3a1ca0

[root@Vivacia:~]# docker ps
CONTAINER ID   IMAGE                    COMMAND                  CREATED          STATUS          PORTS                                     NAMES
0a3a85bdc2ea   docker/getting-started   "/docker-entrypoint.…"   10 seconds ago   Up 9 seconds    0.0.0.0:8969->80/tcp, [::]:8969->80/tcp   nervous_ganguly
508251a14c39   docker/getting-started   "/docker-entrypoint.…"   11 seconds ago   Up 10 seconds   0.0.0.0:8968->80/tcp, [::]:8968->80/tcp   stupefied_carver
f4f479b148c9   docker/getting-started   "/docker-entrypoint.…"   11 seconds ago   Up 10 seconds   0.0.0.0:8967->80/tcp, [::]:8967->80/tcp   wonderful_mclean
d27d7844e060   docker/getting-started   "/docker-entrypoint.…"   12 seconds ago   Up 11 seconds   0.0.0.0:8966->80/tcp, [::]:8966->80/tcp   serene_spence
3bf09ea388a2   docker/getting-started   "/docker-entrypoint.…"   12 seconds ago   Up 11 seconds   0.0.0.0:8965->80/tcp, [::]:8965->80/tcp   adoring_elbakyan

[root@Vivacia:~]# docker stop nervous_ganguly stupefied_carver wonderful_mclean serene_spence adoring_elbakyannervous_ganguly
stupefied_carver
wonderful_mclean
serene_spence
adoring_elbakyan

[root@Vivacia:~]# docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

[root@Vivacia:~]# 

```

⚠ on peux aussi stoper les conteneur par leur nom.

# Création et management des volumes docker

## Creation du volume

```bash
[loupulus@Vivacia:~/.ssh]$ sudo docker volume ls
[sudo] Mot de passe de loupulus : 
DRIVER    VOLUME NAME

[loupulus@Vivacia:~/.ssh]$ sudo docker volume create ghost-vol
ghost-vol

[loupulus@Vivacia:~/.ssh]$ sudo docker volume ls
DRIVER    VOLUME NAME
local     ghost-vol

[loupulus@Vivacia:~/.ssh]$ sudo docker volume inspect ghost-vol
[
    {
        "CreatedAt": "2026-05-19T09:44:54+02:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/ghost-vol/_data",
        "Name": "ghost-vol",
        "Options": null,
        "Scope": "local"
    }
]
```

## Téléchargement de ghost

```bash
[loupulus@Vivacia:~/.ssh]$ sudo docker pull ghost
Using default tag: latest
latest: Pulling from library/ghost
9b02e9fcb401: Pull complete 
2d6acbc8e716: Pull complete 
17245302a67c: Pull complete 
3b703c5d9722: Pull complete 
2f26afb99d23: Pull complete 
14ea9fdefb62: Pull complete 
56b87a3f2664: Pull complete 
ffdbf1688a15: Pull complete 
4f4fb700ef54: Pull complete 
f87db157eb8b: Pull complete 
Digest: sha256:876880a26b770631949d9bf2aa4b62d169e2a2f1dad56e9b065ac5d6f1c346e1
Status: Downloaded newer image for ghost:latest
docker.io/library/ghost:latest

```

## Création du conteneur et montage du disque

```bash
[loupulus@Vivacia:~/.ssh]$ sudo docker run -d -e NODE_ENV=development -e url=http://localhost:3001 -p 3001:2368 -v ghost-vol:/var/lib/ghost ghost
fed43208cec0ff1050bc6a3ffc279df4c27361315f7c01ff28c141c4cf8198ae

[loupulus@Vivacia:~/.ssh]$ sudo docker ps
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                                         NAMES
fed43208cec0   ghost     "docker-entrypoint.s…"   21 seconds ago   Up 16 seconds   0.0.0.0:3001->2368/tcp, [::]:3001->2368/tcp   elastic_lederberg
```

- \-d runs the image in detached mode to avoid blocking the terminal.
- \-e NODE_ENV=development sets an environment variable within the container. This tells Ghost to run in “development” mode (rather than “production”, for instance)
- \-e url=http://localhost:3001 sets another environment variable, this one tells Ghost that we want to be able to access Ghost via a URL on our host machine.
- We’ve used -p before. -p 3001:2368 does some port-forwarding between the container and our host machine.
- \-v ghost-vol:/var/lib/ghost mounts the ghost-vol volume that we created before to the /var/lib/ghost path in the container. Ghost will use the /var/lib/ghost directory to persist stateful data (files) between runs.

# Changement de conteneur sur un même volume

## Arret du conteneur 

```bash
loupulus@Vivacia:~/.ssh]$ sudo docker ps
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                                         NAMES
fed43208cec0   ghost     "docker-entrypoint.s…"   21 seconds ago   Up 16 seconds   0.0.0.0:3001->2368/tcp, [::]:3001->2368/tcp   elastic_lederberg

[loupulus@Vivacia:~/.ssh]$ sudo docker stop elastic_lederberg
[sudo] Mot de passe de loupulus : 
elastic_lederberg
```
## supression du conteneur 

```bash
[loupulus@Vivacia:~/.ssh]$ sudo docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

[loupulus@Vivacia:~/.ssh]$ sudo docker ps --all
CONTAINER ID   IMAGE                           COMMAND                  CREATED          STATUS                      PORTS                                     NAMES
fed43208cec0   ghost                           "docker-entrypoint.s…"   18 minutes ago   Exited (0) 36 seconds ago                                             elastic_lederberg

[loupulus@Vivacia:~/.ssh]$ sudo docker rm elsatic_lederberg


[loupulus@Vivacia:~/.ssh]$ sudo docker ps -a 
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```
## créer et attaché le nouveaux volume 

```bash
[loupulus@Vivacia:~/.ssh]$ sudo docker run -d -e NODE_ENV=development -e url=http://localhost:3001 -p 3001:2368 -v ghost-vol:/var/lib/ghost ghost
c7bf2b533a38aaddce0781a76c8d0add0051835a289c4e214fca7fcfc375b1ab

[loupulus@Vivacia:~/.ssh]$ sudo docker ps 
CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS          PORTS                                         NAMES
c7bf2b533a38   ghost     "docker-entrypoint.s…"   12 seconds ago   Up 11 seconds   0.0.0.0:3001->2368/tcp, [::]:3001->2368/tcp   hungry_gates

```

## suprssion du volume 

```bash
[loupulus@Vivacia:~/.ssh]$ sudo docker volume ls
DRIVER    VOLUME NAME
local     ghost-vol

[loupulus@Vivacia:~/.ssh]$ sudo docker volume rm ghost-vol
ghost-vol

[loupulus@Vivacia:~/.ssh]$ sudo docker volume ls
DRIVER    VOLUME NAME
```
# Executer des commandes dans un conteneur avec EXEC

## Exemple ls 
```bash
s@Vivacia:~/.ssh]$ docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

[loupulus@Vivacia:~/.ssh]$ docker run -d -p 8965:80 docker/getting-started
193a47628465682d0984585b27d7e748298274d1aead901cc6eb89870c465d69

[loupulus@Vivacia:~/.ssh]$ docker ps
CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS         PORTS                                     NAMES
193a47628465   docker/getting-started   "/docker-entrypoint.…"   7 seconds ago   Up 6 seconds   0.0.0.0:8965->80/tcp, [::]:8965->80/tcp   recursing_lamarr

[loupulus@Vivacia:~/.ssh]$ docker exec recursing_lamarr ls
bin
dev
docker-entrypoint.d
docker-entrypoint.sh
etc
home
lib
media
mnt
opt
proc
root
run
sbin
srv
sys
tmp
usr
var
```
## Exemple touch 
```bash
[loupulus@Vivacia:~/.ssh]$ docker exec recursing_lamarr touch hacker.log

[loupulus@Vivacia:~/.ssh]$ docker exec recursing_lamarr ls
bin
dev
docker-entrypoint.d
docker-entrypoint.sh
etc
hacker.log
home
lib
media
mnt
opt
proc
root
run
sbin
srv
sys
tmp
usr
```
## Exemple netstat
```bash
[loupulus@Vivacia:~/.ssh]$ docker exec recursing_lamarr netstat -ltnp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1/nginx: master pro
tcp        0      0 :::80                   :::*                    LISTEN      1/nginx: master pro
```
## Ce connecté directement dans le shell 
```bash
loupulus@Vivacia:~/.ssh]$ docker exec -it recursing_lamarr /bin/sh

/usr/share/nginx/html # ls
404.html        assets          fonts           index.html      sitemap.xml     tutorial
50x.html        css             images          search          sitemap.xml.gz

/usr/share/nginx/html/tutorial # ls
image-building-best-practices  persisting-our-data            using-bind-mounts
index.html                     sharing-our-app                using-docker-compose
multi-container-apps           tutorial-in-dashboard.png      what-next
our-application                updating-our-app

/usr/share/nginx/html/tutorial # echo "I hacked you!" > index.html 

/usr/share/nginx/html/tutorial # cat index.html 
I hacked you!

/usr/share/nginx/html/tutorial # exit

[loupulus@Vivacia:~/.ssh]$ 

```
# Isoler un conteneur 

 on peux isolser un conteneur avec attribut  `--network none` 

```bash
[loupulus@Vivacia:~/.ssh]$ docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

[loupulus@Vivacia:~/.ssh]$ docker volume ls
DRIVER    VOLUME NAME

[loupulus@Vivacia:~/.ssh]$ docker run -d --network none docker/getting-started
6d8addc7d5e79baca3bc5299789d52fc749e339dee678fe697911f76dab79b3e

[loupulus@Vivacia:~/.ssh]$ docker ps
CONTAINER ID   IMAGE                    COMMAND                  CREATED         STATUS         PORTS     NAMES
6d8addc7d5e7   docker/getting-started   "/docker-entrypoint.…"   5 seconds ago   Up 4 seconds             sharp_dhawan

[loupulus@Vivacia:~/.ssh]$ docker volume ls
DRIVER    VOLUME NAME

[loupulus@Vivacia:~/.ssh]$ docker exec sharp_dhawan ping google.com -W 2
ping: bad address 'google.com 
```
# Répartition de charge 

## Installation d'un serveur web (caddy)
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ docker pull caddy
Using default tag: latest
latest: Pulling from library/caddy
Digest: sha256:ec18ee54aab3315c22e25f3b2babda73ff8007d39b13b3bd1bfffa2f0444c7d9
Status: Image is up to date for caddy:latest
docker.io/library/caddy:latest
```

## Creation des index html 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ micro index1.html

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ micro index2.html

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ ls
index1.html  index2.html
```
## lancement de deux docker (caddy + index1 et caddy + index 2)

```bash

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ docker run -d -p 8881:80 -v $PWD/index1.html:/usr/share/caddy/index.html caddy
10f2bb1c5bae9650f8785fd6b345600a8fa55655a10af61600d0619dcfbbc6cb

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ docker run -d -p 8882:80 -v $PWD/index2.html:/usr/share/caddy/index.html caddy
30d236d5332906dbd87aebe6f6f13162153eba37d499990573c1a3f0d01c9410
```
# Exemple basique de régulation de charge 

# Créer un réseaux 

```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ docker network create caddytest
e7603baa678eedd08df96cca39b33c79e69661d8318ebe925cd149223c21c38f

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ docker network ls
NETWORK ID     NAME        DRIVER    SCOPE
3b2aade601cf   bridge      bridge    local
e7603baa678e   caddytest   bridge    local
bf2ca9da577a   host        host      local
a8ba3893f07a   none        null      local
```
## Créer les conteneur caddy + index.html sur le reseaux caddytest
```bash

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$    docker run -d --name caddy1 --network caddytest -v $PWD/index1.html:/usr/share/caddy/index.html caddy
cf34cc78a62d55c40087add764fd461dad2bb6c2c2efd71809604f46572917c8

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$    docker run -d --name caddy2 --network caddytest -v $PWD/index1.html:/usr/share/caddy/index.html caddy
5166a55145778aaa6b84d65cede717165b608860ed91d98bdd5fa98086230bc6

```
- Use the --network caddytest flag to attach them to the network
- Use the --name flag to name them caddy1 and caddy2 respectively so it's easier to reference them later
- Place these flags before the image name (caddy) in your docker run command. For example:
- Do not use the -p flag to expose ports. We don't want these accessible from the host machine

  ## Créer un contenur basique avec acces sh directemen dedans
```
[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ docker run -it --network caddytest docker/getting-started /bin/sh
/ # 
```
-it sert a rentre en sh a la création 
 En donnant à nos conteneurs les noms caddy1 et caddy2, et en fournissant un réseau de type bridge, Docker a configuré pour nous la résolution de noms ! Les noms des conteneurs se résolvent vers les conteneurs individuels depuis tous les autres conteneurs du réseau.
```bash
/bin/sh

/ # curl caddy1
<html>
  <body>
    <h1>Hello from server 1</h1>
  </body>
</html>

/ # curl caddy2
<html>
  <body>
    <h1>Hello from server 1</h1>
  </body>
</html>
/ # 

````

## Configure le repartisseur de charge 

Créer un fichier  de configuration Caddyfile avec comme paramétre caddy1 et caddy2 en entré. les deux avec respectivemnet une sortie port http (80) 
Créer un conteneur avec le fichier caddy en parametre  et une image caddy 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ ls
index1.html  index2.html

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ micro Caddyfile

[loupulus@Vivacia:~/working_place/bootdev/docker/caddy]$ cat Caddyfile 
localhost:80

reverse_proxy caddy1:80 caddy2:80 {
        lb_policy       round_robin
}

docker run -d --network caddytest -p 8880:80 -v $PWD/Caddyfile:/etc/caddy/Caddyfile caddy
```

# Création d'un conteneur docker 

## Créer et écrire un docker file 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker]$ micro Dockerfile

[loupulus@Vivacia:~/working_place/bootdev/docker]$ lsd
 caddy   Dockerfile
```

```dockerfile
# This is a comment
# This is a Dockrefile

# Use a lightweight debian os
# as the base image
FROM debian:stable-slim

# execute the 'echo "hello world"'
# command when the container runs
CMD ["echo", "hello world"]

```

## Construire le conteneur lancer le conteneur 

```bash
[loupulus@Vivacia:~/working_place/bootdev/docker]$ docker build . -t helloworld:latest
[+] Building 0.9s (5/5) FINISHED                                                                      docker:default
 => [internal] load build definition from Dockerfile                                                            0.0s
 => => transferring dockerfile: 232B                                                                            0.0s
 => [internal] load metadata for docker.io/library/debian:stable-slim                                           0.6s
 => [internal] load .dockerignore                                                                               0.0s
 => => transferring context: 2B                                                                                 0.0s
 => CACHED [1/1] FROM docker.io/library/debian:stable-slim@sha256:5012d0517aa0075a7150a45aae67586641e898913b7a  0.0s
 => exporting to image                                                                                          0.0s
 => => exporting layers                                                                                         0.0s
 => => writing image sha256:b4935d8685e291f4ee68ed461be06ed194d016e938107c4b1c30140085d0dff1                    0.0s
 => => naming to docker.io/library/helloworld:latest                                                            0.0s
```

## Utilisation du conteneur 

```bash
[loupulus@Vivacia:~/working_place/bootdev/docker]$ docker run helloworld
hello world

[loupulus@Vivacia:~/working_place/bootdev/docker]$ docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

[loupulus@Vivacia:~/working_place/bootdev/docker]$ docker ps -a
CONTAINER ID   IMAGE        COMMAND                CREATED          STATUS                      PORTS     NAMES
bc8e550b42de   helloworld   "echo 'hello world'"   20 seconds ago   Exited (0) 19 seconds ago             intelligent_kowalevski

[loupulus@Vivacia:~/working_place/bootdev/docker]$ docker rm intelligent_kowalevski
intelligent_kowalevski

[loupulus@Vivacia:~/working_place/bootdev/docker]$ docker ps -a
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

```

## Cas concret 1

### Création d'un serveur http go (programme compilé)

#### Création du dossier go 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker]$ mkdir goserver

[loupulus@Vivacia:~/working_place/bootdev/docker]$ cd goserver

[loupulus@Vivacia:~/working_place/bootdev/docker]$ micro main.go 
```

#### Code du serveur go 
```go
package main

import (
        "fmt"
        "log"
        "net/http"
        "time"
)

func main() {
        m := http.NewServeMux()

        m.HandleFunc("/", handlePage)

        const port = "8010"
        srv := http.Server{
                Handler:      m,
                Addr:         ":" + port,
                WriteTimeout: 30 * time.Second,
                ReadTimeout:  30 * time.Second,
        }

        // this blocks forever, until the server
        // has an unrecoverable error
        fmt.Println("server started on ", port)
        err := srv.ListenAndServe()
        log.Fatal(err)
}

func handlePage(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "text/html")
        w.WriteHeader(200)
        const page = `<html>
<head></head>
<body>
        <p> Hello from Docker! I'm a Go server. </p>
</body>
</html>
`
        w.Write([]byte(page))
}

```
#### Init reposetori / compilation / test du programme 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ go mod init github.com/llehman404/goserver
go: creating new go.mod: module github.com/llehman404/goserver

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ ls
go.mod  main.go

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ go build
no Go files in /home/loupulus/working_place/bootdev/docker/goserver

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ ls
go.mod  goserver  main.go

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ ./goserver
server started on  8010

```
#### Création de image docker 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ ls
go.mod  goserver  main.go

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ micro Dockerfile

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ cat Dockerfile 
```
```dockerfile
# This is a  Dockerfile
FROM debian:stable-slim

# COPY source destination
COPY goserver /bin/goserver

CMD ["/bin/goserver"]

```
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ docker build . -t goserver:latest
[+] Building 0.7s (7/7) FINISHED                                                                      docker:default
 => [internal] load build definition from Dockerfile                                                            0.0s
 => => transferring dockerfile: 139B                                                                            0.0s
 => [internal] load metadata for docker.io/library/debian:stable-slim                                           0.4s
 => [internal] load .dockerignore                                                                               0.0s
 => => transferring context: 2B                                                                                 0.0s
 => [internal] load build context                                                                               0.0s
 => => transferring context: 32B                                                                                0.0s
 => [1/2] FROM docker.io/library/debian:stable-slim@sha256:5012d0517aa0075a7150a45aae67586641e898913b7af3b0822  0.0s
 => CACHED [2/2] COPY goserver /bin/goserver                                                                    0.0s
 => exporting to image                                                                                          0.0s
 => => exporting layers                                                                                         0.0s
 => => writing image sha256:9d5c47af0173b6ba787fc1dc66d3fa464a5fedf1ff1d8b2d069d163f66965c12                    0.0s
 => => naming to docker.io/library/goserver:latest                                                              0.0s

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ docker run -p 8010:8010 goserver
server started on  8010

```
#### On peux par exemple definir les ports de sortit 

On modifie la variable port dans  le main.go pour que elle aille chercher un port definit directement dans environement.: 

```go
package main

import (
        "fmt"
        "log"
        "net/http"
        "os"
        "time"
)

func main() {
        m := http.NewServeMux()

        m.HandleFunc("/", handlePage)

        port := os.Getenv("PORT") // variable modifier 
        srv := http.Server{
                Handler:      m,
                Addr:         ":" + port,
                WriteTimeout: 30 * time.Second,
                ReadTimeout:  30 * time.Second,
        }

        // this blocks forever, until the server
        // has an unrecoverable error
        fmt.Println("server started on ", port)
        err := srv.ListenAndServe()
        log.Fatal(err)
}

func handlePage(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "text/html")
        w.WriteHeader(200)
        const page = `<html>
<head></head>
<body>
        <p> Hello from Docker! I'm a Go server. </p>
</body>
</html>
`
        w.Write([]byte(page))
}

```
On modifie le docker file pour mettre en place un variable environement "PORT": 
```dockerfile
FROM debian:stable-slim

# COPY source destination
COPY goserver /bin/goserver

ENV PORT=8991

CMD ["/bin/goserver"]
```

on reconstruit l'image et on lance le conteneur, le port utilisé pour afficher la page web est bien le port 8991: 

```bash

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ docker build . -t goserver:latest
[+] Building 1.6s (7/7) FINISHED                                                                      docker:default
 => [internal] load build definition from Dockerfile                                                            0.0s
 => => transferring dockerfile: 154B                                                                            0.0s
 => [internal] load metadata for docker.io/library/debian:stable-slim                                           0.8s
 => [internal] load .dockerignore                                                                               0.0s
 => => transferring context: 2B                                                                                 0.0s
 => [internal] load build context                                                                               0.1s
 => => transferring context: 8.36MB                                                                             0.1s
 => CACHED [1/2] FROM docker.io/library/debian:stable-slim@sha256:5012d0517aa0075a7150a45aae67586641e898913b7a  0.0s
 => [2/2] COPY goserver /bin/goserver                                                                           0.1s
 => exporting to image                                                                                          0.3s
 => => exporting layers                                                                                         0.2s
 => => writing image sha256:c7c32d64db0a5ba0856e536226ff1b35309934428a85cd4bca711bc6d3224a48                    0.0s
 => => naming to docker.io/library/goserver:latest                                                              0.0s

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ docker run -p 8991:8991 goserver
server started on  8991
```

# Cas concret 2 

## Encapsulation d'un programme python (language interpréter)
Ce programme sera un bookbot qui va compter le nombre de character dans un livre.
Nous aurons donc besoins d'un fichier main.py et d'un livre situé dans un dossier /books: 

### Création du programme 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ micro main.py
```
```python
#main.py  script 

def main():
    book_path = "books/frankenstein.txt"
    text = get_book_text(book_path)
    num_words = get_num_words(text)
    chars_dict = get_chars_dict(text)
    chars_sorted_list = chars_dict_to_sorted_list(chars_dict)

    print(f"--- Begin report of {book_path} ---")
    print(f"{num_words} words found in the document")
    print()

    for item in chars_sorted_list:
        if not item["char"].isalpha():
            continue
        print(f"The '{item['char']}' character was found {item['num']} times")

    print("--- End report ---")


def get_num_words(text):
    words = text.split()
    return len(words)


def sort_on(d):
    return d["num"]


def chars_dict_to_sorted_list(num_chars_dict):
    sorted_list = []
    for ch in num_chars_dict:
        sorted_list.append({"char": ch, "num": num_chars_dict[ch]})
    sorted_list.sort(reverse=True, key=sort_on)
    return sorted_list


def get_chars_dict(text):
    chars = {}
    for c in text:
        lowered = c.lower()
        if lowered in chars:
            chars[lowered] += 1
        else:
            chars[lowered] = 1
    return chars


def get_book_text(path):
    with open(path) as f:
        return f.read()


main()
```

### Création du dossier 
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/python_scrypt]$ mkdir books

[loupulus@Vivacia:~/working_place/bootdev/docker/python_scrypt]$ ls
books main.py
```

### Création du fichier de configuration Docker 

```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/python_scrypt]$ micro Dockerfile.py 

[loupulus@Vivacia:~/working_place/bootdev/docker/python_scrypt]$ cat
```
```dockerfile
# This is a Dockerfile
# Build from a slim Debian/Linux image
FROM debian:stable-slim

# Update apt
RUN apt update
RUN apt upgrade -y

# Install build tooling
RUN apt install -y build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev libsqlite3-dev wget libbz2-dev

# Download Python interpreter code and unpack it
RUN wget https://www.python.org/ftp/python/3.10.8/Python-3.10.8.tgz
RUN tar -xf Python-3.10.*.tgz

# Build the Python interpreter
RUN cd Python-3.10.8 && ./configure --enable-optimizations && make && make altinstall

# Copy our code into the image
COPY main.py main.py

# Copy our data dependencies
COPY books/ books/

# Run our Python script
CMD ["python3.10", "main.py"]

```
**on remarquera que il y a une nouvelle commnde RUN dans ce Dockerfile. Commande que on ne retrouvait pas dans le Dockerfile du programme go. La raisons est que le languge go est un language compilé et donc directement executable. il nous suffit dons d'importer le binaire. le python ètant un language Interprété il a besoins de Télécharger (apt install, wget) et d'installer tout un environement pour fonctionner.**
```bash
[loupulus@Vivacia:~/working_place/bootdev/docker/python_scrypt]$ ls 
books Dockerfile.py main.py 

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ docker build -t bookbot -f Dockerfile.py .
[+] Building 451.4s (14/14) FINISHED                                                                  docker:default
 => [internal] load build definition from Dockerfile.py                                                         0.0s
 => => transferring dockerfile: 756B                                                                            0.0s
 => [internal] load metadata for docker.io/library/debian:stable-slim                                           0.8s
 => [internal] load .dockerignore                                                                               0.0s
 => => transferring context: 2B                                                                                 0.0s
 => CACHED [1/9] FROM docker.io/library/debian:stable-slim@sha256:5012d0517aa0075a7150a45aae67586641e898913b7a  0.0s
 => [internal] load build context                                                                               0.0s
 => => transferring context: 97B                                                                                0.0s
 => [2/9] RUN apt update                                                                                        1.8s
 => [3/9] RUN apt upgrade -y                                                                                    1.1s
 => [4/9] RUN apt install -y build-essential zlib1g-dev libncurses5-dev libgdbm-dev libnss3-dev libssl-dev li  30.9s 
 => [5/9] RUN wget https://www.python.org/ftp/python/3.10.8/Python-3.10.8.tgz                                   0.8s 
 => [6/9] RUN tar -xf Python-3.10.*.tgz                                                                         0.9s 
 => [7/9] RUN cd Python-3.10.8 && ./configure --enable-optimizations && make && make altinstall               411.8s 
 => [8/9] COPY main.py main.py                                                                                  0.3s 
 => [9/9] COPY books/ books/                                                                                    0.2s 
 => exporting to image                                                                                          2.3s 
 => => exporting layers                                                                                         2.2s 
 => => writing image sha256:aee14bb1321eb3342ba834833e3c35c767cfb3eb4b36a1f98e00d1d3422c5c90                    0.0s 
 => => naming to docker.io/library/bookbot      

[loupulus@Vivacia:~/working_place/bootdev/docker/goserver]$ docker run bookbot
--- Begin report of books/frankenstein.txt ---
77986 words found in the document

The 'e' character was found 46043 times
The 't' character was found 30365 times
The 'a' character was found 26743 times
The 'o' character was found 25225 times
The 'i' character was found 24613 times
The 'n' character was found 24367 times
The 's' character was found 21155 times
The 'r' character was found 20818 times
The 'h' character was found 19725 times
The 'd' character was found 16863 times
The 'l' character was found 12739 times
The 'm' character was found 10604 times
The 'u' character was found 10407 times
The 'c' character was found 9243 times
The 'f' character was found 8731 times
The 'y' character was found 7914 times
The 'w' character was found 7638 times
The 'p' character was found 6121 times
The 'g' character was found 5974 times
The 'b' character was found 5026 times
The 'v' character was found 3833 times
The 'k' character was found 1755 times
The 'x' character was found 677 times
The 'j' character was found 504 times
The 'q' character was found 324 times
The 'z' character was found 243 times
--- End report ---
```