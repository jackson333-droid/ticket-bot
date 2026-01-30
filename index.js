const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  SlashCommandBuilder,
  REST,
  Routes,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// REGISTRAR /panel
const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Mostrar panel de tickets')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );
})();

client.once('clientReady', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  // /panel
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'panel') {

      const embed = new EmbedBuilder()
        .setTitle('🎫 Tickets')
        .setDescription(
          `En este apartado encontrarás los siguientes tickets:\n\n` +
          `📌 Ayuda Administrativa\n` +
          `📌 Soporte Técnico\n` +
          `📌 Reportes\n` +
          `📌 Solicitud de Rol\n` +
          `📌 Facciones\n` +
          `📌 Apelar Sanción\n\n` +
          `⚠️ *Es importante abrir el ticket en la categoría destinada.*`
        )
        .setColor(0x2f3136);

      const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_categoria')
        .setPlaceholder('📂 Selecciona la categoría del ticket')
        .addOptions([
          {
            label: 'Ayuda Administrativa',
            value: 'admin',
            emoji: '📌'
          },
          {
            label: 'Soporte Técnico',
            value: 'soporte',
            emoji: '🛠️'
          },
          {
            label: 'Reportes',
            value: 'reportes',
            emoji: '🚨'
          },
          {
            label: 'Solicitud de Rol',
            value: 'rol',
            emoji: '🎭'
          },
          {
            label: 'Facciones',
            value: 'facciones',
            emoji: '⚔️'
          },
          {
            label: 'Apelar Sanción',
            value: 'apelacion',
            emoji: '⚖️'
          }
        ]);

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  // CUANDO SELECCIONA CATEGORÍA
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'ticket_categoria') {

      const categoria = interaction.values[0];

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      await channel.send(
        `🎟️ **Ticket creado**\n` +
        `👤 Usuario: ${interaction.user}\n` +
        `📂 Categoría: **${categoria}**`
      );

      await interaction.reply({
        content: '✅ Ticket creado correctamente',
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);


