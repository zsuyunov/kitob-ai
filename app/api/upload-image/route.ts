import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

function getStorageInstance() {
  const apps = getApps();
  if (!apps.length) {
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                         `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      storageBucket,
    });
  }
  return getStorage();
}

async function uploadToBucket(bucket: any, file: File, fileName: string) {
  const timestamp = Date.now();
  const fileNameSafe = fileName.replace(/[^a-z0-9.-]/gi, "_");
  const filePath = `book-covers/${timestamp}_${fileNameSafe}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const fileUpload = bucket.file(filePath);
  await fileUpload.save(buffer, {
    metadata: {
      contentType: file.type,
    },
  });

  await fileUpload.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

  return Response.json({ success: true, url: publicUrl });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json({ success: false, error: "Fayl yuklanmadi" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, error: "Faqat JPEG, JPG va PNG formatlari qo'llab-quvvatlanadi" },
        { status: 400 }
      );
    }

    // Validate file extension
    const fileName = file.name.toLowerCase();
    const validExtensions = [".jpeg", ".jpg", ".png"];
    const hasValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));
    if (!hasValidExtension) {
      return Response.json(
        { success: false, error: "Faqat JPEG, JPG va PNG formatlari qo'llab-quvvatlanadi" },
        { status: 400 }
      );
    }

    const storage = getStorageInstance();
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                      `${process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    
    if (!bucketName) {
      return Response.json({ success: false, error: "Storage bucket sozlanmagan" }, { status: 500 });
    }
    
    let bucket = storage.bucket(bucketName);
    
    // Check if bucket exists, if not use default bucket
    try {
      const [exists] = await bucket.exists();
      if (!exists) {
        console.log(`Bucket ${bucketName} does not exist, using default bucket`);
        bucket = storage.bucket(); // Use default bucket
      }
    } catch (error) {
      console.error("Error checking bucket:", error);
      // Fallback to default bucket
      bucket = storage.bucket(); // Use default bucket
    }
    
    return await uploadToBucket(bucket, file, fileName);
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return Response.json(
      { success: false, error: error.message || "Rasm yuklashda xatolik" },
      { status: 500 }
    );
  }
}
