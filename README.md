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

### api:
action:Get Chains Netstate<br/> 
apiUrl: https://_domain_/chains <br/> 
method: GET <br/> 
response:
```
{
    "eth": {
        "ten_minite_net_state": false,
        "chainID": 1,
        "net_state": false,
        "last_hash": "0xd945d86951b2684f7516bce3b0b4eeb61264f150251eb27f6e05149c17b917da",
        "tx_err_count": 153,
        "last_block_num": "14606777",
        "block_err_count": 4,
        "created_at": 1650252000048
    },
    ...
}
```

## Licence

netstate is open source software licensed as
[MIT](./LICENSE).
