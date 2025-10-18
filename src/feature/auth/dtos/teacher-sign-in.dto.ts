import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsAlphanumeric,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class TeacherSignInDTO {
  @ValidateIf((o: TeacherSignInDTO) => !o.username)
  @IsNotEmpty({ message: 'Email atau username harus diisi' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(255, { message: 'Email maksimal 255 karakter' })
  email?: string;

  @ValidateIf((o: TeacherSignInDTO) => !o.email)
  @IsNotEmpty({ message: 'Email atau username harus diisi' })
  @IsString({ message: 'Username harus berupa string' })
  @IsAlphanumeric(undefined, {
    message: 'Username hanya boleh berisi huruf dan angka',
  })
  @MaxLength(90, { message: 'Username maksimal 90 karakter' })
  username?: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(255, { message: 'Password maksimal 255 karakter' })
  password: string;
}
