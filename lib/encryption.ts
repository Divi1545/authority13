import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const MASTER_KEY = process.env.MASTER_KEY

if (!MASTER_KEY || MASTER_KEY.length < 32) {
  console.error('MASTER_KEY must be set and at least 32 characters long')
}

function getKey(salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(MASTER_KEY!, salt, 100000, 32, 'sha512')
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = getKey(salt)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64')
}

export function decrypt(encryptedData: string): string {
  const buffer = Buffer.from(encryptedData, 'base64')
  
  const salt = buffer.subarray(0, SALT_LENGTH)
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  
  const key = getKey(salt)
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  return decipher.update(encrypted) + decipher.final('utf8')
}

export function maskSecret(secret: string, visibleChars: number = 4): string {
  if (secret.length <= visibleChars) return '****'
  return '****' + secret.slice(-visibleChars)
}
