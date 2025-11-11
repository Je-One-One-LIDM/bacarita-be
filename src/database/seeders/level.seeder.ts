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
          no: 0,
          name: 'Pre-Test: Tes Kemampuan Awal',
          isBonusLevel: false,
          stories: [
            {
              title: 'Tes Kemampuan Membaca',
              description:
                'Tes awal untuk mengetahui kemampuan membaca saat ini. Hasil tes akan membantu menentukan level yang tepat untuk memulai pembelajaran.',
              passage: `Selamat datang di Bacarita!\nKami ingin tahu kemampuanmu membaca.\nIni bukan ujian, jadi santai saja.\nBacalah cerita ini dengan hati-hati.\nLakukan yang terbaik.\nHasil tes ini akan membantu kami menemukan level yang cocok untukmu.\nSetelah selesai, kamu bisa langsung memulai petualangan belajar!\nSelamat mengerjakan!`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
          ],
        },
        {
          no: 1,
          name: 'Dasar Vokal dan Konsonan',
          isBonusLevel: false,
          stories: [
            {
              title: 'Bacaan 1: Dasar Vokal dan Konsonan',
              description:
                'Fokus A, I, U, M, K. Membangun dasar vokal dan konsonan yang bentuknya sangat berbeda.',
              passage: `M A U\nI M A\nM I U\nK A I\nU K I`,
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 2: Bentuk Huruf',
              description:
                'Fokus O, T, R, L. Memperkenalkan bentuk bulat (O) dan garis (T, R, L)',
              passage: `L A R O\nT O R U\nR O T A\nR O L U\nT R L A`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 3: Konsonan',
              description:
                'Fokus N, H, S, Z. n yang mirip u harus dipertegas dan dibedakan',
              passage: `N H S\nH S Z\nS H Z\nN S Z\nH N Z`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 4: Huruf Reversal',
              description: 'Fokus B, D. Pasangan reversal',
              passage: `B A D I\nD A B U\nB I D A\nB U D A\nD I B A`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 5: Huruf P Q V Y',
              description: 'Fokus P, Q, V, Y',
              passage: `P I Q A\nV A P U\nY I P A\nP I V U\nQ I Y U`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
          ],
        },
        {
          no: 2,
          name: 'Suku Kata Terbuka (KV)',
          isBonusLevel: false,
          stories: [
            {
              title: 'Bacaan 1: Suku Kata dengan Konsonan Dasar',
              description:
                'Fokus pada suku kata dengan konsonan yang sudah dikuasai',
              passage: `Ma Mi Mu\nI Ma Mu\nA Ma Mu`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 2: Fokus Huruf P',
              description: 'Fokus ke huruf P dalam suku kata',
              passage: `Pa Pi Pu\nPo Pa Pu\nSa Pu Sa`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
          ],
        },
        {
          no: 3,
          name: 'Kata Bermakna (2-3 Suku Kata)',
          isBonusLevel: false,
          stories: [
            {
              title: 'Bacaan 1: Dua Suku Kata Pertama',
              description: 'Fokus ke 2 suku kata yang berpola KV-KV',
              passage: `Mama\nKaki\nRusa\nSusu\nBuku`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 2: Dua Suku Kata Lanjutan',
              description:
                'Fokus kontras perbedaan dengan unit suku kata di huruf b/d',
              passage: `Dadu\nBola\nPipi\nPapa\nDa da`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 3: Tiga Suku Kata',
              description: 'Transisi ke kata dengan 3 suku kata KV-KV-KV',
              passage: `Kelapa\nSepatu\nPisang\nBoneka\nTerbang`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 4: Kata Tertutup Pertama',
              description: 'Pengenalan ke kata tertutup',
              passage: `Kambing\nKantong\nMantap\nSamping\nBantal`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 5: Kata Tertutup Lanjutan',
              description: 'Pengenalan ke kata tertutup lanjutan',
              passage: `Kambing\nKantong\nMantap\nSamping\nBantal`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
          ],
        },
        {
          no: 4,
          name: 'Kalimat Sederhana (S-P-O)',
          isBonusLevel: false,
          stories: [
            {
              title: 'Bacaan 1: Kalimat Inti Aktif (S-P)',
              description: 'Fokus ke kalimat inti aktif dan S-P',
              passage: `Ayah datang.\nIbu masak.\nKucing tidur.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 2: Kalimat Transitif (S-P-O)',
              description: 'Fokus kalimat transitif dasar dan S-P-O',
              passage: `Budi tendang bola\nKakak minum susu.\nMama masak ayam.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 3: Kalimat dengan Keterangan (S-P-K)',
              description: 'Kalimat dengan keterangan atau S-P-K',
              passage: `Rusa lari di hutan.\nBola ada di meja.\nKakak makan di meja.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 4: Kalimat Lengkap (S-P-O-K)',
              description: 'Kalimat lengkap dengan S-P-O-K',
              passage: `Adik baca buku di kamar\nMama masak ayam di dapur\nAyah baca koran di teras`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 5: Dua Klausa Sederhana',
              description: '2 klausa sederhana',
              passage: `Saya lari dan melompat\nKakak membaca dan mendengar\nIbu senyum dan tertawa`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
          ],
        },
        {
          no: 5,
          name: 'Cerita Naratif Sederhana',
          isBonusLevel: false,
          stories: [
            {
              title: 'Bacaan 1: Kalimat S-P/S-P-O Sederhana',
              description: 'Semua kalimat S-P/S-P-O sederhana',
              passage: `Saya punya kucing.\nKucing saya warna putih.\nKucing suka minum susu.\nKucing kecil suka tidur.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 2: Urutan Kronologis',
              description: 'Urutan kronologis',
              passage: `Ibu pergi ke pasar.\nIbu naik mobil biru.\nIbu beli banyak sayur.\nIbu pulang bawa tas.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 3: Pola S-P-O dalam Naratif',
              description:
                'Memperkuat pola S-P-O Level 4 dalam konteks naratif',
              passage: `Dedi senang sekolah.\nDedi bertemu teman baru.\nMereka baca satu buku.\nMereka main bola di halaman.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 4: Penggunaan Keterangan',
              description: 'Penggunaan keterangan',
              passage: `Di taman ada pohon.\nItu adalah pohon jambu.\nPohon jambu sangat tinggi.\nJambu rasanya manis sekali.`,
              image: '/public/placeholder.webp',
              status: StoryStatus.ACCEPTED,
            },
            {
              title: 'Bacaan 5: Menggabungkan S-P dan S-P-K',
              description: 'Menggabungkan S-P dan S-P-K',
              passage: `Langit mulai gelap.\nAngin kencang sekali.\nKemudian hujan turun.\nSaya cepat masuk rumah.`,
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
