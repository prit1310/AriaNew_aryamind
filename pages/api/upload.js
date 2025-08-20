import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import prisma from '@/lib/prisma';
import fetch from 'node-fetch';
import FormData from 'form-data';

// Plan upload limits (move to top-level scope)
const planLimits = {
  Basic: { pdfUpload: 10, csvUpload: 5 },
  Professional: { pdfUpload: 50, csvUpload: 25 },
  'Advanced Plan': { pdfUpload: 100, csvUpload: 50 },
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log('Upload handler called', new Date().toISOString());
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check session first
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Ensure the uploads directory exists before using formidable
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Parse form with formidable
    const form = new IncomingForm({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 25 * 1024 * 1024, // 25MB
    });

    // Wrap form.parse in Promise to ensure proper response handling
    const parseFormData = () => {
      return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
          try {
            if (err) {
              // Log error activity
              try {
                const session = await getServerSession(req, res, authOptions);
                if (session?.user?.email) {
                  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
                  if (user) {
                    await prisma.activityLog.create({
                      data: {
                        userId: user.id,
                        type: 'upload',
                        detail: 'File upload error: ' + err.message,
                        status: 'error',
                      },
                    });
                  }
                }
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 400, message: 'File upload error' });
              return;
            }

            // Log the full files and fields for debugging
            console.log('Form fields:', fields);
            console.log('Form files:', files);

            // formidable v3+ returns arrays for files
            let file = files.file;
            if (Array.isArray(file)) file = file[0];
            if (!file) {
              // Log error activity
              try {
                const user = await prisma.user.findUnique({ where: { email: session.user.email } });
                if (user) {
                  await prisma.activityLog.create({
                    data: {
                      userId: user.id,
                      type: 'upload',
                      detail: 'No file uploaded',
                      status: 'error',
                    },
                  });
                }
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 400, message: 'No file uploaded' });
              return;
            }

            // Fallbacks for mimetype and filename
            const mimetype = file.mimetype || file.type || '';
            const filename = file.originalFilename || file.name || file.filepath || file.path || '';
            console.log('Uploaded file mimetype:', mimetype, 'filename:', filename);

            const allowed = [
              'application/pdf',
              'application/octet-stream', // fallback for some browsers
              'application/x-pdf',
              'application/acrobat',
              'applications/vnd.pdf',
              'text/pdf',
              'text/x-pdf',
              'text/csv',
              'application/vnd.ms-excel',
              'application/csv',
              'application/x-csv',
              'text/x-csv',
            ];

            const ext = filename.split('.').pop().toLowerCase();
            const isPDF = (mimetype && mimetype.includes('pdf')) || ext === 'pdf';
            const isCSV = (mimetype && mimetype.includes('csv')) || ext === 'csv';

            if ((!mimetype && !ext) || (!allowed.includes(mimetype) && !isPDF && !isCSV)) {
              if (file.filepath) {
                fs.unlinkSync(file.filepath);
              }
              // Log error activity
              try {
                const user = await prisma.user.findUnique({ where: { email: session.user.email } });
                if (user) {
                  await prisma.activityLog.create({
                    data: {
                      userId: user.id,
                      type: 'upload',
                      detail: 'Invalid file type: ' + mimetype + ', ' + filename,
                      status: 'error',
                    },
                  });
                }
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 400, message: 'Invalid file type', mimetype, filename, ext });
              return;
            }

            // Determine type
            const type = isPDF ? 'pdf' : 'csv';

            // Use session email instead of form email
            const email = session.user.email;
            if (!email) {
              if (file.filepath) fs.unlinkSync(file.filepath);
              // Log error activity
              try {
                const user = await prisma.user.findUnique({ where: { email: session.user.email } });
                if (user) {
                  await prisma.activityLog.create({
                    data: {
                      userId: user.id,
                      type: 'upload',
                      detail: 'No email in session',
                      status: 'error',
                    },
                  });
                }
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 400, message: 'No email in session' });
              return;
            }

            if (!prisma.user) {
              // Log error activity
              try {
                const user = await prisma.user.findUnique({ where: { email: session.user.email } });
                if (user) {
                  await prisma.activityLog.create({
                    data: {
                      userId: user.id,
                      type: 'upload',
                      detail: 'Prisma client is not initialized or user model is missing.',
                      status: 'error',
                    },
                  });
                }
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 500, message: 'Prisma client is not initialized or user model is missing.' });
              return;
            }

            // Find user and include subscription plan
            let user = await prisma.user.findUnique({
              where: { email },
              include: { subscriptionPlan: true }
            });

            if (!user) {
              if (file.filepath) fs.unlinkSync(file.filepath);
              // Log error activity
              try {
                await prisma.activityLog.create({
                  data: {
                    userId: null,
                    type: 'upload',
                    detail: 'User does not exist: ' + email,
                    status: 'error',
                  },
                });
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 400, message: 'User does not exist', email });
              return;
            }

            const userId = user.id;

            // --- Generate and set username if not exists ---
            const username = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');

            // Update user with username if not set
            if (!user.username) {
              try {
                user = await prisma.user.update({
                  where: { id: userId },
                  data: { username },
                  include: { subscriptionPlan: true }
                });

                // Log username creation
                await prisma.activityLog.create({
                  data: {
                    userId,
                    type: 'username_set',
                    detail: `Username set to: ${username}`,
                    status: 'completed',
                  },
                });

                console.log(`✅ Username set for user ${email}: ${username}`);
              } catch (usernameError) {
                // Handle username conflict
                if (usernameError.code === 'P2002') {
                  // Username already exists, generate a unique one
                  const timestamp = Date.now();
                  const uniqueUsername = `${username}_${timestamp}`;

                  try {
                    user = await prisma.user.update({
                      where: { id: userId },
                      data: { username: uniqueUsername },
                      include: { subscriptionPlan: true }
                    });

                    console.log(`✅ Unique username set for user ${email}: ${uniqueUsername}`);

                    // Log unique username creation
                    await prisma.activityLog.create({
                      data: {
                        userId,
                        type: 'username_set',
                        detail: `Unique username set to: ${uniqueUsername}`,
                        status: 'completed',
                      },
                    });
                  } catch (e) {
                    console.error('Error setting unique username:', e);
                    // Continue with original username for folder creation
                  }
                } else {
                  console.error('Error setting username:', usernameError);
                  // Continue with original username for folder creation
                }
              }
            }

            // Use the username from database or fallback to generated one
            const finalUsername = user.username || username;

            // --- Username and category folder logic ---
            const category = type; // 'pdf' or 'csv'
            const originalFilename = file.originalFilename || file.name || path.basename(file.filepath || file.path);
            const userCategoryDir = path.join(process.cwd(), 'uploads', finalUsername, category);

            // Ensure directory exists
            fs.mkdirSync(userCategoryDir, { recursive: true });

            // New file path
            let newFilePath;
            newFilePath = path.join(userCategoryDir, originalFilename);

            if (file.filepath && fs.existsSync(file.filepath)) {
              try {
                // Use copy + delete instead of rename to avoid EPERM errors
                fs.copyFileSync(file.filepath, newFilePath);
                fs.unlinkSync(file.filepath);
              } catch (moveError) {
                console.error('File move error:', moveError);
                // Log error activity
                try {
                  await prisma.activityLog.create({
                    data: {
                      userId: user.id,
                      type: 'upload',
                      detail: 'File move error: ' + moveError.message,
                      status: 'error',
                    },
                  });
                } catch (e) { /* ignore logging errors */ }
                reject({ status: 500, message: 'File move error', details: moveError.message });
                return;
              }
            } else {
              console.warn('File to move does not exist (may have already been moved):', file.filepath);
              // Log error activity
              try {
                await prisma.activityLog.create({
                  data: {
                    userId: user.id,
                    type: 'upload',
                    detail: 'File to move does not exist: ' + file.filepath,
                    status: 'error',
                  },
                });
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 500, message: 'File to move does not exist', details: file.filepath });
              return;
            }

            // --- Remote upload to agent server ---
            try {
              // Map type and category to agent server URL
              const categoryAgentUrls = {
                pdf: {
                  "Education": "https://41af54e6d83a.ngrok-free.app/upload",
                  "Real Estate": "https://84c4fbf87537.ngrok-free.app/upload",
                  "Hospital": "https://c7cdd045ec46.ngrok-free.app/upload",
                  // Add more as needed
                },
                csv: {
                  "Education": "https://41af54e6d83a.ngrok-free.app/upload-csv",
                  "Real Estate": "https://84c4fbf87537.ngrok-free.app/upload-csv",
                  "Hospital": "https://c7cdd045ec46.ngrok-free.app/upload-csv",
                  // Add more as needed
                }
              };

              // Map type and category to agent message URL (for greeting/end message - PDF only)
              const categoryAgentMessageUrls = {
                pdf: {
                  "Education": "https://41af54e6d83a.ngrok-free.app/message",
                  "Real Estate": "https://84c4fbf87537.ngrok-free.app/message",
                  "Hospital": "https://c7cdd045ec46.ngrok-free.app/message",
                  // Add more as needed
                }
              };

              // Get category from form fields (may be array)
              let categoryValue = category;
              if (Array.isArray(fields.category)) {
                categoryValue = fields.category[0];
              } else if (fields.category) {
                categoryValue = fields.category;
              }

              // Use type (pdf/csv) to select mapping
              const agentServerUrl = (categoryAgentUrls[type] && categoryAgentUrls[type][categoryValue]) || '';
              const agentMessageUrl = (categoryAgentMessageUrls.pdf && categoryAgentMessageUrls.pdf[categoryValue]) || '';

              if (agentServerUrl) {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(newFilePath), originalFilename);
                if (type === 'csv') {
                  formData.append('filename', originalFilename);
                }
                formData.append('username', finalUsername);
                formData.append('category', categoryValue);

                const response = await fetch(agentServerUrl, {
                  method: 'POST',
                  body: formData,
                  headers: formData.getHeaders(),
                });

                if (!response.ok) {
                  const text = await response.text();
                  console.error('Failed to upload to agent server:', text);
                }
              }

              // Send greeting and end message to agent message endpoint (fire-and-forget)
              if (type === 'pdf' && agentMessageUrl) {
                (async () => {
                  try {
                    await fetch(agentMessageUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        username: finalUsername,
                        greetingMessage: fields.greetingMessage || '',
                        endMessage: fields.endMessage || '',
                      }),
                    });
                  } catch (err) {
                    console.error('Failed to send messages to agent message endpoint:', err);
                  }
                })();
              }
            } catch (err) {
              console.error('Error uploading to agent server:', err);
              // Optionally log to activityLog
              // Removed activity log creation
            }

            // Save relative path for DB
            const relativeFilePath = path.relative(path.join(process.cwd(), 'uploads'), newFilePath);

            // Fetch user's plan type from subscriptionPlan relation
            const planType = user.subscriptionPlan?.type || 'Basic';
            const limits = planLimits[planType];

            if (!limits) {
              if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
              // Log error activity
              try {
                await prisma.activityLog.create({
                  data: {
                    userId: user.id,
                    type: 'upload',
                    detail: 'Invalid user plan: ' + planType,
                    status: 'error',
                  },
                });
              } catch (e) { /* ignore logging errors */ }
              reject({ status: 400, message: 'Invalid user plan', plan: planType });
              return;
            }

            // Fetch current usage
            const usage = await prisma.templateUsage.findUnique({ where: { userId } }) || { pdfUploadCount: 0, csvUploadCount: 0 };

            // Check upload limit
            if (type === 'pdf' && usage.pdfUploadCount >= limits.pdfUpload) {
              if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
              // Log error activity
              try {
                await prisma.activityLog.create({
                  data: {
                    userId: user.id,
                    type: 'upload_pdf',
                    detail: `PDF upload limit reached: ${usage.pdfUploadCount}/${limits.pdfUpload}`,
                    status: 'error',
                  },
                });
              } catch (e) { /* ignore logging errors */ }
              reject({
                status: 403,
                message: 'You have reached your PDF upload limit for your current plan.',
                current: usage.pdfUploadCount,
                limit: limits.pdfUpload
              });
              return;
            }

            if (type === 'csv' && usage.csvUploadCount >= limits.csvUpload) {
              if (newFilePath && fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
              // Log error activity
              try {
                await prisma.activityLog.create({
                  data: {
                    userId: user.id,
                    type: 'upload_csv',
                    detail: `CSV upload limit reached: ${usage.csvUploadCount}/${limits.csvUpload}`,
                    status: 'error',
                  },
                });
              } catch (e) { /* ignore logging errors */ }
              reject({
                status: 403,
                message: 'You have reached your CSV upload limit for your current plan.',
                current: usage.csvUploadCount,
                limit: limits.csvUpload
              });
              return;
            }

            try {
              // Save UploadedFile record
              await prisma.uploadedFile.create({
                data: {
                  userId,
                  filename: relativeFilePath, // Save relative path
                  mimetype,
                  size: file.size,
                  type,
                  greetingMessage: type === 'pdf' ? (fields.greetingMessage ? String(fields.greetingMessage) : null) : null,
                  endMessage: type === 'pdf' ? (fields.endMessage ? String(fields.endMessage) : null) : null,
                },
              });

              // Update TemplateUsage counts
              const updatedUsage = await prisma.templateUsage.upsert({
                where: { userId },
                update: {
                  [`${type}UploadCount`]: { increment: 1 },
                },
                create: {
                  userId,
                  pdfUploadCount: type === 'pdf' ? 1 : 0,
                  csvUploadCount: type === 'csv' ? 1 : 0,
                },
              });

              // Log activity
              await prisma.activityLog.create({
                data: {
                  userId,
                  type: type === 'pdf' ? 'upload_pdf' : 'upload_csv',
                  detail: `${filename} (${finalUsername})`,
                  status: 'completed',
                },
              });

              resolve({
                success: true,
                usage: updatedUsage,
                username: finalUsername,
                filePath: relativeFilePath
              });

            } catch (e) {
              // Log error activity
              try {
                await prisma.activityLog.create({
                  data: {
                    userId,
                    type: type === 'pdf' ? 'upload_pdf' : 'upload_csv',
                    detail: 'Database error: ' + e.message,
                    status: 'error',
                  },
                });
              } catch (err) { /* ignore logging errors */ }
              reject({ status: 500, message: 'Database error', details: e.message });
              return;
            }
          } catch (callbackError) {
            console.error('Upload callback error:', callbackError);
            reject({ status: 500, message: 'Internal server error' });
            return;
          }
        });
      });
    };

    // Execute the form parsing and handle the response
    const result = await parseFormData();
    return res.status(200).json(result);

  } catch (outerError) {
    console.error('Upload handler error:', outerError);

    // Handle structured errors from the form parsing
    if (outerError.status && outerError.message) {
      return res.status(outerError.status).json({
        error: outerError.message,
        ...(outerError.mimetype && { mimetype: outerError.mimetype }),
        ...(outerError.filename && { filename: outerError.filename }),
        ...(outerError.ext && { ext: outerError.ext }),
        ...(outerError.email && { email: outerError.email }),
        ...(outerError.plan && { plan: outerError.plan }),
        ...(outerError.current && { current: outerError.current }),
        ...(outerError.limit && { limit: outerError.limit }),
        ...(outerError.details && { details: outerError.details })
      });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}