import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// create DTO for registering student along with parent account
// TODO: parent fullname make to null to accomodate parent already exist case
export class CreateStudentAndParentDTO {
  @IsNotEmpty({ message: 'Username siswa tidak boleh kosong' })
  @Transform(({ value }): string =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Matches(/^\S+$/, { message: 'Username tidak boleh ada spasi' })
  @IsString({ message: 'Username siswa harus berupa string' })
  @MaxLength(90, { message: 'Username siswa maksimal 90 karakter' })
  studentUsername: string;

  @IsNotEmpty({ message: 'Nama siswa tidak boleh kosong' })
  @IsString({ message: 'Nama siswa harus berupa string' })
  @MaxLength(255, { message: 'Nama siswa maksimal 255 karakter' })
  studentFullName: string;

  @IsNotEmpty({ message: 'Email orang tua tidak boleh kosong' })
  @IsEmail({}, { message: 'Format email orang tua tidak valid' })
  @IsString({ message: 'Email orang tua harus berupa string' })
  @MaxLength(255, { message: 'Email orang tua maksimal 255 karakter' })
  parentEmail: string;

  @IsNotEmpty({ message: 'Nama orang tua tidak boleh kosong' })
  @IsString({ message: 'Nama orang tua harus berupa string' })
  @MaxLength(255, { message: 'Nama orang tua maksimal 255 karakter' })
  parentFullName: string;
}
