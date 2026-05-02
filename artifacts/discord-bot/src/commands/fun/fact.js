import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, THEME, DIVIDER, EMOJI } from '../../utils/embedBuilder.js';

const FACTS = [
  "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
  "A group of flamingos is called a 'flamboyance'.",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
  "Bananas are berries, but strawberries are not.",
  "The shortest war in history lasted 38–45 minutes — between Britain and Zanzibar in 1896.",
  "Octopuses have three hearts, blue blood, and nine brains.",
  "Wombat feces are cube-shaped — the only known animal to produce cube-shaped droppings.",
  "The Eiffel Tower grows taller in summer by up to 15 cm due to thermal expansion.",
  "A snail can sleep for up to 3 years.",
  "The dot above the lowercase letters 'i' and 'j' is called a 'tittle'.",
  "Sharks are older than trees. They've existed for around 400 million years.",
  "There are more possible chess game variations than atoms in the observable universe.",
  "Your stomach produces a new layer of mucus every two weeks to avoid digesting itself.",
  "The longest English word without a vowel is 'rhythms'.",
  "A jiffy is an actual unit of time — 1/100th of a second.",
  "Crows can recognize and remember human faces, and hold grudges.",
  "The average person walks the equivalent of 3 times around the Earth in their lifetime.",
  "Butterflies taste with their feet.",
  "No number before 1000 contains the letter 'a' when written in English.",
  "The unicorn is the national animal of Scotland.",
  "Humans and giraffes have the same number of neck vertebrae — 7.",
  "The heart of a shrimp is located in its head.",
  "Pineapples take up to 2 years to grow.",
  "Penguins propose to their partners with a pebble.",
  "A day on Venus is longer than a year on Venus.",
  "Sloths can hold their breath longer than dolphins — up to 40 minutes underwater.",
  "The word 'set' has the most definitions in the English language.",
  "Ants don't have lungs — they breathe through tiny holes in their bodies called spiracles.",
  "The longest living animal is the ocean quahog clam, which can live for over 500 years.",
  "Humans share 60% of their DNA with bananas.",
];

export const data = new SlashCommandBuilder()
  .setName('fact')
  .setDescription('Learn a random interesting fact');

export async function execute(interaction) {
  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];

  await interaction.reply({
    embeds: [createEmbed({
      color: THEME.info,
      title: `${EMOJI.info} Random Fact`,
      description: [DIVIDER, ``, `💡 ${fact}`, ``, DIVIDER].join('\n'),
      footer: { text: `⚜️ Lilith Protector • Did you know?` },
    })],
  });
}
