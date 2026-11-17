# وثيقة الخطة التنفيذية والهندسية لمشروع "وردية" (Wardia)

**Platform Type:** Managed Industrial Shift & Workforce Marketplace  
**Tech Ecosystem:** Next.js (App Router / Full-stack or Decoupled), Laravel 11 REST API, MySQL 8.0, Redis 7  
**Architecture:** Hybrid Web Architecture (SSR/SSG + PWA) / Event-Driven Settlement / Audit-Proof Ledger

---

## 1. الهيكل المعماري والتقني (System Architecture & Stack)

### 1.1 المكونات التقنية الأساسية

- **واجهة العامل (Worker PWA via Next.js):**
  - مبنية بـ Next.js مع `@ducanh2912/next-pwa` أو `Serwist` لتوليد Service Workers متطورة.
  - استخدام Client Components للمكونات التفاعلية (مسار الـ Dynamic QR Code، أزرار الحجز السريعة).
  - خفة فائقة واستهلاك بيانات منخفض جداً عبر تحسين الصور والخطوط تلقائياً بواسطة Next.js Image & Font Optimization.
- **لوحة تحكم المصنع والإدارة (Factory & Operations Portal):**
  - Next.js App Router مع Server Components (RSC) لسرعة جلب ومعالجة تقارير الحضور الضخمة من الخادم مباشرة دون تحميل متصفح العميل.
  - استخدام Server Actions و Next.js Middleware لتأمين المسارات والتحقق المسبق من الجلسات (Session Validation) قبل وصول الطلب للواجهة.
- **الخادم المركزي وقواعد البيانات (Backend & Data Layer):**
  - **الخادم المركزي:** Laravel 11 (PHP 8.3) بنمط RESTful API مخصص للعمليات الثقيلة (Financial Ledger, Queue Processing, Core RBAC).
  - **الاتصال اللحظي:** Laravel Reverb (WebSockets) لإرسال أحداث الحضور الفوري وتحديث الشواغر اللحظية.
  - **قاعدة البيانات:** MySQL 8.0 (InnoDB) مع الالتزام الصارم بـ ACID Transactions و Row-Level Locking.
  - **إدارة الطوابير والكاش:** Redis 7 للـ Distributed Locks و Rate-limiting و Dynamic Tokens.
  - **التخزين السحابي:** AWS S3 / Cloudflare R2 مع تشفير البيانات وتوليد Presigned URLs لوثائق الهوية والبطاقات الضريبية.

---

## 2. المعمارية الأمنية ونزاهة الحسابات (Security & Integrity Blueprint)

### 2.1 دور Next.js في تعزيز الأمان وتجربة الاستخدام

1. **أمان المسارات والجلسات (Next.js Middleware):**
   - عزل جلسات العمال عن حسابات المشرفين وبوابات المصانع على مستوى Edge Middleware قبل معالجة الصفحات.
   - إخفاء الـ API Keys الحساسة الخاصة ببوابات الـ SMS وتخزينها في بيئة الخادم الخالصة (Server-only Secrets).
2. **التحقق من هوية العامل ومكافحة التلاعب (Anti-Spoofing Dynamic QR):**
   - توليد رمز QR ديناميكي يتغير كل 15 ثانية داخل واجهة العامل.
   - التشفير باستخدام `HMAC-SHA256` يحتوي على: `Worker_ID + Timestamp + Nonce`.
   - استغلال Next.js Route Handlers لعمل Proxy آمن بين الواجهة وخادم Laravel لفحص النطاق الجغرافي للمصنع (Geo-fencing) ومنع التزوير.

### 2.2 أمن المصنع والعزل البرمجي (Factory Isolation & RBAC)

1. **صلاحيات متعددة المستويات (RBAC):**
   - **مدير الحساب (Factory Admin):** واجهة Dashboard تعتمد على SSR لعرض الفواتير وإصدار الشفتات وتحليل البيانات.
   - **مشرف البوابة (Gate Supervisor):** واجهة Mobile-optimized بـ Next.js محصورة فقط في كاميرا مسح الـ QR والتحقق دون صلاحية الوصول للبيانات الحساسة.
2. **عزل النطاقات (Tenant Scoping):** حصر استعلامات المصنع برمجياً ضمن معرف المصنع (`factory_id`) وتشفير البيانات الحساسة بـ `AES-256-CBC`.

### 2.3 دفتر المستحقات غير القابل للتلاعب (Immutable Financial Ledger)

- منع عمليات `UPDATE` أو `DELETE` في جدول الأرباح (`earnings_ledger`).
- تسجيل أي خصم أو تعديل عبر قيد تسوية جديد من نوع `ADJUSTMENT` مرتبط برقم النزاع الموثق.
- تفعيل `SELECT ... FOR UPDATE` مع Redis Distributed Lock في محرك الحجز بـ Laravel لحظر الـ Race Conditions عند حجز الشواغر الأخيرة.

---

## 3. هيكل قاعدة البيانات المبدئي (Database Schema DDL)

```sql
-- 1. جدول المصانع
CREATE TABLE factories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191) NOT NULL,
    tax_record VARCHAR(100) NULL,
    industrial_zone VARCHAR(191) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    status ENUM('pending', 'verified', 'suspended') DEFAULT 'pending',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول العمال
CREATE TABLE workers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(191) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    national_id VARCHAR(14) UNIQUE NOT NULL,
    id_card_photo_url VARCHAR(255) NULL,
    attendance_score DECIMAL(5, 2) DEFAULT 100.00,
    status ENUM('active', 'restricted', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول الورديات (Shifts)
CREATE TABLE shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    factory_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(191) NOT NULL,
    description TEXT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    worker_wage DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) NOT NULL,
    slots_needed INT UNSIGNED NOT NULL,
    slots_filled INT UNSIGNED DEFAULT 0,
    status ENUM('draft', 'open', 'ongoing', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (factory_id) REFERENCES factories(id) ON DELETE CASCADE,
    INDEX idx_shifts_date_status (shift_date, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول الحجوزات والحضور
CREATE TABLE shift_bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shift_id BIGINT UNSIGNED NOT NULL,
    worker_id BIGINT UNSIGNED NOT NULL,
    status ENUM('booked', 'attended', 'no_show', 'cancelled_valid') DEFAULT 'booked',
    check_in_at TIMESTAMP NULL,
    check_out_at TIMESTAMP NULL,
    verified_by_user_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uq_shift_worker (shift_id, worker_id),
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. دفتر الأستاذ والمستحقات (Immutable Ledger)
CREATE TABLE earnings_ledger (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    worker_id BIGINT UNSIGNED NOT NULL,
    shift_booking_id BIGINT UNSIGNED NOT NULL,
    transaction_type ENUM('EARNED', 'PENALTY_COMPENSATION', 'PAYOUT', 'ADJUSTMENT') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    notes VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id),
    FOREIGN KEY (shift_booking_id) REFERENCES shift_bookings(id),
    INDEX idx_ledger_worker (worker_id, transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

4. مراحل التنفيذ والجدول الزمني المحدث (Implementation Roadmap)
   المرحلة 1: إعداد البيئة وهيكل Next.js و Laravel (الأسابيع 1 - 2)
   [ ] تهيئة مشروع Next.js (App Router + TypeScript + Tailwind CSS) وإعداد الـ Monorepo أو الهيكل المزدوج.

[ ] إعداد بيئة Docker للـ Backend (PHP 8.3, MySQL 8.0, Redis 7).

[ ] بناء هيكل الـ Migrations والـ Seeders في Laravel 11.

[ ] إعداد المصادقة عبر OTP وتكامل Next-Auth / Iron-Session مع توكنات Laravel Sanctum.

المرحلة 2: محرك الشفتات وبوابة المصنع بـ Next.js (الأسابيع 3 - 5)
[ ] بناء واجهات لوحة تحكم المصنع عبر Server Components لضمان أقصى سرعة تحميل.

[ ] برمجة شاشات إنشاء الشفتات وإدارتها وتتبع الإشغال اليومي لحظياً.

[ ] تفعيل Redis Distributed Lock في خادم Laravel لمنع الـ Over-booking أثناء ضغط الحجز.

المرحلة 3: تطبيق العامل (PWA) ومنظومة الـ QR (الأسابيع 6 - 8)
[ ] ضبط Next.js PWA مع تفعيل الـ Offline Caching لعرض الشفتات المحجوزة مسبقاً بدون إنترنت.

[ ] تطوير واجهة الـ Dynamic QR Code المشفر على هاتف العامل (تحديث كل 15 ثانية).

[ ] تطوير واجهة ماسح الكاميرا الخاصة بمشرف بوابة المصنع مع ربط فحص الـ Geolocation.

المرحلة 4: المحرك المالي والنزاعات والـ Stress Testing (الأسابيع 9 - 10)
[ ] إطلاق الـ Immutable Financial Ledger لحساب المستحقات آلياً فور إغلاق الشفت.

[ ] بناء بوابة إدارة الشكاوى وتعديل القيود المالية داخل لوحة التحكم المركزية.

[ ] اختبارات أداء موسعة (Stress Testing) لسيناريوهات الحجز والمسح المكثف في أوقات الذروة الصباحية.

المرحلة 5: التشغيل التجريبي الميداني (الأسابيع 11 - 12)
[ ] نشر تطبيق Next.js على Vercel أو خادم Node مستقل (VPS) مع ربطه بخادم Laravel.

[ ] بدء التشغيل التجريبي الميداني مع 2 إلى 3 مصانع في المنطقة الصناعية المستهدفة بمتوسط 20-30 عاملاً.

[ ] مراقبة سرعة مسح الدخول عند البوابة وجمع التغذية الراجعة من المشرفين والعمال وتصحيح المسار فورياً.

<ElicitationsGroup message="للبدء في خطوات إعداد Next.js وربطه مع Laravel، اختر المسار الأنسب:">
  <Elicitation label="إعداد تكوين Next.js PWA والـ Service Worker للعمال" query="اكتب لي كود إعداد الـ PWA في Next.js App Router مع ملف manifest.json وضبط الـ Service Worker للكاش."/>
  <Elicitation label="تصميم Middleware الأمان وعزل الجلسات في Next.js" query="اكتب لي كود middleware.ts في Next.js لإدارة التوكنات وتوجيه العمال والمصانع حسب الصلاحيات."/>
  <Elicitation label="برمجة مكون ماسح الـ QR في Next.js مع التحقق الجغرافي" query="اكتب لي كود ماسح الـ QR Code في Next.js كاميرا المشرف مع فحص إحداثيات GPS الخاصة بالمصنع."/>
</ElicitationsGroup>
