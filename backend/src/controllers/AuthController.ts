import bcrypt from 'bcryptjs';
import { DatabaseService } from '../services/DatabaseService';
import { CreateUserDTO, User, UserResponse } from '../models/User';
import { generateToken } from '../middleware/auth';

export class AuthController {
  private static readonly SALT_ROUNDS = 10;
  private db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  public async signup(
    userData: CreateUserDTO
  ): Promise<{ token: string; user: UserResponse }> {
    const existingUser = await this.db.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      AuthController.SALT_ROUNDS
    );
    const user = await this.db.createUser(
      userData.email,
      hashedPassword,
      userData.role
    );
    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }

  public async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: UserResponse }> {
    const user = await this.db.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }
}
