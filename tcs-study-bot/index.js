const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const cron = require("node-cron");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

const users = [
  { name: "Devanshu", channel: "devanshu-stuffs" },
  { name: "Tushpender", channel: "tushpender-stuffs" }
];

const penaltyChannelName = "penalty";
const reminderChannelName = "10pm-reminder";

let penalties = {
  Devanshu: 0,
  Tushpender: 0
};

let streaks = {
  Devanshu: 0,
  Tushpender: 0
};

client.once("clientReady", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});


// ⏰ 10 PM Reminder
cron.schedule("0 22 * * *", async () => {

  const guild = client.guilds.cache.first();
  if (!guild) return;

  const reminderChannel = guild.channels.cache.find(
    ch => ch.name === reminderChannelName
  );

  if (!reminderChannel) return;

  const today = new Date().toDateString();

  for (let user of users) {

    const channel = guild.channels.cache.find(
      ch => ch.name === user.channel
    );

    if (!channel) continue;

    const messages = await channel.messages.fetch({ limit: 10 });

    const postedToday = messages.some(msg =>
      new Date(msg.createdTimestamp).toDateString() === today
    );

    if (!postedToday) {

      reminderChannel.send(
        `⚠️ **Reminder**

Abhi tak aapka kuch bhi upload nahi hua hai aaj ke din **${user.name}**.

📚 Jaldi karein warna **penalty lag jayegi!**`
      );

    }
  }

});


// 📊 11:59 PM Daily Check
cron.schedule("40 23 * * *", async () => {

  console.log("Checking daily posts...");

  const guild = client.guilds.cache.first();
  if (!guild) return;

  const penaltyChannel = guild.channels.cache.find(
    ch => ch.name === penaltyChannelName
  );

  if (!penaltyChannel) return;

  const today = new Date().toDateString();

  let report = "";

  for (let user of users) {

    const channel = guild.channels.cache.find(
      ch => ch.name === user.channel
    );

    if (!channel) continue;

    const messages = await channel.messages.fetch({ limit: 10 });

    const postedToday = messages.some(msg =>
      new Date(msg.createdTimestamp).toDateString() === today
    );

    if (postedToday) {

      streaks[user.name]++;

      report += `✅ **${user.name}** — Posted\n🔥 Streak: ${streaks[user.name]} days\n\n`;

    } else {

      penalties[user.name] += 50;
      streaks[user.name] = 0;

      report += `❌ **${user.name}** — No Post\n💸 Penalty +₹50\n\n`;

    }

  }

  const embed = new EmbedBuilder()
    .setTitle("📊 Daily Study Report")
    .setColor(0xff0000)
    .setDescription(report)
    .setFooter({ text: "Stay consistent 📚" })
    .setTimestamp();

  penaltyChannel.send({ embeds: [embed] });

});

client.login(TOKEN);
