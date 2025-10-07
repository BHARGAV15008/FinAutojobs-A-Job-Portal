import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
// First make sure to install the package:
// npm install @neondatabase/serverless
// npm install --save-dev @types/neondatabase__serverless
// First install the package with: npm install @neondatabase/serverless
import {
  users,
  companies,
  jobs,
  applications,
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
} from "./shared/schema";
import { eq, like, and, or, gte, lte } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;
  
  // Job operations
  getJob(id: string): Promise<Job | undefined>;
  getJobs(filters?: JobFilters): Promise<Job[]>;
  getJobsByCompany(companyId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: string): Promise<boolean>;
  
  // Application operations
  getApplication(id: string): Promise<Application | undefined>;
  getApplications(filters?: ApplicationFilters): Promise<Application[]>;
  getApplicationsByUser(userId: string): Promise<Application[]>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: string): Promise<boolean>;
}

export interface JobFilters {
  location?: string;
  job_type?: string;
  work_mode?: string;
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  search?: string;
  company_id?: string;
  industry?: string;
  date_posted?: number; // days
  sort?: 'recent' | 'salary_desc' | 'salary_asc';
  page?: number;
  limit?: number;
}

export interface ApplicationFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export class PostgresStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
    return result[0];
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await db.insert(companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const result = await db.update(companies).set(company).where(eq(companies.id, id)).returning();
    return result[0];
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id)).returning();
    return result.length > 0;
  }

  // Job operations
  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    return result[0];
  }

  async getJobs(filters: JobFilters = {}): Promise<Job[]> {
    let query = db.select().from(jobs);
    
    // Apply filters
    const conditions = [];
    
    if (filters.location) {
      conditions.push(like(jobs.location, `%${filters.location}%`));
    }
    
    if (filters.job_type) {
      conditions.push(eq(jobs.job_type, filters.job_type as string));
    }
    
    if (filters.work_mode) {
      conditions.push(eq(jobs.work_mode, filters.work_mode));
    }
    
    if (filters.experience_min !== undefined) {
      conditions.push(gte(jobs.experience_min, filters.experience_min));
    }
    
    if (filters.experience_max !== undefined) {
      conditions.push(lte(jobs.experience_max, filters.experience_max));
    }
    
    if (filters.salary_min !== undefined) {
      conditions.push(gte(jobs.salary_min, filters.salary_min));
    }
    
    if (filters.salary_max !== undefined) {
      conditions.push(lte(jobs.salary_max, filters.salary_max));
    }
    
    if (filters.company_id) {
      conditions.push(eq(jobs.company_id, filters.company_id));
    }
    
    if (filters.search) {
      conditions.push(
        or(
          like(jobs.title, `%${filters.search}%`),
          like(jobs.description, `%${filters.search}%`)
        )
      );
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    if (filters.sort === 'salary_desc') {
      query = query.orderBy(jobs.salary_max, 'desc');
    } else if (filters.sort === 'salary_asc') {
      query = query.orderBy(jobs.salary_min, 'asc');
    } else {
      // Default to recent
      query = query.orderBy(jobs.created_at, 'desc');
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    return await query;
  }

  async getJobsByCompany(companyId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.company_id, companyId));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job).returning();
    return result[0];
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job | undefined> {
    const result = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return result[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id)).returning();
    return result.length > 0;
  }

  // Application operations
  async getApplication(id: string): Promise<Application | undefined> {
    const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return result[0];
  }

  async getApplications(filters: ApplicationFilters = {}): Promise<Application[]> {
    let query = db.select().from(applications);
    
    // Apply filters
    if (filters.status) {
      query = query.where(eq(applications.status, filters.status));
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    query = query.limit(limit).offset(offset);
    
    return await query;
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.user_id, userId));
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.job_id, jobId));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values(application).returning();
    return result[0];
  }

  async updateApplication(id: string, application: Partial<InsertApplication>): Promise<Application | undefined> {
    const result = await db.update(applications).set(application).where(eq(applications.id, id)).returning();
    return result[0];
  }

  async deleteApplication(id: string): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new PostgresStorage();