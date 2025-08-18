import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// ES6 export for Next.js API files
export default prisma;

// CommonJS export for Node.js scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = prisma;
}