import { z } from "zod";

/**
 * Skema terstruktur untuk aturan sertifikat di dalam OpportunityRule.requiredCertificates (JSONB).
 * Semua evaluasi dilakukan secara deterministik menggunakan kode, bukan tebakan AI.
 */
export const AcceptedCertificateCodeSchema = z.object({
  code: z.string().min(1), // Contoh: "TOEFL_IBT", "IELTS", "DUOLINGO", "JLPT_N2", "AWS_CCP"
  displayName: z.string().min(1), // Contoh: "TOEFL iBT", "IELTS Academic"
  minScore: z.number().nonnegative().optional(), // Contoh: 78 untuk TOEFL iBT, 6.0 untuk IELTS
});

export const CertificateRequirementRuleSchema = z.object({
  id: z.string().min(1), // Contoh: "req-english-proficiency"
  category: z.enum([
    "ENGLISH_PROFICIENCY",
    "OTHER_LANGUAGE",
    "TECHNICAL_CLOUD",
    "DOMAIN_PROFESSIONAL",
    "COMPETITION_AWARD",
  ]),
  label: z.string().min(1), // Contoh: "Sertifikat Kemampuan Bahasa Inggris Resmi"
  acceptedCodes: z.array(AcceptedCertificateCodeSchema).min(1),
  /**
   * Berapa hari setelah deadline pendaftaran sertifikat tersebut masih harus berlaku.
   * Default 0 artinya sertifikat tidak boleh kedaluwarsa pada hari penutupan pendaftaran.
   */
  mustBeValidUntilDaysAfterDeadline: z.number().int().default(0),
  /**
   * Estimasi hari mundur dari deadline untuk persiapan + pendaftaran tes + keluarnya hasil resmi.
   * Digunakan oleh Countdown Plan (misal: H-45 sebelum deadline wajib sudah ambil ujian).
   */
  estPrepAndResultDays: z.number().int().positive().default(45),
});

export const RequiredCertificatesJsonSchema = z.array(
  CertificateRequirementRuleSchema
);

export type AcceptedCertificateCode = z.infer<
  typeof AcceptedCertificateCodeSchema
>;
export type CertificateRequirementRule = z.infer<
  typeof CertificateRequirementRuleSchema
>;
