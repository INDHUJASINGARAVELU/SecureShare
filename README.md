# SecureShare — Secure File Sharing System on AWS

> **A Secure File Sharing System on AWS Using Private S3 Storage, KMS Encryption, IAM Policies and Presigned URLs**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com)

---

## 🎓 Academic Project Information

- **Project Title:** SecureShare – A Secure File Sharing System on AWS Using Private S3 Storage, KMS Encryption, IAM Policies and Presigned URLs
- **Student Candidate:** Indhuja S.
- **Department:** Artificial Intelligence and Data Science
- **Institution:** Sri Manakula Vinayagar Engineering College (SMVEC)

---

## 🔒 Project Overview & Defense Scope

SecureShare is a cloud cybersecurity SaaS demonstration frontend designed to model AWS security best practices for enterprise file storage and time-bounded sharing.

> **IMPORTANT ARCHITECTURAL NOTICE:**  
> **This application is completely FRONTEND-ONLY.** All AWS operations (Amazon S3 bucket isolation, Block Public Access, SSE-KMS Customer Managed Key encryption, IAM Least-Privilege Policies, and Presigned URLs with 15-minute expiration) are **simulated using reactive client-side state and browser `localStorage`**. No live AWS charges, secrets, or cloud API keys are required.

---

## 🛡️ The 5 Core Security Architecture Layers

1. **Identity Layer (IAM & MFA):**
   - Role separation across 4 distinct personas: **Data Owner**, **Security Admin**, **Security Auditor**, and **External Recipient**.
   - Simulated virtual MFA device (TOTP authenticator code verification).
   - Strict Least-Privilege IAM boundaries (Auditors are restricted to read-only access).

2. **Storage Layer (Amazon S3):**
   - 100% Private S3 bucket architecture (`s3://secureshare-vault/`) with S3 Block Public Access (all 4 settings enabled).
   - Disabled S3 ACLs (Bucket Owner Enforced).
   - Logical prefix segregation (`private/` vs `shared/`).
   - S3 Object Versioning preservation.

3. **Encryption Layer (AWS KMS & TLS 1.3):**
   - Server-Side Encryption with Customer Managed Keys (`SSE-KMS`).
   - S3 Bucket Policy condition denying unencrypted `s3:PutObject` uploads.
   - Mandatory TLS 1.3 in-transit transfer enforcement (`aws:SecureTransport: "false"` -> Deny).

4. **Sharing Layer (Presigned URLs):**
   - Cryptographic temporary URL generation scoped strictly to single objects in the `shared/` prefix.
   - **Strict 15-Minute Expiration Ceiling** (options for 5m, 10m, 15m).
   - Live client-side countdown timer and automatic status transition to `EXPIRED`.
   - Control-plane emergency link revocation.

5. **Monitoring Layer (AWS CloudTrail & Telemetry):**
   - Immutable audit logging tracking all simulated API calls (`s3:GetObject`, `s3:PutObject`, `kms:Decrypt`, `MFA_VERIFICATION`, `ACCESS_DENIED`).
   - Downloadable CSV audit evidence logs for SOC 2 / ISO 27001 review.
   - Simulated CloudTrail JSON record inspector.

---

## 🚀 Key Application Pages & Capabilities

| Page Route | Description | Primary Roles |
|---|---|---|
| `/` | Public Landing Page with interactive persona launcher & security visualizer | All Visitors |
| `/login` | Demonstration login gateway with role tabs and simulated MFA modal | All Roles |
| `/dashboard` | Executive Cybersecurity Overview with Recharts metrics and storage usage | Data Owner, Admin |
| `/dashboard/my-files` | S3 Vault manager: Search, filter, sort, grid/list, rename, move prefixes | Data Owner, Admin |
| `/dashboard/upload` | Drag-and-drop file ingestion with simulated KMS encryption & versioning | Data Owner |
| `/dashboard/share` | 5-step dedicated Presigned URL generation workflow (Max 15m) | Data Owner |
| `/dashboard/access-links` | Central link control plane with live countdowns, copy, and revocation | Data Owner, Admin |
| `/recipient/demo-share/:token` | External recipient portal: Active, Expired, Revoked, and Invalid states | External Recipient |
| `/dashboard/security-center` | 5 Security Layers breakdown and interactive audit checklist | All Roles |
| `/dashboard/security-lab` | 9 Automated verification test cases with simulated policy outcomes | All Roles |
| `/dashboard/audit-logs` | CloudTrail event stream with JSON drawer and CSV exporter | All Roles |
| `/dashboard/admin` | IAM Access Management: User profiles, role policies, and MFA controls | Security Admin |
| `/dashboard/auditor` | Read-only compliance portal with restricted write actions | Security Auditor |
| `/dashboard/settings` | Preferences, 15m ceiling policy lock, and localStorage sandbox reset | All Roles |
| `/dashboard/help` | Operating manual and academic project attribution | All Roles |

---

## 🧪 Security Verification Lab Test Cases

The application includes 9 automated test scenarios derived from the project technical report:

1. **Test #1:** Valid temporary link before expiry &rarr; `HTTP 200 OK`
2. **Test #2:** Direct file access without a presigned link &rarr; `HTTP 403 Access Denied` (S3 Block Public Access)
3. **Test #3:** Tampered demo link token &rarr; `HTTP 403 Forbidden` (Signature Mismatch)
4. **Test #4:** Expired demo link request &rarr; `HTTP 403 Request Has Expired` (> 900s boundary)
5. **Test #5:** Revoked demo link access attempt &rarr; `HTTP 403 Access Revoked` (Revocation filter)
6. **Test #6:** Attempted access to Private-category file &rarr; `HTTP 403 Forbidden` (Prefix isolation)
7. **Test #7:** Upload without required KMS encryption header &rarr; `HTTP 403 Denied` (DenyUnencryptedPut)
8. **Test #8:** Insecure HTTP request (Cleartext non-TLS) &rarr; `HTTP 403 Denied` (EnforceTLSRequestsOnly)
9. **Test #9:** Unauthorized role action (Auditor file modification) &rarr; `HTTP 403 IAM Deny`

---

## 🛠️ Technology Stack

- **Framework:** React 18 + Vite + TypeScript
- **Styling:** Tailwind CSS (Deep navy `#0B1120`, Electric Blue `#2563eb`, Emerald `#10b981`, Amber `#f59e0b`, Rose `#f43f5e`)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Data Visualizations:** Recharts (AreaChart, PieChart)
- **Notifications:** Sonner + Custom Security Notification Popover
- **Routing:** React Router v6
- **Storage:** Browser `localStorage` with safe hydration and reset recovery

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Render (Static Site)

1. Connect your GitHub repository to [Render.com](https://render.com).
2. Choose **Static Site**.
3. Set the following settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Client-side routing fallback is automatically configured via `public/_redirects` (`/* /index.html 200`).
5. Click **Create Static Site**. No environment variables or API keys are needed!
