const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear, GoalBlock } = require('mineflayer-pathfinder').goals
const fs = require('fs');
const config = JSON.parse(fs.readFileSync("config.json"));
const bot = mineflayer.createBot({
    host: config.host,
    port: config.port == undefined ? 25565 : config.host,
    username: config.offline ? "Bony_Bot" : config.username,
    password: config.offline ? undefined : config.password,
    auth: config.offline ? undefined : 'mojang'
});

let mcData;

bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})

bot.once('spawn', () => {
    // mineflayerViewer(bot, { port: 3007, firstPerson: false })
    bot.chat("こんにちは，Bony_Botです :) 製鉄所でバイトしてます．エラー吐いたらBony_Chopsに教えてくれるとうれしいな☆");
    bot.chat("Logged in");
})

bot.on("chat", async (author, msg) => {
    console.log(msg)
    switch (true) {
        case /list/.test(msg):
            console.log(bot.inventory.items());
            break;
        case /craft/.test(msg):
            /*  console.log(mcData.findItemOrBlockByName("hay_block"));
             console.log(mcData.itemsByName["hay_block"].id);
             const craftingTable = bot.findBlock({
                 matching: mcData.blocksByName["crafting_table"].id
             });
             console.log(craftingTable)
             console.log(recipe)
             await bot.craft(recipe[0], parseInt(1, 10), craftingTable);
             bot.chat("done"); */
            amount = parseInt(1, 10)
            const name  = "hay_block"
            const mcData = require('minecraft-data')(bot.version)

            const item = mcData.findItemOrBlockByName(name)
            const craftingTableID = mcData.blocksByName.crafting_table.id

            const craftingTable = bot.findBlock({
                matching: craftingTableID
            })

            if (item) {
             const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
             //const recipe = bot.recipesFor(item.id, null, 1, craftingTable)[0]
                if (recipe) {
                    bot.chat(`I can make ${name}`)
                    try {
                        await bot.craft(recipe, amount, craftingTable)
                        bot.chat(`did the recipe for ${name} ${amount} times`)
                    } catch (err) {
                        bot.chat(`error making ${name}`)
                    }
                } else {
                    bot.chat(`I cannot make ${name}`)
                }
            } else {
                bot.chat(`unknown item: ${name}`)
            }
    }
})