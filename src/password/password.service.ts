import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'schemas/user.scheme';

@Injectable()
export class PasswordService {
  async encrypt(password: string): Promise<string> {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async verify(password: string, user: User) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password is not correct');
    }
  }
}
