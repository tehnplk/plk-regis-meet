# up_db_structure_step.md

เอกสารนี้สรุปขั้นตอนการอัปเดตโครงสร้างฐานข้อมูล (DB schema) ของโปรเจคที่ใช้ Prisma สำหรับนำขึ้น production

## 0) เตรียมไฟล์/สิ่งที่ต้องมีบน Server
- **package.json** และ lock file (`package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`)
- โฟลเดอร์ **prisma/** อย่างน้อย:
  - `schema.prisma`
  - `prisma.config.ts` (ถ้ามี)
  - **`migrations/` (แนะนำอย่างยิ่งสำหรับ production)**
- ไฟล์ environment: `.env` หรือกำหนด ENV บน server
  - ตัวอย่าง: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`

> ถ้าใช้ SQLite ต้องมีไฟล์ DB จริง เช่น `prisma/events.db` และ `DATABASE_URL` ต้องชี้ให้ถูก

## 1) แนวทางที่แนะนำ (Production-safe): ใช้ Migration + migrate deploy
### 1.1 ทำที่เครื่อง Dev (ครั้งแรกของการเปลี่ยน schema)
1) แก้ `prisma/schema.prisma`
2) สร้าง migration (และทดสอบกับ DB dev)
```bash
npx prisma migrate dev --name <your_migration_name>
```
3) Commit โฟลเดอร์ `prisma/migrations/**` เข้าระบบ version control

### 1.2 ทำที่ Server (ทุกครั้งที่ deploy)
> ใช้คำสั่งนี้เพื่อ apply migrations กับ production DB แบบปลอดภัย

1) ติดตั้ง dependencies
```bash
npm ci
```

2) Generate Prisma Client
```bash
npx prisma generate
```

3) Apply migrations
```bash
npx prisma migrate deploy
```

4) Build และ restart service
```bash
npm run build
npm run start
```

## 2) ทางเลือก (ไม่แนะนำใน Production): ใช้ db push
ใช้เมื่อคุณ **ไม่มี `prisma/migrations`** และยอมรับความเสี่ยงเรื่อง schema drift / rollback ยาก

1) ติดตั้ง dependencies
```bash
npm ci
```

2) Sync schema เข้า DB
```bash
npx prisma db push
```

3) Generate Prisma Client
```bash
npx prisma generate
```

4) Build และ restart service
```bash
npm run build
npm run start
```

## 3) Checklist ก่อน/หลังอัปเดต
- **Backup DB** ก่อนรันคำสั่งเปลี่ยน schema (สำคัญมาก)
- ตรวจ `DATABASE_URL` ให้ถูก environment
- หลังอัปเดต ให้ทดสอบ endpoint สำคัญ:
  - `POST /api/events` (สร้าง event)
  - `/poster?eventId=...` (หน้า poster)

## 4) หมายเหตุสำหรับ Production
- Production ควรใช้ **`npx prisma migrate deploy`** เป็นหลัก
- หลีกเลี่ยงการ copy แค่ `src/` + `schema.prisma` เพราะมักขาดไฟล์ที่จำเป็นสำหรับ build/runtime
