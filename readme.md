## About The Project

Hi! This is a discord bot i built using NodeJS for operating an Axie Infinity guild at scale.


### Built With

* [NodeJs](https://nodejs.org/en/)
* [Web3js](https://web3js.readthedocs.io/)


## Getting Started

I have put a mongo db for you to use it as a clean slate. I recommend using a mongoide so to import data from an excel or so. I use mingo.

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

1) Install mongo db

* Create a discord bot application
* Create a config.json file like this into Data folder

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

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Get a free API Key at [https://example.com](https://example.com)
2. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Enter your API in `config.js`
   ```js
   const API_KEY = 'ENTER YOUR API';
   ```

## Usage

Transfer axies from one wallet to another

!transfer AXIE_ID,AXIE_ID FROM_ACCOUNT FROM_ACCOUNT

Update user field in DB

!update ACCOUNT_NUMBER FIELD VALUE 

Payment receipt for user

!roni ACCOUNT

Review all accounts for missing SLP
!cron flushall \n\n"


!pay SLP /plata_usd DE_ID/BREED HASTA_ID para hacer un pago normal\n\n"


## Contact

Your Name - [@fabriguespe](https://twitter.com/fabriguespe) - fguespe@gmail.com



## Acknowledgments


I want to thank [FerranMarin](https://github.com/FerranMarin/) and his axie-utils for serving as my inspiration