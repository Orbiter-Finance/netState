
## Project setup

### Change config

#### 1. Set .env

- Copy [.env.backup](./.env.backup) as .env
- Replace the [Your Key] part with your key

### 2.Install docker and docker-compose

- [Install docker](https://docs.docker.com/get-docker/)
- [Install docker-compose](https://docs.docker.com/compose/install/)

### Build docker image and run docker

```
# When you need run at daemon, add -d
docker-compose up [-d]
```

#### Next, you also need to clear shell history

```
# Editor ~/.bash_history, clear shell's privatekey info
vim ~/.bash_history

# Clear cache
history -r
```
## Licence

netstate is open source software licensed as
[MIT](./LICENSE).