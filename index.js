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
  Routes
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// TOKENS
const TOKEN = 'MTQ2Njg5NTI5MjQ1MTM4OTYxNA.Glvogd.TWp-r-o5xzSWB9T98D3J05SrWcoVx47QTlEiKE';
const CLIENT_ID = '1466895292451389614';

// REGISTRAR COMANDO /panel
const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Crear panel de tickets')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comando /panel registrado');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  // COMANDO /panel
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'panel') {

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('crear_ticket')
          .setLabel('🎟️ Crear Ticket')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({
        content: '📩 **Sistema de Tickets**',
        components: [row]
      });
    }
  }

  // BOTÓN CREAR TICKET
  if (interaction.isButton()) {
    if (interaction.customId === 'crear_ticket') {

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

      await channel.send(`🎫 Ticket creado por ${interaction.user}`);
      await interaction.reply({
        content: '✅ Ticket creado',
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
