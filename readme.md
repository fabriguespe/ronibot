## About The Project

Hi! This is a discord bot i built using NodeJS for operating an Axie Infinity guild at scale.


### Built With

* [NodeJs](https://nodejs.org/en/)
* [Web3js](https://web3js.readthedocs.io/)


## Getting Started

I have put a mongo db for you to use it as a clean slate. I recommend using a mongoide so to import data from an excel or so. I use mingo.

### Discord Bot
You have to create a Discord Bot with enouth rights for the bot to operate.
- Create a Discord Bot Application
- Copy the Token
- Create a config.json file like this into Data folder
  ```
   {
      "token": "DISCORD_BOT_TOKEN",
      "mongo":"mongodb+srv://manager:db@password@cluster0.bkdr2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
      "prefix": "!"
   }
  ```


### MongoDB

MongoDB you will use it to track players names, wallets, payout addresses, etc.

- Install MongoDB
- Unzip db
  ```
  gunzip ronibot-db.gz -k    
  ```
- Import db
  ```
  mongorestore --archive=ronibot-db
  ```

### Private keys
For this to work you have to create a file containing all wallets and their private keys. Create a file secrets.json and copy into a structure like this one
  ```
{
    
    "ronin:ADDRES1": "privatekey",
    "ronin:ADDRES2": "privatekey",
    "ronin:ADDRES3": "privatekey",
    "ronin:ADDRES4": "privatekey"
}
  ```

## Usage

Transfer axies from one wallet to another
```
!transfer_axie AXIE_ID,AXIE_ID FROM_ACCOUNT FROM_ACCOUNT
```
Update user field in DB
```
!update ACCOUNT_NUMBER FIELD VALUE 
```
Payment receipt for user
```
!roni ACCOUNT
```
Review all accounts for missing SLP

```
!cron flushall \n\n"
```

!pay SLP /plata_usd DE_ID/BREED HASTA_ID para hacer un pago normal\n\n"


## Contact

Fabrizio Guespe

Twitter [@fabriguespe](https://twitter.com/fabriguespe)

[fguespe@gmail.com](mailto:fguespe@gmail.com)


## Acknowledgments


I want to thank [FerranMarin](https://github.com/FerranMarin/) and his axie-utils for serving as my inspiration