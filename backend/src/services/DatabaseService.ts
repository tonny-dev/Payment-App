import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: sqlite3.Database;

  private constructor() {
    this.db = new sqlite3.Database('./database/app.db');
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async runHealthCheck(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT 1', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Create users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('psp', 'dev')) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create transactions table
        this.db.run(
          `
          CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            recipient TEXT NOT NULL,
            amount REAL NOT NULL,
            currency TEXT NOT NULL,
            status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    });
  }

  // User methods
  public async createUser(
    email: string,
    password: string,
    role: 'psp' | 'dev'
  ): Promise<User> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, password, role],
        function (err) {
          if (err) reject(err);
          else {
            resolve({
              id: this.lastID,
              email,
              password,
              role,
              created_at: new Date().toISOString(),
            });
          }
        }
      );
    });
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row: User) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  }

  public async findUserById(id: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row: User) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  }

  // Transaction methods
  public async createTransaction(
    transaction: Omit<Transaction, 'id'>
  ): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO transactions (user_id, recipient, amount, currency, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [
          transaction.user_id,
          transaction.recipient,
          transaction.amount,
          transaction.currency,
          transaction.status,
          transaction.timestamp,
        ],
        function (err) {
          if (err) reject(err);
          else {
            resolve({
              id: this.lastID,
              ...transaction,
            });
          }
        }
      );
    });
  }

  public async updateTransactionStatus(
    transactionId: number,
    status: 'pending' | 'completed' | 'failed'
  ): Promise<Transaction> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE transactions SET status = ? WHERE id = ?',
        [status, transactionId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            this.db.get(
              'SELECT * FROM transactions WHERE id = ?',
              [transactionId],
              (err, row: Transaction) => {
                if (err) reject(err);
                else if (!row) reject(new Error('Transaction not found'));
                else resolve(row);
              }
            );
          }
        }
      );
    });
  }

  public async getUserTransactions(userId: number): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50',
        [userId],
        (err, rows: Transaction[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
}
