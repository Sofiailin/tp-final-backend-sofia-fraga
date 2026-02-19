import { User } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('La variable de entorno JWT_SECRET no está definida');
}

export const register = async (username: string, email: string, pass: string, role?: UserRole) => {
  const hashedPassword = await bcrypt.hash(pass, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: role || UserRole.DUENIO
  });

  return await newUser.save();
};

export const login = async (email: string, pass: string): Promise<string> => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(pass, user.password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return token;
};