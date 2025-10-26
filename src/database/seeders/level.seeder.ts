import { Level } from 'src/feature/levels/entities/level.entity';
import { Story } from 'src/feature/levels/entities/story.entity';
import { StoryStatus } from 'src/feature/levels/enum/story-status.enum';
import { DataSource, Repository } from 'typeorm';

export class LevelSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const levelRepo: Repository<Level> = manager.getRepository(Level);
      const storyRepo: Repository<Story> = manager.getRepository(Story);

      // ---------- LEVELS ----------
      const levelsData = [
        {
          no: 1,
          name: 'Lala dan Balon Merah',
          isBonusLevel: false,
          stories: [
            {
              title: 'Lala dan Balon Merah',
              description:
                'Lala menemukan balon merah di taman dan mengikuti petualangan seru bersamanya.',
              passage: `Di taman kecil, Lala memegang balon merah.\nAngin berhembus lembut.\nBalon itu naik... naik... naik!\n"Oh tidak!" kata Lala.\nBalon terlepas!\nTapi kucing kecil, Mimi, melompat dan menangkap tali balon.\nLala tersenyum. "Terima kasih, Mimi!"\nBalon pun kembali ke tangan Lala.\nLala belajar: hati tenang, pikir jernih, masalah jadi mudah.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Lala dan Balon Merah 2',
              description:
                'Lala menemukan balon merah di taman dan mengikuti petualangan seru bersamanya.',
              passage: `2 Di taman kecil, Lala memegang balon merah.\nAngin berhembus lembut.\nBalon itu naik... naik... naik!\n"Oh tidak!" kata Lala.\nBalon terlepas!\nTapi kucing kecil, Mimi, melompat dan menangkap tali balon.\nLala tersenyum. "Terima kasih, Mimi!"\nBalon pun kembali ke tangan Lala.\nLala belajar: hati tenang, pikir jernih, masalah jadi mudah.`,
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Lala dan Balon Merah 3',
              description:
                'Lala menemukan balon merah di taman dan mengikuti petualangan seru bersamanya.',
              passage: `2 Di taman kecil, Lala memegang balon merah.\nAngin berhembus lembut.\nBalon itu naik... naik... naik!\n"Oh tidak!" kata Lala.\nBalon terlepas!\nTapi kucing kecil, Mimi, melompat dan menangkap tali balon.\nLala tersenyum. "Terima kasih, Mimi!"\nBalon pun kembali ke tangan Lala.\nLala belajar: hati tenang, pikir jernih, masalah jadi mudah.`,
              status: StoryStatus.WAITING,
            },
          ],
        },
        {
          no: 2,
          name: 'Rafi dan Sepatu Hujan',
          isBonusLevel: false,
          stories: [
            {
              title: 'Rafi dan Sepatu Hujan 1',
              description:
                'Rafi ingin bermain di luar saat hujan, tapi tanah penuh lumpur. Ibu memberinya sepatu hujan yang kuat dan bersih.',
              passage: `Pagi itu hujan deras.\nRafi ingin bermain di luar.\nTapi tanah penuh lumpur!\nIbu berkata, “Pakai sepatu hujanmu.”\nRafi mengangguk.\nIa melompat ke luar, cipratan air di mana-mana!\nSepatu hujannya kuat dan bersih.\nRafi tertawa gembira.\nIa belajar: persiapan kecil bisa membuat hari jadi besar.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Rafi dan Sepatu Hujan 2',
              description: 'Deskripsi 2.',
              passage: `Pagi itu hujan deras.\nRafi ingin bermain di luar.\nTapi tanah penuh lumpur!\nIbu berkata, “Pakai sepatu hujanmu.”\nRafi mengangguk.\nIa melompat ke luar, cipratan air di mana-mana!\nSepatu hujannya kuat dan bersih.\nRafi tertawa gembira.\nIa belajar: persiapan kecil bisa membuat hari jadi besar.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Rafi dan Sepatu Hujan 3',
              description: 'Deskripsi 3.',
              passage: `Pagi itu hujan deras.\nRafi ingin bermain di luar.\nTapi tanah penuh lumpur!\nIbu berkata, “Pakai sepatu hujanmu.”\nRafi mengangguk.\nIa melompat ke luar, cipratan air di mana-mana!\nSepatu hujannya kuat dan bersih.\nRafi tertawa gembira.\nIa belajar: persiapan kecil bisa membuat hari jadi besar.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
          ],
        },
        {
          no: 3,
          name: 'Rafi dan Sepatu Hujan',
          isBonusLevel: false,
          stories: [
            {
              title: 'Nia dan Bintang yang Jatuh 1',
              description: 'Deskripsi 1.',
              passage: `Setiap malam, Nia menatap langit.\nIa suka bintang-bintang yang berkelip.\nSuatu malam, satu bintang jatuh!\nNia menutup mata dan berdoa.\n'Aku ingin berani bicara di kelas,' bisiknya.\nKeesokan harinya, Nia angkat tangan saat guru bertanya.\nTeman-teman bertepuk tangan.\nNia tersenyum — bintang itu mendengarnya.\nKadang keberanian datang saat hati percaya.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Nia dan Bintang yang Jatuh 2',
              description: 'Deskripsi 2.',
              passage: `Setiap malam, Nia menatap langit.\nIa suka bintang-bintang yang berkelip.\nSuatu malam, satu bintang jatuh!\nNia menutup mata dan berdoa.\n'Aku ingin berani bicara di kelas,' bisiknya.\nKeesokan harinya, Nia angkat tangan saat guru bertanya.\nTeman-teman bertepuk tangan.\nNia tersenyum — bintang itu mendengarnya.\nKadang keberanian datang saat hati percaya.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Nia dan Bintang yang Jatuh 3',
              description: 'Deskripsi 3.',
              passage: `Setiap malam, Nia menatap langit.\nIa suka bintang-bintang yang berkelip.\nSuatu malam, satu bintang jatuh!\nNia menutup mata dan berdoa.\n'Aku ingin berani bicara di kelas,' bisiknya.\nKeesokan harinya, Nia angkat tangan saat guru bertanya.\nTeman-teman bertepuk tangan.\nNia tersenyum — bintang itu mendengarnya.\nKadang keberanian datang saat hati percaya.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
          ],
        },
      ];

      for (const levelData of levelsData) {
        let level = await levelRepo.findOne({ where: { no: levelData.no } });

        if (level) {
          await levelRepo.update(
            { no: levelData.no },
            {
              name: levelData.name,
              isBonusLevel: levelData.isBonusLevel,
            },
          );
          level = await levelRepo.findOneByOrFail({ no: levelData.no });
        } else {
          level = levelRepo.create({
            no: levelData.no,
            name: levelData.name,
            isBonusLevel: levelData.isBonusLevel,
          });
          await levelRepo.save(level);
        }

        // ---------- STORIES FOR THIS LEVEL ----------
        for (const storyData of levelData.stories) {
          const existingStory = await storyRepo.findOne({
            where: { title: storyData.title },
          });

          if (existingStory) {
            await storyRepo.update(
              { title: storyData.title },
              { ...storyData, level },
            );
          } else {
            const newStory = storyRepo.create({ ...storyData, level });
            await storyRepo.save(newStory);
          }
        }
      }
    });
  }
}
