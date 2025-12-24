# จุดที่ต้องปรับแก้และข้อเสนอแนะ (Context7 Analysis)

เอกสารนี้สรุปผลการวิเคราะห์โค้ดเบสของระบบ PLK Regis Meet โดยระบุจุดที่ต้องปรับแก้ ปรับปรุง และข้อเสนอแนะต่าง ๆ

**วันที่จัดทำ:** 24 ธันวาคม 2025  
**ระบบ:** PLK Regis Meet - ระบบลงทะเบียนและบริหารจัดการกิจกรรม  
**เทคโนโลยี:** Next.js 16, Prisma, SQLite, NextAuth

---

## สารบัญ

1. [ปัญหาด้านความปลอดภัย (Security Issues)](#1-ปัญหาด้านความปลอดภัย-security-issues)
2. [ปัญหาด้านคุณภาพโค้ด (Code Quality Issues)](#2-ปัญหาด้านคุณภาพโค้ด-code-quality-issues)
3. [ปัญหาด้านการจัดการข้อผิดพลาด (Error Handling)](#3-ปัญหาด้านการจัดการข้อผิดพลาด-error-handling)
4. [ข้อเสนอแนะด้านประสิทธิภาพ (Performance Recommendations)](#4-ข้อเสนอแนะด้านประสิทธิภาพ-performance-recommendations)
5. [ปัญหาด้านเอกสารและความชัดเจนของโค้ด (Documentation & Code Clarity)](#5-ปัญหาด้านเอกสารและความชัดเจนของโค้ด-documentation--code-clarity)
6. [ข้อเสนอแนะด้านสถาปัตยกรรม (Architecture Recommendations)](#6-ข้อเสนอแนะด้านสถาปัตยกรรม-architecture-recommendations)

---

## 1. ปัญหาด้านความปลอดภัย (Security Issues)

### 🔴 ระดับ CRITICAL

#### 1.1 Hardcoded Secrets ใน Repository

**ตำแหน่ง:** `.env`

**ปัญหา:**
- ไฟล์ `.env` ถูก commit เข้า repository พร้อมกับ secrets จริง
- มี `AUTH_SECRET`, `HEALTH_CLIENT_SECRET`, `PROVIDER_CLIENT_SECRET`, และ `JWT_SECRET` ถูก hardcode
- ความเสี่ยง: ผู้ไม่หวังดีที่เข้าถึง repository สามารถขโมย credentials และเข้าถึงระบบได้

**แนวทางแก้ไข:**
```bash
# 1. เพิ่มไฟล์ .env เข้า .gitignore (ถ้ายังไม่มี)
echo ".env" >> .gitignore

# 2. ลบ .env ออกจาก git history
git rm --cached .env
git commit -m "Remove .env from repository"

# 3. สร้างไฟล์ .env.example แทน (ไม่มี secret จริง)
cp .env .env.example
# แก้ไขค่าใน .env.example ให้เป็นค่าตัวอย่าง
```

**ตัวอย่าง `.env.example` ที่ควรมี:**
```env
# ===== Auth (Development) =====
AUTH_SECRET="your-auth-secret-here"
AUTH_TRUST_HOST=true
AUTH_URL=http://localhost:3000

# ===== Health ID (Development) =====
HEALTH_CLIENT_ID=your-health-client-id
HEALTH_CLIENT_SECRET=your-health-client-secret
HEALTH_REDIRECT_URI=http://localhost:3000/api/auth/healthid

# ===== Provider ID (Development) =====
PROVIDER_CLIENT_ID=your-provider-client-id
PROVIDER_CLIENT_SECRET=your-provider-client-secret

# ===== JWT (Development) =====
JWT_SECRET="your-jwt-secret-here"
```

#### 1.2 Weak JWT Secret Fallback

**ตำแหน่ง:** `src/lib/jwt.ts:3`

**ปัญหา:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
```
- มี fallback secret ที่อ่อนแอ (`'fallback-secret'`)
- ถ้า JWT_SECRET ไม่ถูกตั้งค่า ระบบจะใช้ค่าที่คาดเดาได้ง่าย
- ผู้โจมตีสามารถสร้าง JWT token ปลอมได้

**แนวทางแก้ไข:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const secret = new TextEncoder().encode(JWT_SECRET);
```

### 🟡 ระดับ HIGH

#### 1.3 Sensitive Data Logging

**ตำแหน่ง:** `src/authConfig.ts:13`

**ปัญหา:**
```typescript
console.log("credentials = ", credentials);
```
- Log ข้อมูล credentials ที่อาจมีข้อมูลละเอียดอ่อน
- ข้อมูลเหล่านี้อาจถูกเก็บใน log files และเข้าถึงได้โดยผู้ไม่ได้รับอนุญาต

**แนวทางแก้ไข:**
```typescript
// ลบหรือแสดงเฉพาะข้อมูลที่จำเป็นในโหมด development เท่านั้น
if (process.env.NODE_ENV === 'development') {
  console.log("auth attempt with cred-way:", credentials['cred-way']);
}
```

#### 1.4 Missing Input Sanitization

**ตำแหน่ง:** หลายไฟล์ API routes

**ปัญหา:**
- ไม่มีการ sanitize input ก่อนส่งไปยัง database
- มีความเสี่ยงต่อ XSS และ injection attacks
- ตัวอย่าง: ใน `src/app/api/events/route.ts` รับ HTML/text โดยตรงโดยไม่ sanitize

**แนวทางแก้ไข:**
```typescript
// ติดตั้ง sanitization library
// npm install dompurify isomorphic-dompurify

import DOMPurify from 'isomorphic-dompurify';

// ใช้กับข้อมูลที่จะแสดงเป็น HTML
const sanitizedDescription = DOMPurify.sanitize(description);
```

#### 1.5 Missing Rate Limiting

**ตำแหน่ง:** ทุก API endpoints

**ปัญหา:**
- ไม่มี rate limiting บน API endpoints
- มีความเสี่ยงต่อ DDoS attacks และ brute force attacks
- ผู้โจมตีสามารถสร้าง requests จำนวนมากได้ไม่จำกัด

**แนวทางแก้ไข:**
```typescript
// ติดตั้ง rate limiting middleware
// npm install express-rate-limit

// สร้าง middleware สำหรับ Next.js
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (สำหรับ production ควรใช้ Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'unknown';
  const now = Date.now();
  const limit = 100; // requests per minute
  const windowMs = 60 * 1000; // 1 minute

  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return NextResponse.next();
  }

  if (record.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 2. ปัญหาด้านคุณภาพโค้ด (Code Quality Issues)

### 🟡 ระดับ MEDIUM

#### 2.1 Mixed Use of console.log and console.error

**ตำแหน่ง:** ทั่วทั้ง codebase

**ปัญหา:**
- มีการใช้ `console.log` (3 จุด) และ `console.error` (25 จุด) กระจัดกระจาย
- ไม่มี structured logging
- ยากต่อการ debug และ monitor ใน production

**แนวทางแก้ไข:**
```typescript
// สร้าง logger utility
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (process.env.NODE_ENV === 'production') {
      return level === 'error' || level === 'warn';
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, {
        ...context,
        error: error?.message,
        stack: error?.stack,
      }));
    }
  }
}

export const logger = new Logger();
```

**ตัวอย่างการใช้งาน:**
```typescript
// แทนที่
console.log("Authorization Health id Code :", code);

// ด้วย
logger.debug("Authorization Health ID Code received", { codeLength: code.length });

// แทนที่
console.error(error);

// ด้วย
logger.error("Failed to create event", error as Error, { eventTitle: title });
```

#### 2.2 Inconsistent Error Messages

**ตำแหน่ง:** API routes ต่าง ๆ

**ปัญหา:**
- Error messages ไม่สม่ำเสมอ
- บางที่เป็นภาษาไทย บางที่เป็นภาษาอังกฤษ
- ไม่มี error codes สำหรับ client จัดการ

**แนวทางแก้ไข:**
```typescript
// src/lib/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  MISSING_FIELDS: 'MISSING_FIELDS',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
} as const;

// ตัวอย่างการใช้งาน
if (!token) {
  throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Missing authentication token');
}

// Error handler middleware
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  logger.error('Unhandled error', error as Error);
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}
```

#### 2.3 Duplicate Code

**ตำแหน่ง:** หลาย API routes

**ปัญหา:**
- มีโค้ดซ้ำซ้อนในการตรวจสอบ JWT
- มีโค้ดซ้ำในการแปลง eventId และ validate parameters

**ตัวอย่างโค้ดซ้ำ:**
```typescript
// ปรากฏใน /api/events/route.ts, /api/events/[id]/participants/route.ts และอื่น ๆ
const token = getTokenFromRequest(request);
if (!token) {
  return new NextResponse('Unauthorized', { status: 401 });
}

const payload = await verifyToken(token);
if (!payload) {
  return new NextResponse('Invalid token', { status: 401 });
}
```

**แนวทางแก้ไข:**
```typescript
// src/lib/api-helpers.ts
export async function requireAuth(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Missing authentication token');
  }

  const payload = await verifyToken(token);
  if (!payload) {
    throw new ApiError(401, ErrorCodes.INVALID_TOKEN, 'Invalid or expired token');
  }

  return payload;
}

export function parseEventId(id: string): number {
  const eventId = Number(id);
  if (Number.isNaN(eventId)) {
    throw new ApiError(400, ErrorCodes.INVALID_PARAMETER, 'Invalid event ID');
  }
  return eventId;
}

// ใช้งาน
export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const payload = await requireAuth(request);
    const resolvedParams = await params;
    const eventId = parseEventId(resolvedParams.id);
    
    // business logic here...
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### 2.4 Magic Numbers and Strings

**ตำแหน่ง:** หลายไฟล์

**ปัญหา:**
- มี magic numbers และ strings กระจัดกระจาย
- ตัวอย่าง: `registerMethod: 1=provider_id only, 2=form only, 3=both`
- ยากต่อการ maintain และเข้าใจ

**แนวทางแก้ไข:**
```typescript
// src/lib/constants.ts
export const RegisterMethod = {
  PROVIDER_ID_ONLY: 1,
  FORM_ONLY: 2,
  BOTH: 3,
} as const;

export const ParticipantStatus = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const FoodType = {
  NORMAL: 'normal',
  ISLAM: 'islam',
} as const;

export const FileUploadLimits = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
} as const;

export const JwtConfig = {
  SESSION_MAX_AGE: 60 * 60 * 25, // 25 hours
  PUBLIC_TOKEN_MAX_AGE: 60 * 60 * 24, // 24 hours
} as const;

// ใช้งาน
const allowProviderId = registerMethod === RegisterMethod.PROVIDER_ID_ONLY || 
                        registerMethod === RegisterMethod.BOTH;
```

---

## 3. ปัญหาด้านการจัดการข้อผิดพลาด (Error Handling)

### 🟡 ระดับ MEDIUM

#### 3.1 Swallowed Errors in Catch Blocks

**ตำแหน่ง:** หลายจุด เช่น `src/lib/auth.ts:67-69`

**ปัญหา:**
```typescript
} catch {
  // If decoding fails, fall through to fetch a fresh token
}
```
- มีการ catch error แต่ไม่ log หรือ handle
- ทำให้ยากต่อการ debug

**แนวทางแก้ไข:**
```typescript
} catch (error) {
  logger.debug('Failed to decode JWT token', { error: error instanceof Error ? error.message : 'Unknown error' });
  // Fall through to fetch a fresh token
}
```

#### 3.2 Generic Error Messages to Client

**ตำแหน่ง:** หลาย API endpoints

**ปัญหา:**
```typescript
} catch (error) {
  console.error(error);
  return new NextResponse('Internal Server Error', { status: 500 });
}
```
- ส่ง generic error message กลับไปที่ client
- Client ไม่สามารถจัดการ error ได้อย่างเหมาะสม
- ไม่มี error tracking

**แนวทางแก้ไข:**
```typescript
} catch (error) {
  logger.error('Failed to create event', error as Error, { 
    title,
    capacity,
    location 
  });
  
  // ใช้ error handler ที่สร้างไว้
  return handleApiError(error);
}
```

---

## 4. ข้อเสนอแนะด้านประสิทธิภาพ (Performance Recommendations)

### 🟢 ระดับ LOW

#### 4.1 Missing Database Indexes

**ตำแหน่ง:** `prisma/schema.prisma`

**ปัญหา:**
- ไม่มี indexes บน columns ที่ query บ่อย
- ตัวอย่าง: `Event.beginDate`, `Participant.eventId`, `Participant.providerId`

**แนวทางแก้ไข:**
```prisma
model Event {
  id          Int           @id @default(autoincrement())
  title       String
  beginDate   String        @default("")
  // ... other fields

  @@index([beginDate])
  @@index([status])
  @@index([regis_closed])
}

model Participant {
  id         Int      @id @default(autoincrement())
  eventId    Int
  providerId String?
  // ... other fields

  @@index([eventId])
  @@index([providerId])
  @@index([status])
}

model LoginLog {
  id           Int      @id @default(autoincrement())
  providerId   String
  datetime     DateTime @default(now())
  // ... other fields

  @@index([providerId])
  @@index([datetime])
}
```

#### 4.2 N+1 Query Problem

**ตำแหน่ง:** อาจเกิดขึ้นใน components ที่ fetch ข้อมูล

**แนวทางแก้ไข:**
- ใช้ Prisma's `include` หรือ `select` เพื่อ eager load relationships
- ตรวจสอบ Prisma query logs เพื่อหา N+1 queries

```typescript
// ❌ N+1 Query
const events = await prisma.event.findMany();
for (const event of events) {
  const participants = await prisma.participant.findMany({
    where: { eventId: event.id }
  });
}

// ✅ Single Query
const events = await prisma.event.findMany({
  include: {
    participants: true
  }
});
```

#### 4.3 Missing Pagination

**ตำแหน่ง:** API endpoints ที่ return lists เช่น `/api/events`

**ปัญหา:**
- ไม่มี pagination สำหรับ lists ที่อาจมีข้อมูลจำนวนมาก
- อาจทำให้ response ช้าและใช้ memory มาก

**แนวทางแก้ไข:**
```typescript
// GET /api/events?page=1&limit=20
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') ?? '1');
  const limit = Math.min(Number(searchParams.get('limit') ?? '20'), 100);
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      skip,
      take: limit,
      orderBy: [
        { beginDate: 'asc' },
        { id: 'asc' },
      ],
    }),
    prisma.event.count(),
  ]);

  return NextResponse.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

---

## 5. ปัญหาด้านเอกสารและความชัดเจนของโค้ด (Documentation & Code Clarity)

### 🟢 ระดับ LOW

#### 5.1 Missing API Documentation

**ปัญหา:**
- ไม่มีเอกสาร API
- Frontend developers ต้องอ่านโค้ดเพื่อเข้าใจ API

**แนวทางแก้ไข:**
สร้างไฟล์ `API_DOCUMENTATION.md`:

```markdown
# API Documentation

## Authentication

All API endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Get Token
- **Endpoint:** `GET /api/auth/token` (session-based) or `GET /api/auth/public-token`
- **Response:** `{ "token": "..." }`

## Events

### List Events
- **Endpoint:** `GET /api/events`
- **Query Params:** 
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20, max: 100)
- **Response:** `{ "events": [...], "pagination": {...} }`

### Create Event
- **Endpoint:** `POST /api/events`
- **Body:** `{ title, beginDate, time, location, capacity, description, ... }`
- **Response:** `{ "event": {...} }`

...
```

#### 5.2 Missing JSDoc Comments

**ปัญหา:**
- Functions ไม่มี JSDoc comments
- ยากต่อการเข้าใจและใช้งาน

**แนวทางแก้ไข:**
```typescript
/**
 * Generates a JWT token for API authentication
 * @param payload - The payload to encode in the token
 * @param payload.userId - User identifier
 * @param payload.providerId - Optional Provider ID from Health/Provider ID system
 * @returns A signed JWT token valid for 24 hours
 * @throws {Error} If JWT_SECRET is not configured
 */
export async function generateToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  // ...
}
```

#### 5.3 Unclear Variable Names

**ตำแหน่ง:** หลายจุด

**ปัญหา:**
- ตัวแปรบางตัวมีชื่อไม่ชัดเจน
- ตัวอย่าง: `is_auth`, `regis_closed` (inconsistent naming)

**แนวทางแก้ไข:**
- ใช้ camelCase consistently สำหรับ JavaScript/TypeScript
- ใช้ snake_case สำหรับ database columns (Prisma)
- ตั้งชื่อให้สื่อความหมายชัดเจน

```typescript
// ❌ Unclear
const is_auth = searchParams.get('is_auth') === 'yes';

// ✅ Clear
const shouldAuthenticate = searchParams.get('is_auth') === 'yes';

// ❌ Inconsistent
regis_closed // snake_case

// ✅ Consistent (in code)
registrationClosed // camelCase
// Keep snake_case in database schema
```

---

## 6. ข้อเสนอแนะด้านสถาปัตยกรรม (Architecture Recommendations)

### 🟢 ระดับ LOW

#### 6.1 Missing Input Validation Layer

**ปัญหา:**
- Input validation กระจัดกระจายใน API routes
- ไม่มี schema validation

**แนวทางแก้ไข:**
ใช้ Zod สำหรับ input validation:

```typescript
// npm install zod

// src/lib/schemas.ts
import { z } from 'zod';

export const CreateEventSchema = z.object({
  title: z.string().min(1).max(200),
  beginDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  time: z.string().min(1),
  location: z.string().min(1),
  coordinatorName: z.string().optional().nullable(),
  capacity: z.number().int().positive(),
  description: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  enableCheckInRadius: z.boolean().default(false),
  checkInRadiusMeters: z.number().int().positive().optional().nullable(),
  registerMethod: z.enum(['1', '2', '3']).default('3'),
  needOriginApprovePaper: z.boolean().default(false),
});

// ใช้งานใน API route
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CreateEventSchema.parse(body);
    
    // ตอนนี้ validatedData มี type-safe และ validated แล้ว
    const event = await prisma.event.create({
      data: validatedData
    });
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
```

#### 6.2 Monolithic API Routes

**ปัญหา:**
- API route files มีความยาวมาก (เช่น `/api/events/[id]/participants/route.ts` มี 385 บรรทัด)
- ยากต่อการ maintain และ test

**แนวทางแก้ไข:**
แยก business logic ออกเป็น services:

```typescript
// src/services/participant-service.ts
export class ParticipantService {
  async createParticipant(
    eventId: number,
    data: CreateParticipantData,
    options?: { skipValidation?: boolean }
  ) {
    // Business logic here
    return prisma.participant.create({ data });
  }

  async updateParticipant(
    participantId: number,
    data: UpdateParticipantData
  ) {
    // Business logic here
    return prisma.participant.update({
      where: { id: participantId },
      data,
    });
  }

  async deleteParticipant(participantId: number) {
    // Business logic here
  }
}

// src/app/api/events/[id]/participants/route.ts
const participantService = new ParticipantService();

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const payload = await requireAuth(request);
    const resolvedParams = await params;
    const eventId = parseEventId(resolvedParams.id);
    const form = await request.formData();
    
    // Validate input
    const data = validateParticipantForm(form);
    
    // Call service
    const participant = await participantService.createParticipant(eventId, data);
    
    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
```

#### 6.3 Missing Environment Validation

**ปัญหา:**
- ไม่มีการตรวจสอบว่า environment variables ครบหรือไม่ตอน startup
- อาจเกิด runtime errors ในภายหลัง

**แนวทางแก้ไข:**
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  HEALTH_CLIENT_ID: z.string().min(1),
  HEALTH_CLIENT_SECRET: z.string().min(1),
  HEALTH_REDIRECT_URI: z.string().url(),
  PROVIDER_CLIENT_ID: z.string().min(1),
  PROVIDER_CLIENT_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(e => e.path.join('.')).join(', ');
      throw new Error(`Missing or invalid environment variables: ${missing}`);
    }
    throw error;
  }
}

// Call this at app startup
export const env = validateEnv();

// ใช้งาน
import { env } from '@/lib/env';
const token = await fetch(env.HEALTH_CLIENT_ID);
```

---

## สรุปลำดับความสำคัญในการแก้ไข

### Priority 1 - CRITICAL (ต้องแก้ทันที)
1. ✅ ลบไฟล์ `.env` ออกจาก repository และสร้าง `.env.example`
2. ✅ แก้ไข JWT secret fallback ใน `src/lib/jwt.ts`
3. ✅ Rotate secrets ที่ถูก expose (AUTH_SECRET, JWT_SECRET, HEALTH_CLIENT_SECRET, PROVIDER_CLIENT_SECRET)

### Priority 2 - HIGH (ควรแก้ในเร็วๆ นี้)
1. ✅ เพิ่ม rate limiting
2. ✅ ลบหรือจำกัด sensitive data logging
3. ✅ เพิ่ม input sanitization สำหรับป้องกัน XSS

### Priority 3 - MEDIUM (ควรแก้ในอนาคตอันใกล้)
1. ✅ สร้าง structured logger
2. ✅ สร้าง consistent error handling
3. ✅ Refactor duplicate code
4. ✅ เปลี่ยน magic numbers/strings เป็น constants

### Priority 4 - LOW (ปรับปรุงเมื่อมีเวลา)
1. ✅ เพิ่ม database indexes
2. ✅ เพิ่ม pagination
3. ✅ เขียน API documentation
4. ✅ เพิ่ม JSDoc comments
5. ✅ Refactor เป็น service layer
6. ✅ เพิ่ม environment validation

---

## ไฟล์ที่แนะนำให้สร้างใหม่

1. **`src/lib/logger.ts`** - Structured logging utility
2. **`src/lib/errors.ts`** - Custom error classes และ error codes
3. **`src/lib/constants.ts`** - Application constants
4. **`src/lib/api-helpers.ts`** - Reusable API utilities
5. **`src/lib/schemas.ts`** - Zod validation schemas
6. **`src/lib/env.ts`** - Environment validation
7. **`src/middleware.ts`** - Rate limiting และ middleware อื่น ๆ
8. **`src/services/`** - Service layer สำหรับ business logic
9. **`API_DOCUMENTATION.md`** - API documentation
10. **`.env.example`** - Template สำหรับ environment variables

---

## ข้อเสนอแนะเพิ่มเติม

### Testing
- ควรเพิ่ม unit tests สำหรับ business logic
- ควรเพิ่ม integration tests สำหรับ API endpoints
- แนะนำใช้ Jest + Testing Library

### Monitoring
- ควรเพิ่ม monitoring และ alerting (เช่น Sentry, DataDog)
- ควร log request/response times
- ควร track error rates

### Security Headers
- เพิ่ม security headers (CSP, X-Frame-Options, etc.)
- ใช้ HTTPS ใน production
- เพิ่ม CORS configuration ที่เหมาะสม

### CI/CD
- ควรมี automated tests ใน CI pipeline
- ควรมี automated security scanning
- ควรมี automated deployment process

---

**หมายเหตุ:** เอกสารนี้เป็นการวิเคราะห์เบื้องต้น ควรมีการ review และปรับปรุงตามบริบทและความต้องการของโปรเจคจริง
