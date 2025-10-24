/* eslint-disable no-console */
import { Level } from 'src/feature/levels/entities/level.entity';
import { Story } from 'src/feature/levels/entities/story.entity';
import { StoryStatus } from 'src/feature/levels/enum/story-status.enum';
import { DataSource, Repository } from 'typeorm';

export class LevelSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    this.dataSource.setOptions({ logging: false });
    const levelRepo: Repository<Level> = this.dataSource.getRepository(Level);
    const storyRepo: Repository<Story> = this.dataSource.getRepository(Story);

    // ---------- LEVEL ----------
    const levelData = {
      no: 1,
      name: 'Lala dan Balon Merah',
      isBonusLevel: false,
    };

    let level = await levelRepo.findOne({ where: { no: levelData.no } });

    if (level) {
      await levelRepo.update({ no: levelData.no }, levelData);
      console.log(`🔄 Updated Level: ${level.fullName}`);
      // Refresh the entity
      level = await levelRepo.findOneByOrFail({ no: levelData.no });
    } else {
      level = levelRepo.create(levelData);
      await levelRepo.save(level);
      console.log(`✅ Inserted Level: ${level.fullName}`);
    }

    // ---------- STORIES ----------
    const storiesData = [
      {
        title: 'Lala dan Balon Merah',
        description:
          'Lala menemukan balon merah di taman dan mengikuti petualangan seru bersamanya.',
        passage: `Di taman kecil, Lala memegang balon merah.\nAngin berhembus lembut.\nBalon itu naik... naik... naik!\n“Oh tidak!” kata Lala.\nBalon terlepas!\nTapi kucing kecil, Mimi, melompat dan menangkap tali balon.\nLala tersenyum. “Terima kasih, Mimi!”\nBalon pun kembali ke tangan Lala.\nLala belajar: hati tenang, pikir jernih, masalah jadi mudah.`,
        status: StoryStatus.ACCEPTED,
      },
      {
        title: 'Lala dan Balon Merah 2',
        description:
          'Lala menemukan balon merah di taman dan mengikuti petualangan seru bersamanya.',
        passage: `2 Di taman kecil, Lala memegang balon merah.\nAngin berhembus lembut.\nBalon itu naik... naik... naik!\n“Oh tidak!” kata Lala.\nBalon terlepas!\nTapi kucing kecil, Mimi, melompat dan menangkap tali balon.\nLala tersenyum. “Terima kasih, Mimi!”\nBalon pun kembali ke tangan Lala.\nLala belajar: hati tenang, pikir jernih, masalah jadi mudah.`,
        status: StoryStatus.ACCEPTED,
      },
    ];

    for (const storyData of storiesData) {
      const existingStory = await storyRepo.findOne({
        where: { title: storyData.title },
      });

      if (existingStory) {
        await storyRepo.update(
          { title: storyData.title },
          { ...storyData, level },
        );
        console.log(`🔄 Updated Story: ${storyData.title}`);
      } else {
        const newStory = storyRepo.create({ ...storyData, level });
        await storyRepo.save(newStory);
        console.log(`✅ Inserted Story: ${storyData.title}`);
      }
    }
  }
}
