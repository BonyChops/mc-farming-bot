# mc-farming-bot
The easy bot for farming in Minecraft.

# Preview
Click to play
[![preview](https://raw.githubusercontent.com/BonyChops/mc-farming-bot/main/images/1.png)](https://twitter.com/BonyChops/status/1424727252009246728)


# Supported
I've tested with 1.16.5. Not supported for 1.17 or more.

# config.json

## online
```json
{
    "host": "host-to-connect",
    "offline": true
}
```

## offline

```json
{
    "host": "host-to-connect",
    "username": "your-email",
    "password": "your-password"
}
```

# Setup
1. Create `config.json` like above.
1. Create chest named `#seeds`, `#wheats`, and `#toComposter`
1. Put in some seeds in a chest named `#seeds`
1. Place `white_bed` near by chests
1. Login with bot with `npm start`. I recommend you to place bot near by chests and bed.
1. Now the bot will start farming automatically.