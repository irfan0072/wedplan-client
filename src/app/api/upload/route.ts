import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');

    const imgbbApiKey =
      process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    // Upload to real ImgBB API if a valid key is configured
    if (imgbbApiKey && !imgbbApiKey.includes('mock_imgbb_api_key')) {
      try {
        const imgbbForm = new FormData();
        imgbbForm.append('image', base64Data);

        const imgbbRes = await fetch(
          `https://api.imgbb.com/1/upload?key=${encodeURIComponent(imgbbApiKey)}`,
          {
            method: 'POST',
            body: imgbbForm,
          }
        );

        const imgbbData = await imgbbRes.json();
        if (imgbbRes.ok && imgbbData?.success && imgbbData?.data?.url) {
          return NextResponse.json({
            success: true,
            url: imgbbData.data.url,
            message: 'Image uploaded to ImgBB successfully!',
          });
        }
        console.warn('ImgBB upload returned non-success, falling back to data URI:', imgbbData);
      } catch (imgbbErr: any) {
        console.warn('ImgBB API error, falling back to data URI:', imgbbErr.message);
      }
    }

    const mimeType = file.type || 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUri,
      message: 'Image processed successfully!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
