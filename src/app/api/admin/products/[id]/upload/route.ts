import { NextResponse } from 'next/server';
import { saveFile, calculateSha256 } from '@/lib/storage';
import { getProductById, attachFileToProduct } from '@/lib/products';

<<<<<<< HEAD
/**
 * POST /api/admin/products/[id]/upload
 *
 * Sube un archivo para un producto, calcula SHA-256 automáticamente,
 * lo guarda en storage privado y asocia al producto.
 *
 * Body: multipart/form-data
 *   - file: el archivo binario
 *   - version: opcional, versión del archivo (default: "1.0.0")
 *
 * Response:
 *   {
 *     success: true,
 *     file: {
 *       fileName, fileSize, fileType, storageKey, sha256, version
 *     }
 *   }
 *
 * Requiere header: x-admin-key
 */

=======
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'digistore-admin-change-this-in-production';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authKey = request.headers.get('x-admin-key');
  if (authKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { id } = await params;
<<<<<<< HEAD

  // Verificar producto existe
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json(
      { error: 'product_not_found' },
      { status: 404 },
    );
  }

  // Parsear multipart
=======
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: 'product_not_found' }, { status: 404 });
  }

>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
<<<<<<< HEAD
    return NextResponse.json(
      { error: 'invalid_form_data', message: 'Se espera multipart/form-data con campo file' },
      { status: 400 },
    );
=======
    return NextResponse.json({ error: 'invalid_form_data' }, { status: 400 });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
<<<<<<< HEAD
    return NextResponse.json(
      { error: 'no_file_provided', message: 'Campo "file" requerido' },
      { status: 400 },
    );
  }

  // Verificar tamaño (límite 50MB para Vercel serverless)
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      {
        error: 'file_too_large',
        message: `El archivo supera el límite de 50MB. Tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      },
      { status: 413 },
    );
=======
    return NextResponse.json({ error: 'no_file_provided' }, { status: 400 });
  }

  const MAX_SIZE = 50 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'file_too_large', message: 'Máximo 50MB' }, { status: 413 });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
  }

  const version = (formData.get('version') as string) || '1.0.0';

  try {
<<<<<<< HEAD
    // Leer el archivo a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Calcular SHA-256
    const sha256 = calculateSha256(buffer);

    // Guardar en storage privado
    const fileInfo = await saveFile(buffer, file.name);

    // Asociar al producto
=======
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sha256 = calculateSha256(buffer);
    const fileInfo = await saveFile(buffer, file.name);

>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
    await attachFileToProduct(id, {
      fileName: file.name,
      fileSize: fileInfo.size,
      fileType: fileInfo.mimeType,
      storageKey: fileInfo.storageKey,
      sha256: fileInfo.sha256,
      version,
    });

    return NextResponse.json({
      success: true,
      file: {
        fileName: file.name,
        fileSize: fileInfo.size,
        fileType: fileInfo.mimeType,
        storageKey: fileInfo.storageKey,
        sha256: fileInfo.sha256,
        version,
      },
<<<<<<< HEAD
      message: `Archivo subido. SHA-256: ${sha256.substring(0, 16)}…`,
    });
  } catch (error: any) {
    console.error('[admin/upload] Error:', error);
    return NextResponse.json(
      { success: false, error: 'upload_failed', message: error.message },
      { status: 500 },
    );
=======
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'upload_failed', message: error.message }, { status: 500 });
>>>>>>> 7456423 (feat: panel admin muestra TODOS los productos del scanner + import script)
  }
}
