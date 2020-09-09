# Hacker News Mention Parser

## Running with Docker and Docker Compose

The parser can be ran with Docker or through a Docker Compose configuration.

The easiest way to use this parser with Docker is through the included Compose configuration file. Open the **docker-compose.yml** file and change the environment variables to match your own configuration.

With the **docker-compose.yml** file properly configured, it can be ran with the following command:

```
docker-compose up -d --build
```

The above command will build the image and run the container in detached mode.

To run the parser with Docker without a Compose configuration, first build an image from the project using the following command:

```
docker build -t hnnode .
```

Once the `hnnode` image has been created, it can be deployed as a container with the following command:

```
docker run -e ATLAS_URI="<ATLAS_URI>" -e DATABASE_NAME="DB_NAME" -e DATABASE_COLLECTION="<COLLECTION_NAME>" --name hnnode hnnode
```

It is important that the environment variables in the above command match your actual configuration. This means you should be using your own cluster information.