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
bot.loadPlugin(pathfinder)

bot.on("goal_reached", () => {
    console.log("reached")
})

const gotoPromise = async (p, mcData, nearPoint = 5) => (await new Promise(async (resolve, reject) => {
    let x = y = z = 25565;
    const checker = setInterval(() => {
        const botP = bot.entity.position;
        if (x === botP.x && y === botP.y && z === botP.z) {
            clearInterval(checker);
            resolve("Bot not moving!");
        }
        x = botP.x;
        y = botP.y;
        z = botP.z;
    }, 1000);
    bot.pathfinder.thinkTimeout = 1000;
    const defaultMove = new Movements(bot, mcData);
    //defaultMove.blocksToAvoid.add(mcData.blocksByName["water"].id);
    defaultMove.canDig = false;
    //defaultMove.blocksCantBreak(true);
    defaultMove.scafoldingBlocks = [];
    defaultMove.blocksToAvoid.delete(mcData.blocksByName["wheat"].id)

    bot.pathfinder.setMovements(defaultMove);
    const callback = (err, result) => {
        clearInterval(checker);
        if (err) {
            reject(err);
            return;
        }
        resolve(result);
    }
    bot.pathfinder.goto(nearPoint <= 0 ? new GoalBlock(p.x, p.y, p.z) : new GoalNear(p.x, p.y, p.z, nearPoint), callback);
}));

const sleep = async (ms) => (await new Promise(resolve => { setTimeout(() => { resolve() }, ms) }));


let mcData
bot.once('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})


bot.once('spawn', () => {
    // mineflayerViewer(bot, { port: 3007, firstPerson: false })
    bot.chat("こんにちは，Bony_Botです :) 製鉄所でバイトしてます．エラー吐いたらBony_Chopsに教えてくれるとうれしいな☆");
    bot.chat("Logged in");
    job();
})


const chestInfo = {};
let bed;
let started = false;

const job = async () => {
    if(started){
        return;
    }
    started = true;
    await sleep(1000);
    await refreshChestInfo();
    const inventoryItems = bot.inventory.items();
    while (true) {
        await getWheats();
        //return;
        await farmJob();
        //bot.chat("I'm done")
        await refreshItems();
        await checker();
        await sleep(1000);
    }
}

const checker = async() => {
    if(bot.time.timeOfDay >= 12000){
        await goBed();
    }
    console.log(bot.inventory.slots);
    if(bot.inventory.slots.filter(item => item === null).length < 2){
        bot.chat("Max of Inventory Reached");
        await refreshItems();
    }else{
        console.log("ok")
    }
}

const goBed = async() => {
    bot.chat("Time to sleep!")
    await gotoPromise(bed, mcData, 2);
    try{
        await bot.sleep(bot.blockAt(bed));
    }catch(e){}
}

const inventoryJobs = async (title, chest, inventoryItems, chestPos) => await (async (f) => (f === undefined ? (() => {
    console.log("undefined!!")
})() : await f()))({
    "#seeds": async () => {
        console.log("#seedsJob")
        if(chestInfo["#seeds"] === undefined) chestInfo["#seeds"]  = chestPos;
        const seedsInChestCount = chest.containerItems().filter(item => item.type == mcData.itemsByName["wheat_seeds"].id).reduce((acc, item) => (acc + item.count), 0);
        const seedsInInventoryCount = inventoryItems.filter(item => item.type == mcData.itemsByName["wheat_seeds"].id).reduce((acc, item) => (acc + item.count), 0);
        //bot.chat("[" + chest.containerItems().map(item => item.displayName).join(", ") + "]")
        if (seedsInChestCount < 64 && seedsInInventoryCount < 64) {
            await chest.close();
            console.log("Job done.");
            bot.chat("Job done.");
            throw "seed owata";
        }
        if (seedsInInventoryCount < 64) {
            await chest.withdraw(mcData.itemsByName["wheat_seeds"].id, null, 64);
        }
    },
    "#wheats": async () => {
        console.log("#wheatsJob")
        if(chestInfo["#wheats"]  === undefined) chestInfo["#wheats"] = chestPos;
        const wheatsInInventoryCount = inventoryItems.filter(item => item.type == mcData.itemsByName["wheat"].id).reduce((acc, item) => (acc + item.count), 0);
        if (wheatsInInventoryCount > 0) await chest.deposit(mcData.itemsByName["wheat"].id, null, wheatsInInventoryCount);
    },
    "#toComposter": async () => {
        if(chestInfo["#toComposter"] === undefined) chestInfo["#toComposter"] = chestPos;
        const seedsInInventoryCount = inventoryItems.filter(item => item.type == mcData.itemsByName["wheat_seeds"].id).reduce((acc, item) => (acc + item.count), 0);
        console.log(seedsInInventoryCount)
        if (seedsInInventoryCount > 64) {
            console.log( seedsInInventoryCount - 64)
            await new Promise((resolve, reject) => chest.deposit(mcData.itemsByName["wheat_seeds"].id, null, seedsInInventoryCount - 64, (err) => {
                if(err){
                    reject(err);
                    return;
                }
                resolve();
            }));
        }
        console.log("done")
    }
}[title])

const refreshChestInfo = async () => {
    const chests = bot.findBlocks({
        matching: mcData.blocksByName["chest"].id,
        maxDistance: 256,
        count: 256
    })
    for (const chestPos of chests) {
        const chestPosNear = JSON.parse(JSON.stringify(chestPos));
        chestPosNear.x += 1;
        chestPosNear.z += 1;
        try{
            await gotoPromise(chestPosNear, mcData);
        }catch(e){
            console.log(e)
        }
        const inventoryItems = bot.inventory.items();
        const chest = await bot.openContainer(bot.blockAt(chestPos));
        const title = JSON.parse(chest.title).text;
        console.log(title)

        await inventoryJobs(title, chest, inventoryItems, chestPos);
        await sleep(100);
        await chest.close();
    }
    const tmpBed = bot.findBlock({
        matching: mcData.blocksByName["white_bed"].id,
        maxDistance: 256,
        count: 256
    })
    console.log(tmpBed.position)
    await gotoPromise(tmpBed.position, mcData);
    bed = tmpBed.position;
}

const refreshItems = async () => {
    const chestNames = ["#seeds", "#wheats", "#toComposter"];

    for(chestName of chestNames){
        try{
            await gotoPromise(chestInfo[chestName], mcData);
        }catch(e){
            console.log("error");
            continue;
        }
        const inventoryItems = bot.inventory.items();
        const chest = await bot.openContainer(bot.blockAt(chestInfo[chestName]));
        await inventoryJobs(chestName, chest, inventoryItems, chestInfo[chestName]);
        await sleep(100);
        await chest.close();
    }
}

const getWheats = async () => {
    const checkItemNearBy = async () => {
        const itemsToPick = [];
        bot.nearestEntity((entity) => {
            const target = entity.metadata.find(type => typeof type === "object" && type.itemId !== undefined);

            if (target !== undefined && entity.name === "item" &&
                (["wheat_seeds", "wheat"]).map(item => mcData.itemsByName[item].id).includes(target.itemId)) {
                itemsToPick.push(entity)
            }
        });
        for (itemPos of itemsToPick) {
            try {
                await gotoPromise(itemPos.position, mcData, 0);
            } catch (e) {
                continue;
            }
        }
    }
    const wheatPlaces = bot.findBlocks({
        matching: mcData.blocksByName["wheat"].id,
        maxDistance: 256,
        count: 1000
    }).filter((wheatPos) => bot.blockAt(wheatPos).metadata >= 7);
    for (const [key, wheatPos] of Object.entries(wheatPlaces)) {
        try {
            await gotoPromise(wheatPos, mcData, 5);
        } catch (e) {
            continue;
        }
        await bot.dig(bot.blockAt(wheatPos));
        await bot.equip(bot.inventory.findInventoryItem(mcData.itemsByName["wheat_seeds"].id, null), "hand");
        wheatPos.y -= 1;
        await bot.lookAt(wheatPos);
        await bot.activateBlock(bot.blockAt(wheatPos));
        wheatPos.y += 1;
        if (key % 10 === 0) {
            await checkItemNearBy();
        }
        await checker();
    }
    await checkItemNearBy();
}

const farmJob = async () => {
    const wheatPlaces = bot.findBlocks({
        matching: mcData.blocksByName["wheat"].id,
        maxDistance: 256,
        count: 1000
    });
    const placeToFarm = bot.findBlocks({
        matching: mcData.blocksByName["farmland"].id,
        maxDistance: 256,
        count: 1000
    }).filter(fp => !wheatPlaces.some(wp => wp.x == fp.x && wp.y == fp.y + 1 && wp.z == fp.z));
    placeToFarm.forEach(blocks => blocks.y += 1);
    for (const farmPos of placeToFarm) {
        try {
            await gotoPromise(farmPos, mcData);
        } catch (e) {
            console.log("skip!");
            continue;
        }
        await bot.equip(bot.inventory.findInventoryItem(mcData.itemsByName["wheat_seeds"].id, null), "hand");
        farmPos.y -= 1;
        await bot.lookAt(farmPos);
        await bot.activateBlock(bot.blockAt(farmPos));
        console.log("next")
        await checker();
    }
    console.log("done")
}