const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear, GoalBlock } = require('mineflayer-pathfinder').goals
const fs = require('fs');
const config = JSON.parse(fs.readFileSync("config.json"));
const bot = mineflayer.createBot({
    host: config.host,
    port: config.port == undefined ? 25565 : config.port,
    username: config.offline ? "Bony_Bot" : config.username,
    password: config.offline ? undefined : config.password,
    auth: config.auth === undefined ? 'mojang' : config.auth
});

let mcData = null;

bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})


bot.once('spawn', async () => {
    const chests = bot.findBlocks({
        matching: mcData.blocksByName["chest"].id,
        maxDistance: 15,
        count: 256
    });
    const itemsToPick = [];
    bot.nearestEntity((entity) => {
        itemsToPick.push(entity)
    });
    //console.log(chests.map(pos => bot.blockAt(pos)))
    //console.log(JSON.stringify(chests.map(pos => bot.blockAt(pos)), null, 2))
    console.log(JSON.stringify(itemsToPick.filter(entity => entity.name === "item_frame"), null, 2))
    fs.writeFileSync("testt.json", JSON.stringify(itemsToPick.filter(entity => entity.name === "item_frame"), null, 2));
    fs.writeFileSync("testt2.json", JSON.stringify(itemsToPick.filter(entity => entity.name === "item_frame").map(entity => entity.yaw / Math.PI), null, 2));
    console.log(mcData.itemsByName.wheat_seeds)
});