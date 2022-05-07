## About The Project

Hi! This is a discord bot i built using NodeJS for operating an Axie Infinity guild at scale.


### Built With

* [NodeJs](https://nodejs.org/en/)
* [Web3js](https://web3js.readthedocs.io/)


## Getting Started

I have put a mongo db for you to use it as a clean slate. I recommend using a mongoide so to import data from an excel or so. I use mingo.

### Installation

This is an example of how to list things you need to use the software and how to install them.

- Install MongoDB
- Create a Discord Bot Application
- Create a config.json file like this into Data folder
  ```
   {
      "token": "DISCORD_BOT_TOKEN",
      "mongo":"mongodb+srv://manager:db@password@cluster0.bkdr2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
      "prefix": "!"
   }
  ```
* Unzip db
  ```
  gunzip ronibot-db.gz -k    
  ```
* Import db
  ```
  mongorestore --archive=ronibot-db
  ```



## Usage

Transfer axies from one wallet to another
```
!transfer AXIE_ID,AXIE_ID FROM_ACCOUNT FROM_ACCOUNT
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

Your Name - [@fabriguespe](https://twitter.com/fabriguespe) - fguespe@gmail.com



## Acknowledgments


I want to thank [FerranMarin](https://github.com/FerranMarin/) and his axie-utils for serving as my inspiration