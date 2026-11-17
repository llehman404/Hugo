# creation est manipulation des conteneur
`docker pull [docker/getting-started]` -> Télécharge une image docker 
`docker images` -> list les images docker 
`docker run -d -p [hostport:containerport] [namespace/name:tag]` -> démarre un conteneur docker a partire d'une image en précisant le port écoute de la machine hôte et du conteneur 
- -d: Run in detached mode (doesn't block your terminal)
- -p: Publish a container's port to the host (forwarding)
- hostport: The port on your local machine
- containerport: The port inside the containernamespace/name: The name of the image (usually in the format username/repo)
- tag: The version of the image (often latest)
`docker ps -a []` -> liste les processus docker en cours avec leur ID  et nom du conteneur 
`docker stop [id] ou [NAMES]`
`docker rm []`

# Creation est manipulation des volumes 


`docker volume create []` -> crée un volume pour stokcer des datas
`docker volume ls` -> liste les volumes présent sur la machine
`docker volume inspect []`  -> donne des informations sur le volume, en particulier son point de montage 
`docker volume rm []`

# Execute des commandes dans un conteneur

`docker exec CONTAINE_ID []` -> Permet executer des commandes a intérieur d'un conteneur
`docker exec -it CONTAINER_ID /bin/sh` -> Permet de démarre et accéder à un shell directement dans la machine

# Exemple Concret 

Ghost is an open-source blogging software, kind of like WordPress. As you can imagine, blogging software that doesn't save your blog posts, would be pretty useless, so we'll install Ghost and use volumes to persist our data!

    Create a new empty volume called ghost-vol:

docker volume create ghost-vol

    Make sure it worked:

docker volume ls

    Inspect the volume to see where it is on your local machine:

docker volume inspect ghost-vol

Docker hosts an official image for Ghost on Docker Hub.

    Pull the Ghost image from Docker Hub:

docker pull ghost

    Run the Ghost image in a new container:

docker run -d -e NODE_ENV=development -e url=http://localhost:3001 -p 3001:2368 -v ghost-vol:/var/lib/ghost ghost

    -d runs the image in detached mode to avoid blocking the terminal.
    -e NODE_ENV=development sets an environment variable within the container. This tells Ghost to run in "development" mode (rather than "production", for instance)
    -e url=http://localhost:3001 sets another environment variable, this one tells Ghost that we want to be able to access Ghost via a URL on our host machine.
    We've used -p before. -p 3001:2368 does some port-forwarding between the container and our host machine.
    -v ghost-vol:/var/lib/ghost mounts the ghost-vol volume that we created before to the /var/lib/ghost path in the container. Ghost will use the /var/lib/ghost directory to persist stateful data (files) between runs.

    Navigate to http://localhost:3001/ in your browser, you should see your new Ghost CMS!

Run and submit the CLI tests against http://localhost:3001.

supprimer tous les conteneur et volume cd ~/nextcloud && sudo docker compose down -v && sudo docker ps -aq --filter "name=nextcloud-aio" | xargs -r sudo docker rm -f && sudo docker volume ls -q --filter "name=nextcloud" | xargs -r sudo docker volume rm

sudo docker volume prune -f