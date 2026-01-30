const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  Events,
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

/* =======================
   REGISTRAR /panel
======================= */
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

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

/* =======================
   INTERACCIONES
======================= */
client.on(Events.InteractionCreate, async interaction => {

  /* ---------- /panel (solo admins) ---------- */
  if (interaction.isChatInputCommand() && interaction.commandName === 'panel') {

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: '❌ No tienes permisos para usar este comando.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎫 Tickets')
      .setDescription(
        'En este apartado encontrarás los siguientes tickets:\n\n' +
        '📌 Ayuda Administrativa\n' +
        '📌 Soporte Técnico\n' +
        '📌 Reportes\n' +
        '📌 Solicitud de Rol\n' +
        '📌 Facciones\n' +
        '📌 Apelar Sanción\n\n' +
        'Selecciona la categoría correcta abajo 👇'
      )
      .setColor(0x2f3136);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_categoria')
      .setPlaceholder('📂 Selecciona la categoría del ticket')
      .addOptions([
        { label: 'Ayuda Administrativa', value: 'Ayuda Administrativa' },
        { label: 'Soporte Técnico', value: 'Soporte Técnico' },
        { label: 'Reportes', value: 'Reportes' },
        { label: 'Solicitud de Rol', value: 'Solicitud de Rol' },
        { label: 'Facciones', value: 'Facciones' },
        { label: 'Apelar Sanción', value: 'Apelar Sanción' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.deferReply({ ephemeral: true });

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.editReply({
      content: '✅ Panel de tickets enviado.'
    });
  }

  /* ---------- CREAR TICKET ---------- */
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_categoria') {

    await interaction.deferReply({ ephemeral: true });

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

    return interaction.editReply({
      content: '✅ Tu ticket fue creado correctamente.'
    });
  }

});

client.login(TOKEN);

